import {computed, extendObservable, IComputedValue} from 'mobx';
import {IModel} from 'mobx-collection-store';

import IDictionary from './interfaces/IDictionary';
import IHeaders from './interfaces/IHeaders';
import IRawResponse from './interfaces/IRawResponse';
import IRequestOptions from './interfaces/IRequestOptions';
import IResponseHeaders from './interfaces/IResponseHeaders';
import * as JsonApi from './interfaces/JsonApi';

import {NetworkStore} from './NetworkStore';
import {Record} from './Record';
import {Store} from './Store';

import {fetchLink, read} from './NetworkUtils';

export class Response {

  /**
   * API response data (synced with the store)
   *
   * @type {(IModel|Array<IModel>)}
   * @memberOf Response
   */
  public data?: IModel|Array<IModel>;

  /**
   * API response metadata
   *
   * @type {Object}
   * @memberOf Response
   */
  public meta?: Object;

  /**
   * API reslonse links
   *
   * @type {Object}
   * @memberOf Response
   */
  public links?: IDictionary<JsonApi.ILink>;

  /**
   * The JSON API object returned by the server
   *
   * @type {JsonApi.IJsonApiObject}
   * @memberOf Response
   */
  public jsonapi?: JsonApi.IJsonApiObject;

  /**
   * Headers received from the API call
   *
   * @type {IResponseHeaders}
   * @memberOf Response
   */
  public headers?: IResponseHeaders;

  /**
   * Headers sent to the server
   *
   * @type {IHeaders}
   * @memberOf Response
   */
  public requestHeaders?: IHeaders;

  /**
   * Request error
   *
   * @type {(Array<JsonApi.IError>|Error)}
   * @memberOf Response
   */
  public error?: Array<JsonApi.IError>|Error;

  /**
   * First data page
   *
   * @type {Promise<Response>}
   * @memberOf Response
   */
  public first: Promise<Response>; // Handled by the __fetchLink

  /**
   * Previous data page
   *
   * @type {Promise<Response>}
   * @memberOf Response
   */
  public prev: Promise<Response>; // Handled by the __fetchLink

  /**
   * Next data page
   *
   * @type {Promise<Response>}
   * @memberOf Response
   */
  public next: Promise<Response>; // Handled by the __fetchLink

  /**
   * Last data page
   *
   * @type {Promise<Response>}
   * @memberOf Response
   */
  public last: Promise<Response>; // Handled by the __fetchLink

  /**
   * Received HTTP status
   *
   * @type {number}
   * @memberOf Response
   */
  public status: number;

  /**
   * Related Store
   *
   * @private
   * @type {Store}
   * @memberOf Response
   */
  private __store: Store;

  /**
   * Server options
   *
   * @private
   * @type {IRequestOptions}
   * @memberOf Response
   */
  private __options: IRequestOptions;

  /**
   * Original server response
   *
   * @private
   * @type {IRawResponse}
   * @memberOf Response
   */
  private __response: IRawResponse;

  /**
   * Cache used for the link requests
   *
   * @private
   * @type {IDictionary<Promise<Response>>}
   * @memberOf Response
   */
  private __cache: IDictionary<Promise<Response>> = {};

  constructor(response: IRawResponse, store: Store, options?: IRequestOptions, overrideData?: IModel|Array<IModel>) {
    this.__store = store;
    this.__options = options;
    this.__response = response;
    this.status = response.status;
    this.data = overrideData ? store.add(overrideData) : store.sync(response.data);
    this.meta = (response.data && response.data.meta) || {};
    this.links = (response.data && response.data.links) || {};
    this.jsonapi = (response.data && response.data.jsonapi) || {};
    this.headers = response.headers;
    this.requestHeaders = response.requestHeaders;
    this.error = (response.data && response.data.errors) || response.error;

    const linkGetter: IDictionary<IComputedValue<Promise<Response>>> = {};
    Object.keys(this.links).forEach((link: string) => {
      linkGetter[link] = computed(() => this.__fetchLink(link));
    });

    extendObservable(this, linkGetter);

    Object.freeze(this);
  }

  /**
   * Replace the response record with a different record. Used to replace a record while keeping the same reference
   *
   * @param {IModel} data New data
   * @returns {Response}
   *
   * @memberOf Response
   */
  public replaceData(data: IModel): Response {
    const record: Record = this.data as Record;
    if (record === data) {
      return this;
    }
    this.__store.remove(record.type, record.id);
    data.update(record.toJS());

    // tslint:disable-next-line:no-string-literal
    data['__data'].id = record.id;
    return new Response(this.__response, this.__store, this.__options, data);
  }

  /**
   * Function called when a link is beeing fetched. The returned value is cached
   *
   * @private
   * @param {any} name Link name
   * @returns Promise that resolves with a Response object
   *
   * @memberOf Response
   */
  private __fetchLink(name) {
    if (!this.__cache[name]) {
      const link: JsonApi.ILink = name in this.links ? this.links[name] : null;
      this.__cache[name] = fetchLink(link, this.__store, this.requestHeaders, this.__options);
    }
    return this.__cache[name];
  }
}
