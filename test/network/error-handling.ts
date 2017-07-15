import {expect} from 'chai';
import * as fetch from 'isomorphic-fetch';

// tslint:disable:no-string-literal

import {config, Record, Store} from '../../src';

import mockApi from '../utils/api';
import {Event, Image, Organiser, Photo, TestStore, User} from '../utils/setup';

const baseStoreFetch = config.storeFetch;

describe('error handling', () => {
  beforeEach(() => {
    config.fetchReference = fetch;
    config.baseUrl = 'http://example.com/';
  });

  it('should handle network failure', async () => {
    const store = new Store();

    mockApi({
      name: 'events-1',
      status: 404,
      url: 'event',
    });

    const fetch = store.fetchAll('event');

    return fetch.then(
      () => expect(true).to.equal(false),
      (err) => {
        expect(err).to.be.an('object');
        expect(err.status).to.equal(404);
        expect(err.message).to.equal('Invalid HTTP status: 404');
      },
    );
  });

  it('should handle invalid responses', async () => {
    const store = new Store();

    mockApi({
      name: 'invalid',
      url: 'event',
    });

    const fetch = store.fetchAll('event');

    return fetch.then(
      () => expect(true).to.equal(false),
      (err) => expect(err).to.have.all.keys(['name', 'message', 'type']),
    );
  });

  it('should handle api error', async () => {
    const store = new Store();

    mockApi({
      name: 'error',
      url: 'event',
    });

    const fetch = store.fetchAll('event');

    return fetch.then(
      () => expect(true).to.equal(false),
      (err) => expect(err[0]).to.be.an('object'),
    );
  });

  it('should handle api error on save', async () => {
    const store = new Store();

    const record = new Record({
      title: 'Test',
      type: 'event',
    });
    store.add(record);

    mockApi({
      method: 'POST',
      name: 'error',
      url: 'event',
    });

    const fetch = record.save();

    return fetch.then(
      () => expect(true).to.equal(false),
      (err) => expect(err[0]).to.be.an('object'),
    );
  });

  it('should handle api error on remove', async () => {
    const store = new Store();

    mockApi({
      name: 'events-1',
      url: 'event',
    });

    const response = await store.fetchAll('event');

    mockApi({
      method: 'DELETE',
      name: 'error',
      url: 'event/1',
    });

    const fetch = response.data[0].remove();

    return fetch.then(
      () => expect(true).to.equal(false),
      (err) => expect(err[0]).to.be.an('object'),
    );
  });
});
