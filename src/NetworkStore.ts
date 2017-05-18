import {Collection, IModelConstructor} from 'mobx-collection-store';

import IDictionary from './interfaces/IDictionary';
import IFilters from './interfaces/IFilters';
import IHeaders from './interfaces/IHeaders';
import IRequestOptions from './interfaces/IRequestOptions';
import * as JsonApi from './interfaces/JsonApi';
import {config} from './NetworkUtils';
import {objectForEach} from './utils';

export class NetworkStore extends Collection {

  /**
   * Prepare the query params for the API call
   *
   * @protected
   * @param {string} type Record type
   * @param {(number|string)} [id] Record ID
   * @param {JsonApi.IRequest} [data] Request data
   * @param {IRequestOptions} [options] Server options
   * @returns {{
   *     url: string,
   *     data?: Object,
   *     headers: IHeaders,
   *   }} Options needed for an API call
   *
   * @memberOf NetworkStore
   */
  protected __prepareQuery(
    type: string,
    id?: number|string,
    data?: JsonApi.IRequest,
    options?: IRequestOptions,
  ): {
    url: string,
    data?: Object,
    headers: IHeaders,
  } {
    const model: IModelConstructor = this.static.types.filter((item) => item.type === type)[0];
    const path: string = model ? (model['baseUrl'] || model.type) : type;

    const url: string = id ? `${path}/${id}` : `${path}`;
    const headers: IDictionary<string> = options ? options.headers : {};

    const params: Array<string> = [
      ...this.__prepareFilters((options && options.filter) || {}),
      ...this.__prepareSort(options && options.sort),
      ...this.__prepareIncludes(options && options.include),
      ...this.__prepareFields((options && options.fields) || {}),
    ];

    const baseUrl: string = this.__appendParams(this.__prefixUrl(url), params);
    return {data, headers, url: baseUrl};
  }

  protected __prepareFilters(filters: IFilters): Array<string> {
    return this.__parametrize(filters).map((item) => `filter[${item.key}]=${item.value}`);
  }

  protected __prepareSort(sort?: string|Array<string>): Array<string> {
    return sort ? [`sort=${sort}`] : [];
  }

  protected __prepareIncludes(include?: string|Array<string>): Array<string> {
    return include ? [`include=${include}`] : [];
  }

  protected __prepareFields(fields: IDictionary<string|Array<string>>): Array<string> {
    const list = [];

    objectForEach(fields, (key: string) => {
      list.push(`fields[${key}]=${fields[key]}`);
    });

    return list;
  }

  protected __prefixUrl(url) {
    return `${config.baseUrl}${url}`;
  }

  protected __appendParams(url: string, params: Array<string>): string {
    if (params.length) {
      url += '?' + params.join('&');
    }
    return url;
  }

  private __parametrize(params: object, scope: string = ''): Array<{key: string, value: string}> {
    const list = [];

    objectForEach(params, (key: string) => {
      if (typeof params[key] === 'object') {
        list.push(...this.__parametrize(params[key], `${key}.`));
      } else {
        list.push({key: `${scope}${key}`, value: params[key]});
      }
    });

    return list;
  }
}
