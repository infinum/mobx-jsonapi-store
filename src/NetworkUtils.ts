import {IModelConstructor} from 'mobx-collection-store';

import ParamArrayType from './enums/ParamArrayType';
import IDictionary from './interfaces/IDictionary';
import IFilters from './interfaces/IFilters';
import IHeaders from './interfaces/IHeaders';
import IRawResponse from './interfaces/IRawResponse';
import IRequestOptions from './interfaces/IRequestOptions';
import IResponseHeaders from './interfaces/IResponseHeaders';
import * as JsonApi from './interfaces/JsonApi';

import {Record} from './Record';
import {Response as LibResponse} from './Response';
import {Store} from './Store';
import {assign, getValue, isBrowser, objectForEach} from './utils';

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
  defaultFetchOptions: IDictionary<any>;
  fetchReference: Function;
  paramArrayType: ParamArrayType;
  storeFetch: StoreFetchType;
  transformRequest: (options: IStoreFetchOpts) => IStoreFetchOpts;
  transformResponse: (response: IRawResponse) => IRawResponse;
}

export const config: IConfigType = {

  /** Base URL for all API calls */
  baseUrl: '/',

  /** Default headers that will be sent to the server */
  defaultHeaders: {
    'content-type': 'application/vnd.api+json',
  },

  /* Default options that will be passed to fetchReference */
  defaultFetchOptions: {},

  /** Reference of the fetch method that should be used */
  /* istanbul ignore next */
  fetchReference: isBrowser && window.fetch && window.fetch.bind(window),

  /** Determines how will the request param arrays be stringified */
  paramArrayType: ParamArrayType.COMMA_SEPARATED, // As recommended by the spec

  /**
   * Base implementation of the fetch function (can be overridden)
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
        const options = assign({}, config.defaultFetchOptions, {
          body: isBodySupported && JSON.stringify(body) || undefined,
          headers: reqHeaders,
          method,
        });
        return this.fetchReference(url, options);
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
   * Base implementation of the stateful fetch function (can be overridden)
   *
   * @param {IStoreFetchOpts} reqOptions API request options
   * @returns {Promise<Response>} Resolves with a response object
   */
  storeFetch(reqOptions: IStoreFetchOpts): Promise<LibResponse> {
    const {
      url,
      options,
      data,
      method = 'GET',
      store,
    } = config.transformRequest(reqOptions);

    return config.baseFetch(method, url, data, options && options.headers)
      .then((response: IRawResponse) => {
        const storeResponse = assign(response, {store});
        return new LibResponse(config.transformResponse(storeResponse), store, options);
      });
  },

  transformRequest(options: IStoreFetchOpts): IStoreFetchOpts {
    return options;
  },

  transformResponse(response: IRawResponse): IRawResponse {
    return response;
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

    /* istanbul ignore else */
    if (href) {
      return read(store, href, requestHeaders, options);
    }
  }
  return Promise.resolve(new LibResponse({data: null}, store));
}

export function handleResponse(record: Record, prop?: string): (response: LibResponse) => Record {
  return (response: LibResponse): Record => {

    /* istanbul ignore if */
    if (response.error) {
      throw response.error;
    }

    if (response.status === 204) {
      record['__persisted'] = true;
      return record as Record;
    } else if (response.status === 202) {
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

function __prepareFilters(filters: IFilters): Array<string> {
  return __parametrize(filters).map((item) => `filter[${item.key}]=${item.value}`);
}

function __prepareSort(sort?: string|Array<string>): Array<string> {
  return sort ? [`sort=${sort}`] : [];
}

function __prepareIncludes(include?: string|Array<string>): Array<string> {
  return include ? [`include=${include}`] : [];
}

function __prepareFields(fields: IDictionary<string|Array<string>>): Array<string> {
  const list = [];

  objectForEach(fields, (key: string) => {
    list.push(`fields[${key}]=${fields[key]}`);
  });

  return list;
}

function __prepareRawParams(params: Array<{key: string, value: string}|string>): Array<string> {
  return params.map((param) => {
    if (typeof param === 'string') {
      return param;
    }
    return `${param.key}=${param.value}`;
  });
}

export function prefixUrl(url) {
  return `${config.baseUrl}${url}`;
}

function __appendParams(url: string, params: Array<string>): string {
  if (params.length) {
    url += '?' + params.join('&');
  }
  return url;
}

function __parametrize(params: object, scope: string = ''): Array<{key: string, value: string}> {
  const list = [];

  objectForEach(params, (key: string) => {
    if (params[key] instanceof Array) {
      if (config.paramArrayType === ParamArrayType.OBJECT_PATH) {
        list.push(...__parametrize(params[key], `${key}.`));
      } else if (config.paramArrayType === ParamArrayType.COMMA_SEPARATED) {
        list.push({key: `${scope}${key}`, value: params[key].join(',')});
      } else if (config.paramArrayType === ParamArrayType.MULTIPLE_PARAMS) {
        list.push(...params[key].map((param) => ({key: `${scope}${key}`, value: param})));
      } else if (config.paramArrayType === ParamArrayType.PARAM_ARRAY) {
        list.push(...params[key].map((param) => ({key: `${scope}${key}][`, value: param})));
      }
    } else if (typeof params[key] === 'object') {
      list.push(...__parametrize(params[key], `${key}.`));
    } else {
      list.push({key: `${scope}${key}`, value: params[key]});
    }
  });

  return list;
}

export function buildUrl(
  type: number|string,
  id?: number|string,
  model?: IModelConstructor,
  options?: IRequestOptions,
) {
  const path: string = model
    ? (getValue<string>(model['endpoint']) || model['baseUrl'] || model.type)
    : type;

  const url: string = id ? `${path}/${id}` : `${path}`;

  const params: Array<string> = [
    ...__prepareFilters((options && options.filter) || {}),
    ...__prepareSort(options && options.sort),
    ...__prepareIncludes(options && options.include),
    ...__prepareFields((options && options.fields) || {}),
    ...__prepareRawParams((options && options.params) || []),
  ];

  return __appendParams(prefixUrl(url), params);
}
