import { IModelConstructor } from 'mobx-collection-store';
import ParamArrayType from './enums/ParamArrayType';
import IDictionary from './interfaces/IDictionary';
import IHeaders from './interfaces/IHeaders';
import IRawResponse from './interfaces/IRawResponse';
import IRequestOptions from './interfaces/IRequestOptions';
import * as JsonApi from './interfaces/JsonApi';
import { Record } from './Record';
import { Response as LibResponse } from './Response';
import { Store } from './Store';
export declare type FetchType = (method: string, url: string, body?: object, requestHeaders?: IHeaders) => Promise<IRawResponse>;
export interface IStoreFetchOpts {
    url: string;
    options?: IRequestOptions;
    data?: object;
    method: string;
    store: Store;
}
export declare type StoreFetchType = (options: IStoreFetchOpts) => Promise<LibResponse>;
export interface IConfigType {
    baseFetch: FetchType;
    baseUrl: string;
    defaultHeaders: IHeaders;
    defaultFetchOptions: IDictionary<any>;
    fetchReference: Function;
    paramArrayType: ParamArrayType;
    storeFetch: StoreFetchType;
    transformRequest: (options: IStoreFetchOpts) => IStoreFetchOpts;
    transformResponse: (response: IRawResponse) => IRawResponse;
}
export declare const config: IConfigType;
export declare function fetch(options: IStoreFetchOpts): Promise<LibResponse>;
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
 * @param {object} [data] Request body
 * @param {IHeaders} [headers] Headers to be sent
 * @param {IRequestOptions} [options] Server options
 * @returns {Promise<Response>} Resolves with a Response object
 */
export declare function create(store: Store, url: string, data?: object, headers?: IHeaders, options?: IRequestOptions): Promise<LibResponse>;
/**
 * API call used to update data on the server
 *
 * @export
 * @param {Store} store Related Store
 * @param {string} url API call URL
 * @param {object} [data] Request body
 * @param {IHeaders} [headers] Headers to be sent
 * @param {IRequestOptions} [options] Server options
 * @returns {Promise<Response>} Resolves with a Response object
 */
export declare function update(store: Store, url: string, data?: object, headers?: IHeaders, options?: IRequestOptions): Promise<LibResponse>;
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
export declare function handleResponse(record: Record, prop?: string): (response: LibResponse) => Record;
export declare function prefixUrl(url: any): string;
export declare function buildUrl(type: number | string, id?: number | string, model?: IModelConstructor, options?: IRequestOptions): string;
