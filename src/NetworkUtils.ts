import IHeaders from './interfaces/IHeaders';
import IRawResponse from './interfaces/IRawResponse';
import IRequestOptions from './interfaces/IRequestOptions';

import {Response} from './Response';
import {Store} from './Store';
import {assign, isBrowser} from './utils';

export type FetchType = (
  method: string,
  url: string,
  body?: Object,
  requestHeaders?: IHeaders,
) => Promise<IRawResponse>;

export type ConfigType = {
  baseFetch: FetchType;
  baseUrl: string;
  defaultHeaders: IHeaders,
  fetchReference: Function;
};

export const config: ConfigType = {

  /** Base URL for all API calls */
  baseUrl: '/',

  /** Default headers that will be sent to the server */
  defaultHeaders: {
    'content-type': 'application/vnd.api+json',
  },

  /** Reference of the fetch method that should be used */
  fetchReference: isBrowser && window.fetch,

  /**
   * Base implementation of the fetch function (can be overriden)
   *
   * @param {string} method API call method
   * @param {string} url API call URL
   * @param {Object} [body] API call body
   * @param {IHeaders} [requestHeaders] Headers that will be sent
   * @returns {Promise<IRawResponse>} Resolves with a raw response object
   */
  async baseFetch(
    method: string,
    url: string,
    body?: Object,
    requestHeaders?: IHeaders,
  ): Promise<IRawResponse> {
    let data;
    let status;
    let headers;
    let response;
    try {
      const reqHeaders = assign({}, config.defaultHeaders, requestHeaders);
      response = await this.fetchReference(url, {
        body: JSON.stringify(body),
        headers: reqHeaders,
        method,
      });
      status = response.status;
      headers = response.headers;
      data = await response.json();

      if (status >= 400) {
        throw new Error(`Invalid HTTP status: ${status}`);
      }

      return {data, headers, requestHeaders, status};
    } catch (error) {
      return {data, error, headers, requestHeaders, status};
    }
  },
};

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
export function read(
  store: Store,
  url: string,
  headers?: IHeaders,
  options?: IRequestOptions,
): Promise<Response> {
  return config.baseFetch('GET', url, null, headers)
    .then((response) => new Response(response, store, options));
}

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
export function create(
  store: Store,
  url: string,
  data?: Object,
  headers?: IHeaders,
  options?: IRequestOptions,
): Promise<Response> {
  return config.baseFetch('POST', url, data, headers)
    .then((response: IRawResponse) => new Response(response, store, options));
}

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
export function update(
  store: Store,
  url: string,
  data?: Object,
  headers?: IHeaders,
  options?: IRequestOptions,
): Promise<Response> {
  return config.baseFetch('PUT', url, data, headers)
    .then((response: IRawResponse) => new Response(response, store, options));
}

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
export function remove(
  store: Store,
  url: string,
  headers?: IHeaders,
  options?: IRequestOptions,
): Promise<Response> {
  return config.baseFetch('DELETE', url, null, headers)
    .then((response: IRawResponse) => new Response(response, store, options));
}
