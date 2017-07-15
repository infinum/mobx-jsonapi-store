import {expect} from 'chai';
import * as fetch from 'isomorphic-fetch';

// tslint:disable:no-string-literal

import {config, Record, Store} from '../../src';

import mockApi from '../utils/api';
import {Event, Image, Organiser, Photo, TestStore, User} from '../utils/setup';

const baseStoreFetch = config.storeFetch;

describe('headers', () => {
  beforeEach(() => {
    config.fetchReference = fetch;
    config.baseUrl = 'http://example.com/';
    config.defaultHeaders = {
      'X-Auth': '12345',
      'content-type': 'application/vnd.api+json',
    };
  });

  it ('should send the default headers', async () => {
    mockApi({
      name: 'events-1',
      reqheaders: {
        'X-Auth': '12345',
      },
      url: 'event',
    });

    const store = new Store();
    const events = await store.fetchAll('event');

    expect(events.data).to.be.an('array');
  });

  it ('should send custom headers', async () => {
    mockApi({
      name: 'events-1',
      reqheaders: {
        'X-Auth': '54321',
      },
      url: 'event',
    });

    const store = new Store();
    const events = await store.fetchAll('event', false, {
      headers: {
        'X-Auth': '54321',
      },
    });

    expect(events.data).to.be.an('array');
  });

  it ('should receive headers', async () => {
    mockApi({
      headers: {
        'X-Auth': '98765',
      },
      name: 'events-1',
      url: 'event',
    });

    const store = new Store();
    const events = await store.fetchAll('event');

    expect(events.data).to.be.an('array');
    expect(events.headers.get('X-Auth')).to.equal('98765');
  });
});
