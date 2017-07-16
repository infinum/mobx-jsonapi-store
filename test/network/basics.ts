import {expect} from 'chai';
import * as fetch from 'isomorphic-fetch';

// tslint:disable:no-string-literal

import {config, Record, Store} from '../../src';

import mockApi from '../utils/api';
import {Event, Image, Organiser, Photo, TestStore, User} from '../utils/setup';

const baseStoreFetch = config.storeFetch;

describe('Network basics', () => {
  beforeEach(() => {
    config.fetchReference = fetch;
    config.baseUrl = 'http://example.com/';
    config.storeFetch = baseStoreFetch;
  });

  it('should fetch the basic data', async () => {
    mockApi({
      name: 'events-1',
      url: 'event',
    });

    const store = new Store();
    const events = await store.fetchAll('event');

    expect(events.data).to.be.an('array');
    expect(events.data['length']).to.equal(4);
    expect(events.data instanceof Array && events.data[0]['title']).to.equal('Test 1');
    expect(events.data[0].getMeta().createdAt).to.equal('2017-03-19T16:00:00.000Z');
    expect(events.data[0]['imageId']).to.equal('1');
    expect(events.data[0]['imageMeta']['foo']).to.equal('bar');

    const data = events.data[0].toJsonApi();
    expect(data.id).to.equal(1);
    expect(data.type).to.equal('event');
    expect(data.attributes.title).to.equal('Test 1');
    expect(data.relationships.image.data).to.eql({type: 'image', id: '1'});
  });

  it('should use the correct types', async () => {
    const store = new TestStore();

    const user = new User({firstName: 'John'});
    const userData = user.toJsonApi();
    expect(userData.type).to.equal('user');

    const wrongEvent = new Event({
      name: 'Test',
      type: 'foo',
    }, 'evil-event');
    const wrongEventData = wrongEvent.toJsonApi();
    expect(wrongEventData.type).to.equal('evil-event');
    expect(wrongEventData.attributes.type).to.equal('foo');
  });

  it('should support storeFetch override', async () => {
    mockApi({
      name: 'events-1',
      url: 'event',
    });

    let hasCustomStoreFetchBeenCalled = false;

    config.storeFetch = (opts) => {
      expect(opts.store).to.equal(store);
      hasCustomStoreFetchBeenCalled = true;
      return baseStoreFetch(opts);
    };

    const store = new Store();
    const events = await store.fetchAll('event');

    expect(events.data).to.be.an('array');
    expect(hasCustomStoreFetchBeenCalled).to.equal(true);
  });

  it('should save the jsonapi data', async () => {
    mockApi({
      name: 'jsonapi-object',
      url: 'event',
    });

    const store = new Store();
    const events = await store.fetchAll('event');

    expect(events.data).to.be.an('array');
    expect(events.data['length']).to.equal(4);
    expect(events.jsonapi).to.be.an('object');
    expect(events.jsonapi.version).to.equal('1.0');
    expect(events.jsonapi.meta.foo).to.equal('bar');
  });

  it('should fetch one item', async () => {
    mockApi({
      name: 'event-1b',
      url: 'event/1',
    });

    const store = new Store();
    const events = await store.fetch('event', 1);

    const record = events.data as Record;

    expect(record).to.be.an('object');
    expect(record['title']).to.equal('Test 1');
    expect(record.getLinks()).to.be.an('object');
    expect(record.getLinks().self).to.equal('http://example.com/event/1234');
  });

  it('should support pagination', async () => {
    mockApi({
      name: 'events-1',
      url: 'event',
    });

    const store = new Store();
    const events = await store.fetchAll('event');

    expect(events.data).to.be.an('array');
    expect(events.data['length']).to.equal(4);
    expect(events.data instanceof Array && events.data[0]['title']).to.equal('Test 1');
    expect(events.links).to.be.an('object');
    expect(events.links['next']['href']).to.equal('http://example.com/event?page=2');
    expect(events.links['next']['meta'].foo).to.equal('bar');

    mockApi({
      name: 'events-2',
      query: {
        page: 2,
      },
      url: 'event',
    });

    const events2 = await events.next;

    expect(events2.data).to.be.an('array');
    expect(events2.data['length']).to.equal(2);
    expect(events2.data instanceof Array && events2.data[0]['title']).to.equal('Test 5');

    mockApi({
      name: 'events-1',
      url: 'event',
    });

    const events1 = await events2.prev;

    expect(events1.data).to.be.an('array');
    expect(events1.data['length']).to.equal(4);
    expect(events1.data instanceof Array && events1.data[0]['title']).to.equal('Test 1');

    const events1b = await events2.prev;
    expect(events1).to.not.equal(events);
    expect(events1).to.equal(events1b);
  });

  it('should support record links', async () => {
    mockApi({
      name: 'event-1',
      url: 'event',
    });

    const store = new Store();
    const events = await store.fetchAll('event');
    const event = events.data as Record;

    mockApi({
      name: 'image-1',
      url: 'images/1',
    });

    const image = await event.fetchLink('image');
    const imageData = image.data  as Image;
    expect(imageData.getRecordId()).to.equal(1);
    expect(imageData.getRecordType()).to.equal('image');
    expect(imageData['url']).to.equal('http://example.com/1.jpg');
  });

  it('should recover if no link defined', async () => {
    mockApi({
      name: 'event-1',
      url: 'event',
    });

    const store = new Store();
    const events = await store.fetchAll('event');
    const event = events.data as Record;

    const foobar = await event.fetchLink('foobar');
    expect(foobar.data).to.be.an('array');
    expect(foobar.data).to.have.length(0);
  });

  it('should support relationship link fetch', async () => {
    mockApi({
      name: 'events-1',
      url: 'event',
    });

    const store = new Store();
    const events = await store.fetchAll('event');
    const event = events.data[0] as Record;

    mockApi({
      name: 'image-1',
      url: 'images/1',
    });

    const image = await event.fetchRelationshipLink('image', 'self');
    const imageData = image.data  as Image;
    expect(imageData.getRecordId()).to.equal(1);
    expect(imageData.getRecordType()).to.equal('image');
    expect(imageData['url']).to.equal('http://example.com/1.jpg');

  });

  it('should support endpoint', async () => {
    // tslint:disable-next-line:max-classes-per-file
    class Event extends Record {
      public static type = 'event';
      public static endpoint = 'foo/event';
    }

    // tslint:disable-next-line:max-classes-per-file
    class Collection extends Store {
      public static types = [Event];
    }

    const store = new Collection();

    mockApi({
      name: 'event-1',
      url: 'foo/event',
    });

    const response = await store.fetchAll('event');
    const event = response.data as Event;
    expect(event.getRecordType()).to.equal('event');
  });

  it('should support functional endpoint', async () => {
    // tslint:disable-next-line:max-classes-per-file
    class Event extends Record {
      public static type = 'event';
      public static endpoint = () => 'foo/event';
    }

    // tslint:disable-next-line:max-classes-per-file
    class Collection extends Store {
      public static types = [Event];
    }

    const store = new Collection();

    mockApi({
      name: 'event-1',
      url: 'foo/event',
    });

    const response = await store.fetchAll('event');
    const event = response.data as Event;
    expect(event.getRecordType()).to.equal('event');
  });

  it('should prepend config.baseUrl to the request url', async () => {
    mockApi({
      name: 'event-1b',
      url: 'event/1',
    });

    const store = new Store();
    const events = await store.request('event/1');

    const record = events.data as Record;

    expect(record['title']).to.equal('Test 1');
  });

  it('should handle the request methods', async () => {
    mockApi({
      method: 'PUT',
      name: 'event-1b',
      url: 'event/1',
    });

    const store = new Store();
    const events = await store.request('event/1', 'PUT');

    const record = events.data as Record;

    expect(record['title']).to.equal('Test 1');
  });

});
