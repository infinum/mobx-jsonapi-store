import IHeaders from './interfaces/IHeaders';
import IRawResponse from './interfaces/IRawResponse';

import {isBrowser} from './utils';

export type FetchType = (
  method: string,
  url: string,
  body?: Object,
  requestHeaders?: IHeaders,
) => Promise<IRawResponse>;

export type ConfigType = {
  defaultHeaders: IHeaders,
  fetchReference: Function;
  baseFetch: FetchType;
};

export const config: ConfigType = {
  defaultHeaders: {},
  fetchReference: isBrowser && window.fetch,

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
      response = await this.fetchReference(url, {body, method, headers: requestHeaders});
      status = response.status;
      headers = response.headers;
      data = await response.json();
      return {data, headers, requestHeaders, status};
    } catch (error) {
      return {data, error, headers, requestHeaders, status};
    }
  },
};

export function fetch(
  method: string,
  url: string,
  body?: Object,
  requestHeaders?: IHeaders,
): Promise<IRawResponse> {
  return config.baseFetch(method, url, body, requestHeaders);
}
