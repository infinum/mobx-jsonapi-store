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

    const fetchRes = store.fetchAll('event');

    return fetchRes.then(
      () => expect(true).to.equal(false),
      (response) => {
        const err = response.error;
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

    const fetchRes = store.fetchAll('event');

    return fetchRes.then(
      () => expect(true).to.equal(false),
      (response) => expect(response.error).to.have.all.keys(['name', 'message', 'type']),
    );
  });

  it('should handle api error', async () => {
    const store = new Store();

    mockApi({
      name: 'error',
      url: 'event',
    });

    const fetchRes = store.fetchAll('event');

    return fetchRes.then(
      () => expect(true).to.equal(false),
      (response) => expect(response.error[0]).to.be.an('object'),
    );
  });

  it('should handle api error on save', async () => {
    const store = new Store();

    const record = new Record({
      title: 'Test',
    }, 'event');
    store.add(record);

    mockApi({
      method: 'POST',
      name: 'error',
      url: 'event',
    });

    const fetchRes = record.save();

    return fetchRes.then(
      () => expect(true).to.equal(false),
      (response) => expect(response.error[0]).to.be.an('object'),
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

    const fetchRes = response.data[0].remove();

    return fetchRes.then(
      () => expect(true).to.equal(false),
      (resp) => expect(resp.error[0]).to.be.an('object'),
    );
  });
});
