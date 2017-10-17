import {expect} from 'chai';
import * as fetch from 'isomorphic-fetch';

// tslint:disable:no-string-literal

import {config, Record, Store} from '../../src';

import mockApi from '../utils/api';
import {Event, Image, Organiser, Photo, TestStore, User} from '../utils/setup';

const baseStoreFetch = config.storeFetch;

describe('caching', () => {
  beforeEach(() => {
    config.fetchReference = fetch;
    config.baseUrl = 'http://example.com/';
  });

  describe('fetch caching', () => {
    it('should cache fetch requests', async () => {
      mockApi({
        name: 'event-1',
        url: 'event/12345',
      });

      const store = new Store();
      const events = await store.fetch('event', 12345);
      const event = events.data as Event;

      expect(event).to.be.an('object');
      expect(event.getRecordId()).to.equal(12345);

      const events2 = await store.fetch('event', 12345);

      expect(events2).to.equal(events);
    });

    it('should clear fetch cache on removeAll', async () => {
      mockApi({
        name: 'event-1',
        url: 'event/12345',
      });

      const store = new Store();
      const events = await store.fetch('event', 12345);
      const event = events.data as Event;

      expect(event.getRecordId()).to.equal(12345);

      store.removeAll('event');

      const req2 = mockApi({
        name: 'event-1',
        url: 'event/12345',
      });

      const events2 = await store.fetch('event', 12345);
      const event2 = events2.data as Event;
      expect(event2.getRecordId()).to.equal(12345);
      expect(req2.isDone()).to.equal(true);
    });

    it('should ignore fetch cache if force is true', async () => {
      mockApi({
        name: 'event-1',
        url: 'event/12345',
      });

      const store = new Store();
      const events = await store.fetch('event', 12345);
      const event = events.data as Event;

      expect(event).to.be.an('object');
      expect(event.getRecordId()).to.equal(12345);

      mockApi({
        name: 'event-1',
        url: 'event/12345',
      });

      const events2 = await store.fetch('event', 12345, true);
      const event2 = events2.data as Event;

      expect(events2).to.not.equal(events);
      expect(event2).to.be.an('object');
      expect(event2.getRecordId()).to.equal(12345);
    });

    it('should ignore fetch cache if static cache is false', async () => {
      mockApi({
        name: 'event-1',
        url: 'event/12345',
      });

      // tslint:disable-next-line:max-classes-per-file
      class TestStore extends Store {
        public static cache = false;
      }

      const store = new TestStore();
      const events = await store.fetch('event', 12345);
      const event = events.data as Event;

      expect(event).to.be.an('object');
      expect(event.getRecordId()).to.equal(12345);

      mockApi({
        name: 'event-1',
        url: 'event/12345',
      });

      const events2 = await store.fetch('event', 12345);
      const event2 = events2.data as Event;

      expect(events2).to.not.equal(events);
      expect(event2).to.be.an('object');
      expect(event2.getRecordId()).to.equal(12345);
    });

    it('should not cache fetch if the response was an jsonapi error', async () => {
      mockApi({
        name: 'error',
        url: 'event/12345',
      });

      const store = new Store();
      try {
        const events = await store.fetch('event', 12345);
        expect(true).to.equal(false);
      } catch (resp) {
        expect(resp.error).to.be.an('array');
      }

      mockApi({
        name: 'event-1',
        url: 'event/12345',
      });

      const events2 = await store.fetch('event', 12345);
      const event2 = events2.data as Event;

      expect(event2).to.be.an('object');
      expect(event2.getRecordId()).to.equal(12345);
    });

    it('should not cache fetch if the response was an http error', async () => {
      mockApi({
        name: 'event-1',
        status: 500,
        url: 'event/12345',
      });

      const store = new Store();
      try {
        const events = await store.fetch('event', 12345);
        expect(true).to.equal(false);
      } catch (e) {
        expect(e).to.be.an('object');
      }

      mockApi({
        name: 'event-1',
        url: 'event/12345',
      });

      const events2 = await store.fetch('event', 12345);
      const event2 = events2.data as Event;

      expect(event2).to.be.an('object');
      expect(event2.getRecordId()).to.equal(12345);
    });
  });

  describe('fetchAll caching', () => {
    it('should cache fetchAll requests', async () => {
      mockApi({
        name: 'events-1',
        url: 'event',
      });

      const store = new Store();
      const events = await store.fetchAll('event');
      const event = events.data as Array<Event>;

      expect(event).to.be.an('array');
      expect(event.length).to.equal(4);

      const events2 = await store.fetchAll('event');

      expect(events2).to.equal(events);
    });

    it('should clear fetchAll cache on removeAll', async () => {
      mockApi({
        name: 'events-1',
        url: 'event',
      });

      const store = new Store();
      const events = await store.fetchAll('event');
      const event = events.data as Array<Event>;

      expect(event).to.be.an('array');
      expect(event.length).to.equal(4);

      store.removeAll('event');

      const req2 = mockApi({
        name: 'events-1',
        url: 'event',
      });

      const events2 = await store.fetchAll('event');
      expect(events2.data['length']).to.equal(4);
      expect(req2.isDone()).to.equal(true);
    });

    it('should ignore fetchAll cache if force is true', async () => {
      mockApi({
        name: 'events-1',
        url: 'event',
      });

      const store = new Store();
      const events = await store.fetchAll('event');

      expect(events.data).to.be.an('array');
      expect(events.data['length']).to.equal(4);

      mockApi({
        name: 'events-1',
        url: 'event',
      });

      const events2 = await store.fetchAll('event', true);

      expect(events2).to.not.equal(events);
      expect(events2.data).to.be.an('array');
      expect(events2.data['length']).to.equal(4);
    });

    it('should ignore fetchAll cache if static cache is false', async () => {
      mockApi({
        name: 'events-1',
        url: 'event',
      });

      // tslint:disable-next-line:max-classes-per-file
      class TestStore extends Store {
        public static cache = false;
      }

      const store = new TestStore();
      const events = await store.fetchAll('event');

      expect(events.data).to.be.an('array');
      expect(events.data['length']).to.equal(4);

      mockApi({
        name: 'events-1',
        url: 'event',
      });

      const events2 = await store.fetchAll('event');

      expect(events2).to.not.equal(events);
      expect(events2.data).to.be.an('array');
      expect(events2.data['length']).to.equal(4);
    });

    it('should not cache fetchAll if the response was an jsonapi error', async () => {
      mockApi({
        name: 'error',
        url: 'event',
      });

      const store = new Store();
      try {
        const events = await store.fetchAll('event');
        expect(true).to.equal(false);
      } catch (resp) {
        expect(resp.error).to.be.an('array');
      }

      mockApi({
        name: 'events-1',
        url: 'event',
      });

      const events2 = await store.fetchAll('event');

      expect(events2.data).to.be.an('array');
      expect(events2.data['length']).to.equal(4);
    });

    it('should not cache fetchAll if the response was an http error', async () => {
      mockApi({
        name: 'events-1',
        status: 500,
        url: 'event',
      });

      const store = new Store();
      try {
        const events = await store.fetchAll('event');
        expect(true).to.equal(false);
      } catch (e) {
        expect(e).to.be.an('object');
      }

      mockApi({
        name: 'events-1',
        url: 'event',
      });

      const events2 = await store.fetchAll('event');

      expect(events2.data).to.be.an('array');
      expect(events2.data['length']).to.equal(4);
    });

    it('should reset chache when resseting the store', async () => {
      const store = new Store();

      mockApi({name: 'event-1', url: 'event'});
      await store.fetchAll('event');

      store.reset();

      const mockedApi = mockApi({name: 'event-1', url: 'event'});
      await store.fetchAll('event');

      expect(mockedApi.isDone()).to.equal(true);
    });
  });
});
