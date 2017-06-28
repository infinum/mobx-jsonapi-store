import IDictionary from './interfaces/IDictionary';
import IHeaders from './interfaces/IHeaders';
import IRawResponse from './interfaces/IRawResponse';
import IRequestOptions from './interfaces/IRequestOptions';
import IResponseHeaders from './interfaces/IResponseHeaders';
import * as JsonApi from './interfaces/JsonApi';

import {Record} from './Record';
import {Response as LibResponse} from './Response';
import {Store} from './Store';
import {assign, isBrowser} from './utils';

export type FetchType = (
  method: string,
  url: string,
  body?: object,
  requestHeaders?: IHeaders,
) => Promise<IRawResponse>;

export interface IStoreFetchOpts {
  url: string;
  options?: IRequestOptions;
  data?: object;
  method: string;
  store: Store;
}

export type StoreFetchType = (options: IStoreFetchOpts) => Promise<LibResponse>;

export interface IConfigType {
  baseFetch: FetchType;
  baseUrl: string;
  defaultHeaders: IHeaders;
  fetchReference: Function;
  storeFetch: StoreFetchType;
}

export const config: IConfigType = {

  /** Base URL for all API calls */
  baseUrl: '/',

  /** Default headers that will be sent to the server */
  defaultHeaders: {
    'content-type': 'application/vnd.api+json',
  },

  /** Reference of the fetch method that should be used */
  fetchReference: isBrowser && window.fetch.bind(window),

  /**
   * Base implementation of the fetch function (can be overriden)
   *
   * @param {string} method API call method
   * @param {string} url API call URL
   * @param {object} [body] API call body
   * @param {IHeaders} [requestHeaders] Headers that will be sent
   * @returns {Promise<IRawResponse>} Resolves with a raw response object
   */
  baseFetch(
    method: string,
    url: string,
    body?: object,
    requestHeaders?: IHeaders,
  ): Promise<IRawResponse> {
    let data: JsonApi.IResponse;
    let status: number;
    let headers: IResponseHeaders;

    const request: Promise<void> = Promise.resolve();

    const uppercaseMethod = method.toUpperCase();
    const isBodySupported = uppercaseMethod !== 'GET' && uppercaseMethod !== 'HEAD';

    return request
      .then(() => {
        const reqHeaders: IHeaders = assign({}, config.defaultHeaders, requestHeaders) as IHeaders;
        return this.fetchReference(url, {
          body: isBodySupported && JSON.stringify(body),
          headers: reqHeaders,
          method,
        });
      })
      .then((response: Response) => {
        status = response.status;
        headers = response.headers;
        return response.json();
      })
      .catch((e: Error) => {
        if (status === 204) {
          return null;
        }
        throw e;
      })
      .then((responseData: JsonApi.IResponse) => {
        data = responseData;
        if (status >= 400) {
          throw {
            message: `Invalid HTTP status: ${status}`,
            status,
          };
        }

        return {data, headers, requestHeaders, status};
      })
      .catch((error) => {
        return {data, error, headers, requestHeaders, status};
      });
  },
  /**
   * Base implementation of the stateful fetch function (can be overriden)
   *
   * @param {IStoreFetchOpts} options API request options
   * @returns {Promise<Response>} Resolves with a response object
   */
  storeFetch({
    url,
    options,
    data,
    method = 'GET',
    store,
  }: IStoreFetchOpts): Promise<LibResponse> {
    return config.baseFetch(method, url, data, options && options.headers)
      .then((response: IRawResponse) => new LibResponse(response, store, options));
  },
};

export function fetch(options: IStoreFetchOpts) {
  return config.storeFetch(options);
}

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
): Promise<LibResponse> {
  return config.storeFetch({
    data: null,
    method: 'GET',
    options: {...options, headers},
    store,
    url,
  });
}

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
export function create(
  store: Store,
  url: string,
  data?: object,
  headers?: IHeaders,
  options?: IRequestOptions,
): Promise<LibResponse> {
  return config.storeFetch({
    data,
    method: 'POST',
    options: {...options, headers},
    store,
    url,
  });
}

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
export function update(
  store: Store,
  url: string,
  data?: object,
  headers?: IHeaders,
  options?: IRequestOptions,
): Promise<LibResponse> {
  return config.storeFetch({
    data,
    method: 'PATCH',
    options: {...options, headers},
    store,
    url,
  });
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
): Promise<LibResponse> {
  return config.storeFetch({
    data: null,
    method: 'DELETE',
    options: {...options, headers},
    store,
    url,
  });
}

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
export function fetchLink(
  link: JsonApi.ILink,
  store: Store,
  requestHeaders?: IDictionary<string>,
  options?: IRequestOptions,
): Promise<LibResponse> {
  if (link) {
    const href: string = typeof link === 'object' ? link.href : link;
    if (href) {
      return read(store, href, requestHeaders, options);
    }
  }
  return Promise.resolve(new LibResponse({data: null}, store));
}

export function handleResponse(record: Record, prop?: string): (LibResponse) => Record {
  return (response: LibResponse): Record => {
    if (response.error) {
      throw response.error;
    }

    if (response.status === 204) {
      record['__persisted'] = true;
      return record as Record;
    } else if (response.status === 201) {
      (response.data as Record).update({
        __prop__: prop,
        __queue__: true,
        __related__: record,
      } as Object);
      return response.data as Record;
    } else {
      record['__persisted'] = true;
      return response.replaceData(record).data as Record;
    }
  };
}
