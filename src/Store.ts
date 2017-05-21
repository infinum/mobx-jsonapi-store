import {action} from 'mobx';

import {Collection, IModel} from 'mobx-collection-store';

import ICache from './interfaces/ICache';
import IDictionary from './interfaces/IDictionary';
import IHeaders from './interfaces/IHeaders';
import IRequestOptions from './interfaces/IRequestOptions';
import * as JsonApi from './interfaces/JsonApi';

import {NetworkStore} from './NetworkStore';
import {fetch, read, remove} from './NetworkUtils';
import {Record} from './Record';
import {Response} from './Response';
import {flattenRecord, mapItems} from './utils';

interface IQueryParams {
  url: string;
  data?: Object;
  headers: IHeaders;
}

export class Store extends NetworkStore {

  /**
   * List of Models that will be used in the collection
   *
   * @static
   *
   * @memberOf Store
   */
  public static types = [Record];

  /**
   * Should the cache be used for API calls when possible
   *
   * @static
   *
   * @memberof Store
   */
  public static cache = true;

  public static: typeof Store;

  /**
   * Cache async actions (can be overriden with force=true)
   *
   * @private
   *
   * @memberOf Store
   */
  private __cache: ICache = {
    fetch: {},
    fetchAll: {},
  };

  /**
   * Import the JSON API data into the store
   *
   * @param {IJsonApiResponse} body - JSON API response
   * @returns {(IModel|Array<IModel>)} - Models parsed from body.data
   *
   * @memberOf Store
   */
  @action public sync(body: JsonApi.IResponse): IModel|Array<IModel> {
    const data: IModel|Array<IModel> = this.__iterateEntries(body, this.__addRecord.bind(this));
    this.__iterateEntries(body, this.__updateRelationships.bind(this));
    return data;
  }

  /**
   * Fetch the records with the given type and id
   *
   * @param {string} type Record type
   * @param {number|string} type Record id
   * @param {boolean} [force] Force fetch (currently not used)
   * @param {IRequestOptions} [options] Server options
   * @returns {Promise<Response>} Resolves with the Response object or rejects with an error
   *
   * @memberOf Store
   */
  public fetch(type: string, id: number|string, force?: boolean, options?: IRequestOptions): Promise<Response> {
    const query: IQueryParams = this.__prepareQuery(type, id, null, options);

    if (!this.static.cache) {
      return this.__doFetch(query, options);
    }

    this.__cache.fetch[type] = this.__cache.fetch[type] || {};

    // TODO: Should we fake the cache if the record already exists?
    if (force || !(query.url in this.__cache.fetch[type])) {
      this.__cache.fetch[type][query.url] = this.__doFetch(query, options)
        .catch((e) => {
          // Don't cache if there was an error
          delete this.__cache.fetch[type][query.url];
          throw e;
        });
    }

    return this.__cache.fetch[type][query.url];
  }

  /**
   * Fetch the first page of records of the given type
   *
   * @param {string} type Record type
   * @param {boolean} [force] Force fetch (currently not used)
   * @param {IRequestOptions} [options] Server options
   * @returns {Promise<Response>} Resolves with the Response object or rejects with an error
   *
   * @memberOf Store
   */
  public fetchAll(type: string, force?: boolean, options?: IRequestOptions): Promise<Response> {
    const query: IQueryParams = this.__prepareQuery(type, null, null, options);

    if (!this.static.cache) {
      return this.__doFetch(query, options);
    }

    if (force || !(query.url in this.__cache.fetchAll)) {
      this.__cache.fetchAll[query.url] = this.__doFetch(query, options)
        .catch((e) => {
          // Don't cache if there was an error
          delete this.__cache.fetchAll[query.url];
          throw e;
        });
    }

    return this.__cache.fetchAll[query.url];
  }

  /**
   * Destroy a record (API & store)
   *
   * @param {string} type Record type
   * @param {(number|string)} id Record id
   * @param {IRequestOptions} [options] Server options
   * @returns {Promise<boolean>} Resolves true or rejects with an error
   *
   * @memberOf Store
   */
  public destroy(type: string, id: number|string, options?: IRequestOptions): Promise<boolean> {
    const model: Record = this.find(type, id) as Record;
    if (model) {
      return model.remove(options);
    }
    return Promise.resolve(true);
  }

  public request(url: string, method: string = 'GET', data?: Object, options?: IRequestOptions): Promise<Response> {
    return fetch({url: this.__prefixUrl(url), options, data, method, store: this});
  }

  /**
   * Make the request and handle the errors
   *
   * @param {IQueryParams} query Request query info
   * @param {IRequestOptions} [options] Server options
   * @returns {Promise<Response>} Resolves with the Response object or rejects with an error
   *
   * @memberof Store
   */
  private __doFetch(query: IQueryParams, options?: IRequestOptions): Promise<Response> {
    return read(this, query.url, query.headers, options).then(this.__handleErrors);
  }

  /**
   * Function used to handle response errors
   *
   * @private
   * @param {Response} response API response
   * @returns API response
   *
   * @memberOf Store
   */
  private __handleErrors(response: Response) {
    if (response.error) {
      throw response.error;
    }
    return response;
  }

  /**
   * Add a new JSON API record to the store
   *
   * @private
   * @param {IJsonApiRecord} obj - Object to be added
   * @returns {IModel}
   *
   * @memberOf Store
   */
  private __addRecord(obj: JsonApi.IRecord): Record {
    const {type, id} = obj;
    let record: Record = this.find(type, id) as Record;
    const flattened: IDictionary<any> = flattenRecord(obj);

    if (record) {
      record.update(flattened);
    } else if (this.static.types.filter((item) => item.type === obj.type).length) {
      record = this.add(flattened, obj.type) as Record;
    } else {
      record = new Record(flattened);
      this.add(record);
    }

    // In case a record is not a real record
    // TODO: Figure out when this happens and try to handle it better
    if (record && typeof record.setPersisted === 'function') {
      record.setPersisted(true);
    }

    return record;
  }

  /**
   * Update the relationships between models
   *
   * @private
   * @param {IJsonApiRecord} obj - Object to be updated
   * @returns {void}
   *
   * @memberOf Store
   */
  private __updateRelationships(obj: JsonApi.IRecord): void {
    const record: IModel = this.find(obj.type, obj.id);
    if (!record) {
      return;
    }
    const refs: Array<string> = obj.relationships ? Object.keys(obj.relationships) : [];
    refs.forEach((ref: string) => {
      const items = obj.relationships[ref].data;
      if (items instanceof Array && items.length < 1) {
        // it's only possible to update items with one ore more refs. Early exit
        return;
      }
      if (items) {
        const models: IModel|Array<IModel> = mapItems<IModel>(items, ({id, type}) => this.find(type, id) || id);
        const type: string = items instanceof Array ? items[0].type : items.type;
        record.assignRef(ref, models, type);
      }
    });
  }

  /**
   * Iterate trough JSON API response models
   *
   * @private
   * @param {IJsonApiResponse} body - JSON API response
   * @param {Function} fn - Function to call for every instance
   * @returns
   *
   * @memberOf Store
   */
  private __iterateEntries(body: JsonApi.IResponse, fn: Function) {
    mapItems((body && body.included) || [], fn);
    return mapItems<IModel>((body && body.data) || [], fn);
  }
}
