import IHeaders from './interfaces/IHeaders';
import IRawResponse from './interfaces/IRawResponse';
import IRequestOptions from './interfaces/IRequestOptions';
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
