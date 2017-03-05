import {computed, extendObservable} from 'mobx';
import {IModel} from 'mobx-collection-store';

import IHeaders from './interfaces/IHeaders';
import IRawResponse from './interfaces/IRawResponse';
import * as JsonApi from './interfaces/JsonApi';

import {NetworkStore} from './NetworkStore';
import {Store} from './Store';

import {fetch} from './NetworkUtils';

export class Response {
  public data?: IModel|Array<IModel>;
  public meta?: Object;
  public links?: Object;
  public headers?: IHeaders;
  public requestHeaders?: IHeaders;
  public error?: Array<JsonApi.IError>|Error;

  private __store: Store;

  constructor(response: IRawResponse, store: Store) {
    this.__store = store;
    this.data = store.sync(response.data);
    this.meta = response.data.meta;
    this.links = response.data.links;
    this.headers = response.headers;
    this.requestHeaders = response.requestHeaders;
    this.error = response.data.error || response.error;

    const linkGetter = {};
    Object.keys(this.links).forEach((link) => {
      linkGetter[link] = computed(() => this.__fetchLink(link));
    });

    extendObservable(this, linkGetter);

    Object.freeze(this);
  }

  private __fetchLink(name) {
    return name in this.links
      ? fetch('get', this.links[name], null, this.requestHeaders)
        .then((response) => new Response(response, this.__store))
      : Promise.resolve(new Response({data: null}, this.__store));
  }
}
