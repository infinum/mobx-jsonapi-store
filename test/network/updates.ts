import {expect} from 'chai';
import * as fetch from 'isomorphic-fetch';

// tslint:disable:no-string-literal

import {config, Record, Store} from '../../src';

import mockApi from '../utils/api';
import {Event, Image, Organiser, Photo, TestStore, User} from '../utils/setup';

const baseStoreFetch = config.storeFetch;

describe('updates', () => {
  beforeEach(() => {
    config.fetchReference = fetch;
    config.baseUrl = 'http://example.com/';
  });

  describe('adding record', () => {
    it('should add a record', async () => {
      const store = new Store();
      const record = new Record({
        title: 'Example title',
        type: 'event',
      });
      store.add(record);

      mockApi({
        data: JSON.stringify({
          data: record.toJsonApi(),
        }),
        method: 'POST',
        name: 'event-1',
        url: 'event',
      });

      const data = record.toJsonApi();
      expect(record['title']).to.equal('Example title');
      expect(data.id).to.be.an('undefined');
      expect(data.type).to.equal('event');
      expect(data.attributes.id).to.be.an('undefined');
      expect(data.attributes.type).to.be.an('undefined');

      const updated = await record.save();
      expect(updated['title']).to.equal('Test 1');
      expect(updated).to.equal(record);
    });

    it('should add a record if not in store', async () => {
      const record = new Record({
        title: 'Example title',
        type: 'event',
      });

      mockApi({
        data: JSON.stringify({
          data: record.toJsonApi(),
        }),
        method: 'POST',
        name: 'event-1',
        url: 'event',
      });

      const data = record.toJsonApi();
      expect(record['title']).to.equal('Example title');
      expect(data.id).to.be.an('undefined');
      expect(data.type).to.equal('event');
      expect(data.attributes.id).to.be.an('undefined');
      expect(data.attributes.type).to.be.an('undefined');

      const updated = await record.save();
      expect(updated['title']).to.equal('Test 1');
      expect(updated).to.equal(record);
    });

    it('should add a record with queue (202)', async () => {
      const store = new Store();
      const record = new Record({
        title: 'Example title',
        type: 'event',
      });
      store.add(record);

      mockApi({
        data: JSON.stringify({
          data: record.toJsonApi(),
        }),
        method: 'POST',
        name: 'queue-1',
        status: 202,
        url: 'event',
      });

      const data = record.toJsonApi();
      expect(record['title']).to.equal('Example title');
      expect(data.id).to.be.an('undefined');
      expect(data.type).to.equal('event');
      expect(data.attributes.id).to.be.an('undefined');
      expect(data.attributes.type).to.be.an('undefined');

      const queue = await record.save();
      expect(queue.type).to.equal('queue');

      mockApi({
        name: 'queue-1',
        url: 'events/queue-jobs/123',
      });

      const queue2 = await queue.fetchLink('self', null, true);
      expect(queue2.data['type']).to.equal('queue');

      mockApi({
        name: 'event-1',
        url: 'events/queue-jobs/123',
      });

      const updatedRes = await queue.fetchLink('self', null, true);
      const updated = updatedRes.data as Record;
      expect(updated.type).to.equal('event');

      expect(updated['title']).to.equal('Test 1');
      expect(updated.id).to.equal(12345);
      expect(updated).to.equal(record);
    });

    it('should add a record with queue (202) if not in store', async () => {
      const record = new Record({
        title: 'Example title',
        type: 'event',
      });

      mockApi({
        data: JSON.stringify({
          data: record.toJsonApi(),
        }),
        method: 'POST',
        name: 'queue-1',
        status: 202,
        url: 'event',
      });

      const data = record.toJsonApi();
      expect(record['title']).to.equal('Example title');
      expect(data.id).to.be.an('undefined');
      expect(data.type).to.equal('event');
      expect(data.attributes.id).to.be.an('undefined');
      expect(data.attributes.type).to.be.an('undefined');

      const queue = await record.save();
      expect(queue.type).to.equal('queue');

      mockApi({
        name: 'queue-1',
        url: 'events/queue-jobs/123',
      });

      const queue2 = await queue.fetchLink('self', null, true);
      expect(queue2.data['type']).to.equal('queue');

      mockApi({
        name: 'event-1',
        url: 'events/queue-jobs/123',
      });

      const updatedRes = await queue.fetchLink('self', null, true);
      const updated = updatedRes.data as Record;
      expect(updated.type).to.equal('event');

      expect(updated['title']).to.equal('Test 1');
      expect(updated.id).to.equal(12345);
      expect(updated).to.equal(record);
    });

    it('should add a record with response 204', async () => {
      const store = new Store();
      const record = new Record({
        id: 123,
        title: 'Example title',
        type: 'event',
      });
      store.add(record);

      mockApi({
        data: JSON.stringify({
          data: record.toJsonApi(),
        }),
        method: 'POST',
        responseFn: () => null,
        status: 204,
        url: 'event',
      });

      const data = record.toJsonApi();
      expect(record['title']).to.equal('Example title');
      expect(data.type).to.equal('event');
      expect(data.attributes.id).to.be.an('undefined');
      expect(data.attributes.type).to.be.an('undefined');

      const updated = await record.save();
      expect(updated['title']).to.equal('Example title');
      expect(updated).to.equal(record);
    });

    it('should add a record with response 204 if not in store', async () => {
      const record = new Record({
        id: 123,
        title: 'Example title',
        type: 'event',
      });

      mockApi({
        data: JSON.stringify({
          data: record.toJsonApi(),
        }),
        method: 'POST',
        responseFn: () => null,
        status: 204,
        url: 'event',
      });

      const data = record.toJsonApi();
      expect(record['title']).to.equal('Example title');
      expect(data.type).to.equal('event');
      expect(data.attributes.id).to.be.an('undefined');
      expect(data.attributes.type).to.be.an('undefined');

      const updated = await record.save();
      expect(updated['title']).to.equal('Example title');
      expect(updated).to.equal(record);
    });

    it('should add a record with client-generated id', async () => {
      const store = new Store();

      // tslint:disable-next-line:max-classes-per-file
      class GenRecord extends Record {
        public static useAutogeneratedIds = true;
        public static autoIdFunction = () => '110ec58a-a0f2-4ac4-8393-c866d813b8d1';
      }

      const record = new GenRecord({
        title: 'Example title',
        type: 'event',
      });
      store.add(record);

      mockApi({
        data: JSON.stringify({
          data: record.toJsonApi(),
        }),
        method: 'POST',
        name: 'event-1c',
        url: 'event',
      });

      const data = record.toJsonApi();
      expect(record['title']).to.equal('Example title');
      expect(data.id).to.be.an('string');
      expect(data.id).to.have.length(36);
      expect(data.type).to.equal('event');
      expect(data.attributes.id).to.be.an('undefined');
      expect(data.attributes.type).to.be.an('undefined');

      const updated = await record.save();
      expect(updated['title']).to.equal('Test 1');
      expect(updated).to.equal(record);
    });

    it('should add a record with client-generated id if not in store', async () => {

      // tslint:disable-next-line:max-classes-per-file
      class GenRecord extends Record {
        public static useAutogeneratedIds = true;
        public static autoIdFunction = () => '110ec58a-a0f2-4ac4-8393-c866d813b8d1';
      }

      const record = new GenRecord({
        title: 'Example title',
        type: 'event',
      });

      mockApi({
        data: JSON.stringify({
          data: record.toJsonApi(),
        }),
        method: 'POST',
        name: 'event-1c',
        url: 'event',
      });

      const data = record.toJsonApi();
      expect(record['title']).to.equal('Example title');
      expect(data.id).to.be.an('string');
      expect(data.id).to.have.length(36);
      expect(data.type).to.equal('event');
      expect(data.attributes.id).to.be.an('undefined');
      expect(data.attributes.type).to.be.an('undefined');

      const updated = await record.save();
      expect(updated['title']).to.equal('Test 1');
      expect(updated).to.equal(record);
    });
  });

  describe('updating record', () => {
    it('should update a record', async () => {
      mockApi({
        name: 'event-1',
        url: 'event/12345',
      });

      const store = new Store();
      const events = await store.fetch('event', 12345);

      const record = events.data as Record;

      mockApi({
        data: JSON.stringify({
          data: record.toJsonApi(),
        }),
        method: 'PATCH',
        name: 'event-1',
        url: 'event/12345',
      });

      const updated = await record.save();
      expect(updated['title']).to.equal('Test 1');
      expect(updated).to.equal(record);
    });

    it('should update a record if not in store', async () => {
      mockApi({
        name: 'event-1',
        url: 'event/12345',
      });

      const store = new Store();
      const events = await store.fetch('event', 12345);

      const record = events.data as Record;

      store.remove(record.type, record.id);

      mockApi({
        data: JSON.stringify({
          data: record.toJsonApi(),
        }),
        method: 'PATCH',
        name: 'event-1',
        url: 'event/12345',
      });

      const updated = await record.save();
      expect(updated['title']).to.equal('Test 1');
      expect(updated).to.equal(record);
    });

    it('should update a record with self link', async () => {
      mockApi({
        name: 'event-1b',
        url: 'event/12345',
      });

      const store = new Store();
      const events = await store.fetch('event', 12345);

      const record = events.data as Record;

      mockApi({
        data: JSON.stringify({
          data: record.toJsonApi(),
        }),
        method: 'PATCH',
        name: 'event-1b',
        url: 'event/1234',
      });

      const updated = await record.save();
      expect(updated['title']).to.equal('Test 1');
      expect(updated).to.equal(record);
    });

    it('should update a record with self link if not in store', async () => {
      mockApi({
        name: 'event-1b',
        url: 'event/12345',
      });

      const store = new Store();
      const events = await store.fetch('event', 12345);

      const record = events.data as Record;
      store.remove(record.type, record.id);

      mockApi({
        data: JSON.stringify({
          data: record.toJsonApi(),
        }),
        method: 'PATCH',
        name: 'event-1b',
        url: 'event/1234',
      });

      const updated = await record.save();
      expect(updated['title']).to.equal('Test 1');
      expect(updated).to.equal(record);
    });

    it('should support updating relationships', async () => {
      mockApi({
        name: 'events-1',
        url: 'event',
      });

      const store = new Store();
      const events = await store.fetchAll('event');
      const event = events.data[0] as Record;

      event['imageId'] = [event['imageId'], '2'];

      mockApi({
        data:  {
          data: [{
            id: '1',
            type: 'image',
          }, {
            id: '2',
            type: 'image',
          }],
        },
        method: 'PATCH',
        name: 'event-1d',
        url: 'images/1',
      });

      const event2 = await event.saveRelationship('image') as Record;
      expect(event2.id).to.equal(12345);
      expect(event2.type).to.equal('event');
      expect(event2['imageId'][0]).to.equal('1');
      expect(event['imageId'][0]).to.equal('1');
      expect(event).to.equal(event2);

    });

    it('should support updating relationships if not in store', async () => {
      mockApi({
        name: 'events-1',
        url: 'event',
      });

      const store = new Store();
      const events = await store.fetchAll('event');
      const event = events.data[0] as Record;
      store.remove(event.type, event.id);

      event['imageId'] = [event['imageId'], '2'];

      mockApi({
        data:  {
          data: [{
            id: '1',
            type: 'image',
          }, {
            id: '2',
            type: 'image',
          }],
        },
        method: 'PATCH',
        name: 'event-1d',
        url: 'images/1',
      });

      const event2 = await event.saveRelationship('image') as Record;
      expect(event2.id).to.equal(12345);
      expect(event2.type).to.equal('event');
      expect(event2['imageId'][0]).to.equal('1');
      expect(event['imageId'][0]).to.equal('1');
      expect(event).to.equal(event2);

    });
  });

  describe('removing record', () => {
    it('should remove a record', async () => {
      mockApi({
        name: 'event-1',
        url: 'event/12345',
      });

      const store = new Store();
      const events = await store.fetch('event', 12345);

      const record = events.data as Record;

      mockApi({
        method: 'DELETE',
        name: 'event-1',
        url: 'event/12345',
      });

      expect(store.findAll('event').length).to.equal(1);
      const updated = await record.remove();
      expect(updated).to.equal(true);
      expect(store.findAll('event').length).to.equal(0);
    });

    it('should remove a record if not in store', async () => {
      mockApi({
        name: 'event-1',
        url: 'event/12345',
      });

      const store = new Store();
      const events = await store.fetch('event', 12345);

      const record = events.data as Record;

      expect(store.findAll('event').length).to.equal(1);
      store.remove(record.type, record.id);
      expect(store.findAll('event').length).to.equal(0);

      mockApi({
        method: 'DELETE',
        name: 'event-1',
        url: 'event/12345',
      });

      const updated = await record.remove();
      expect(updated).to.equal(true);
      expect(store.findAll('event').length).to.equal(0);
    });

    it('should remove a local record without api calls', async () => {
      const store = new Store();
      const record = new Record({
        title: 'Example title',
        type: 'event',
      });
      store.add(record);

      expect(record['title']).to.equal('Example title');

      expect(store.findAll('event').length).to.equal(1);
      const updated = await record.remove();
      expect(updated).to.equal(true);
      expect(store.findAll('event').length).to.equal(0);
    });

    it('should remove a record from the store', async () => {
      mockApi({
        name: 'event-1',
        url: 'event/12345',
      });

      const store = new Store();
      const events = await store.fetch('event', 12345);

      const record = events.data as Record;

      mockApi({
        method: 'DELETE',
        name: 'event-1',
        url: 'event/12345',
      });

      expect(store.findAll('event').length).to.equal(1);
      const updated = await store.destroy(record.type, record.id);
      expect(updated).to.equal(true);
      expect(store.findAll('event').length).to.equal(0);
    });

    it('should remove a local record from store without api calls', async () => {
      const store = new Store();
      const record = new Record({
        title: 'Example title',
        type: 'event',
      });
      store.add(record);

      expect(record['title']).to.equal('Example title');

      expect(store.findAll('event').length).to.equal(1);
      const updated = await store.destroy(record.type, record.id);
      expect(updated).to.equal(true);
      expect(store.findAll('event').length).to.equal(0);
    });

    it('should silently remove an unexisting record', async () => {
      const store = new Store();

      expect(store.findAll('event').length).to.equal(0);
      const updated = await store.destroy('event', 1);
      expect(updated).to.equal(true);
      expect(store.findAll('event').length).to.equal(0);
    });
  });
});
