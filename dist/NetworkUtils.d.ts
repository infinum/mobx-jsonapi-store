import IDictionary from './interfaces/IDictionary';
import IHeaders from './interfaces/IHeaders';
import IRawResponse from './interfaces/IRawResponse';
import IRequestOptions from './interfaces/IRequestOptions';
import * as JsonApi from './interfaces/JsonApi';
import { Record } from './Record';
import { Response as LibResponse } from './Response';
import { Store } from './Store';
export declare type FetchType = (method: string, url: string, body?: Object, requestHeaders?: IHeaders) => Promise<IRawResponse>;
interface IConfigType {
    baseFetch: FetchType;
    baseUrl: string;
    defaultHeaders: IHeaders;
    fetchReference: Function;
}
export { IConfigType };
export declare const config: IConfigType;
export declare function fetch({url, options, data, method, store}: {
    url: string;
    options?: IRequestOptions;
    data?: Object;
    method: string;
    store: Store;
}): Promise<LibResponse>;
/**
 * API call used to get data from the server
 *
 * @export
 * @param {Store} store Related Store
 * @param {string} url API call URL
 * @param {IHeaders} [headers] Headers to be sent
 * @param {IRequestOptions} [options] Server options
 * @returns {Promise<Response>} Resolves with a Response object
 */
export declare function read(store: Store, url: string, headers?: IHeaders, options?: IRequestOptions): Promise<LibResponse>;
/**
 * API call used to create data on the server
 *
 * @export
 * @param {Store} store Related Store
 * @param {string} url API call URL
 * @param {Object} [data] Request body
 * @param {IHeaders} [headers] Headers to be sent
 * @param {IRequestOptions} [options] Server options
 * @returns {Promise<Response>} Resolves with a Response object
 */
export declare function create(store: Store, url: string, data?: Object, headers?: IHeaders, options?: IRequestOptions): Promise<LibResponse>;
/**
 * API call used to update data on the server
 *
 * @export
 * @param {Store} store Related Store
 * @param {string} url API call URL
 * @param {Object} [data] Request body
 * @param {IHeaders} [headers] Headers to be sent
 * @param {IRequestOptions} [options] Server options
 * @returns {Promise<Response>} Resolves with a Response object
 */
export declare function update(store: Store, url: string, data?: Object, headers?: IHeaders, options?: IRequestOptions): Promise<LibResponse>;
/**
 * API call used to remove data from the server
 *
 * @export
 * @param {Store} store Related Store
 * @param {string} url API call URL
 * @param {IHeaders} [headers] Headers to be sent
 * @param {IRequestOptions} [options] Server options
 * @returns {Promise<Response>} Resolves with a Response object
 */
export declare function remove(store: Store, url: string, headers?: IHeaders, options?: IRequestOptions): Promise<LibResponse>;
/**
 * Fetch a link from the server
 *
 * @export
 * @param {JsonApi.ILink} link Link URL or a link object
 * @param {Store} store Store that will be used to save the response
 * @param {IDictionary<string>} [requestHeaders] Request headers
 * @param {IRequestOptions} [options] Server options
 * @returns {Promise<LibResponse>} Response promise
 */
export declare function fetchLink(link: JsonApi.ILink, store: Store, requestHeaders?: IDictionary<string>, options?: IRequestOptions): Promise<LibResponse>;
export declare function handleResponse(record: Record, prop?: string): (LibResponse) => Record | Array<Record>;
