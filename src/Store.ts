import {action} from 'mobx';

import {Collection, IModel} from 'mobx-collection-store';

import IDictionary from './interfaces/IDictionary';
import IHeaders from './interfaces/IHeaders';
import IRequestOptions from './interfaces/IRequestOptions';
import * as JsonApi from './interfaces/JsonApi';

import {NetworkStore} from './NetworkStore';
import {read, remove} from './NetworkUtils';
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
    return read(this, query.url, query.headers, options).then(this.__handleErrors);
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
    return read(this, query.url, query.headers, options).then(this.__handleErrors);
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
    const availableModels: Array<string> = this.static.types.map((item) => item.type);

    if (record) {
      record.update(flattened);
    } else if (availableModels.indexOf(obj.type) !== -1) {
      record = this.add(flattened, obj.type) as Record;
    } else {
      record = new Record(flattened);
      this.add(record);
    }
    record.setPersisted(true);
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
