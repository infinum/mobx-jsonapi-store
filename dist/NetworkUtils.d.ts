import IHeaders from './interfaces/IHeaders';
import IRawResponse from './interfaces/IRawResponse';
import IRequestOptions from './interfaces/IRequestOptions';
import { Response } from './Response';
import { Store } from './Store';
export declare type FetchType = (method: string, url: string, body?: Object, requestHeaders?: IHeaders) => Promise<IRawResponse>;
export declare type ConfigType = {
    baseFetch: FetchType;
    baseUrl: string;
    defaultHeaders: IHeaders;
    fetchReference: Function;
};
export declare const config: ConfigType;
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
export declare function read(store: Store, url: string, headers?: IHeaders, options?: IRequestOptions): Promise<Response>;
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
export declare function create(store: Store, url: string, data?: Object, headers?: IHeaders, options?: IRequestOptions): Promise<Response>;
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
export declare function update(store: Store, url: string, data?: Object, headers?: IHeaders, options?: IRequestOptions): Promise<Response>;
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
export declare function remove(store: Store, url: string, headers?: IHeaders, options?: IRequestOptions): Promise<Response>;
