import { IModel } from 'mobx-collection-store';
import IDictionary from './interfaces/IDictionary';
import IHeaders from './interfaces/IHeaders';
import IRawResponse from './interfaces/IRawResponse';
import IRequestOptions from './interfaces/IRequestOptions';
import IResponseHeaders from './interfaces/IResponseHeaders';
import * as JsonApi from './interfaces/JsonApi';
import { Store } from './Store';
export declare class Response {
    /**
     * API response data (synced with the store)
     *
     * @type {(IModel|Array<IModel>)}
     * @memberOf Response
     */
    data?: IModel | Array<IModel>;
    /**
     * API response metadata
     *
     * @type {Object}
     * @memberOf Response
     */
    meta?: Object;
    /**
     * API reslonse links
     *
     * @type {Object}
     * @memberOf Response
     */
    links?: IDictionary<JsonApi.ILink>;
    /**
     * The JSON API object returned by the server
     *
     * @type {JsonApi.IJsonApiObject}
     * @memberOf Response
     */
    jsonapi?: JsonApi.IJsonApiObject;
    /**
     * Headers received from the API call
     *
     * @type {IResponseHeaders}
     * @memberOf Response
     */
    headers?: IResponseHeaders;
    /**
     * Headers sent to the server
     *
     * @type {IHeaders}
     * @memberOf Response
     */
    requestHeaders?: IHeaders;
    /**
     * Request error
     *
     * @type {(Array<JsonApi.IError>|Error)}
     * @memberOf Response
     */
    error?: Array<JsonApi.IError> | Error;
    /**
     * First data page
     *
     * @type {Promise<Response>}
     * @memberOf Response
     */
    first: Promise<Response>;
    /**
     * Previous data page
     *
     * @type {Promise<Response>}
     * @memberOf Response
     */
    prev: Promise<Response>;
    /**
     * Next data page
     *
     * @type {Promise<Response>}
     * @memberOf Response
     */
    next: Promise<Response>;
    /**
     * Last data page
     *
     * @type {Promise<Response>}
     * @memberOf Response
     */
    last: Promise<Response>;
    /**
     * Related Store
     *
     * @private
     * @type {Store}
     * @memberOf Response
     */
    private __store;
    /**
     * Server options
     *
     * @private
     * @type {IRequestOptions}
     * @memberOf Response
     */
    private __options;
    /**
     * Cache used for the link requests
     *
     * @private
     * @type {IDictionary<Promise<Response>>}
     * @memberOf Response
     */
    private __cache;
    constructor(response: IRawResponse, store: Store, options?: IRequestOptions);
    /**
     * Function called when a link is beeing fetched. The returned value is cached
     *
     * @private
     * @param {any} name Link name
     * @returns Promise that resolves with a Response object
     *
     * @memberOf Response
     */
    private __fetchLink(name);
}
