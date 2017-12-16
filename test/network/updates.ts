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
      }, 'event');
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
      }, 'event');

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

    it('should add a referenced record', async () => {
      class Foo extends Record {
        public static type = 'event';
      }

      // tslint:disable-next-line:max-classes-per-file
      class Bar extends Record {
        public static type = 'bar';
        public static refs = {
          foo: 'event',
        };

        public foo: Foo;
        public fooId: number|string;
      }

      // tslint:disable-next-line:max-classes-per-file
      class Test extends Store {
        public static types = [Foo, Bar];
      }

      const store = new Test();
      const foo = new Foo({
        title: 'Example title',
      });
      store.add(foo);
      const bar = store.add<Bar>({foo}, 'bar');
      const baz = store.add<Record>({}, 'baz');
      expect(bar.foo).to.equal(foo);
      expect(bar.fooId).to.equal(foo.getRecordId());

      baz.assignRef('foo', foo);
      expect(baz['foo']).to.equal(foo);
      expect(baz['fooId']).to.equal(foo.getRecordId());

      mockApi({
        data: JSON.stringify({
          data: foo.toJsonApi(),
        }),
        method: 'POST',
        name: 'event-1',
        url: 'event',
      });

      const data = foo.toJsonApi();
      expect(foo['title']).to.equal('Example title');
      expect(data.id).to.be.an('undefined');
      expect(data.type).to.equal('event');
      expect(data.attributes.id).to.be.an('undefined');
      expect(data.attributes.type).to.be.an('undefined');

      const updated = await foo.save();
      expect(updated['title']).to.equal('Test 1');
      expect(updated).to.equal(foo);
      expect(foo.getRecordId()).to.equal(12345);

      expect(bar.foo).to.equal(foo);
      expect(bar.fooId).to.equal(foo.getRecordId());

      expect(baz['foo']).to.equal(foo);
      expect(baz['fooId']).to.equal(foo.getRecordId());
    });

    it('should add a record with queue (202)', async () => {
      const store = new Store();
      const record = new Record({
        title: 'Example title',
      }, 'event');
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
      expect(queue.getRecordType()).to.equal('queue');

      mockApi({
        name: 'queue-1',
        url: 'events/queue-jobs/123',
      });

      const queue2 = await queue.fetchLink('self', null, true);
      const queueRecord = queue2.data as Record;
      expect(queueRecord.getRecordType()).to.equal('queue');

      mockApi({
        name: 'event-1',
        url: 'events/queue-jobs/123',
      });

      const updatedRes = await queue.fetchLink('self', null, true);
      const updated = updatedRes.data as Record;
      expect(updated.getRecordType()).to.equal('event');

      expect(updated['title']).to.equal('Test 1');
      expect(updated.getRecordId()).to.equal(12345);
      expect(updated).to.equal(record);
    });

    it('should add a record with queue (202) if not in store', async () => {
      const record = new Record({
        title: 'Example title',
      }, 'event');

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
      expect(queue.getRecordType()).to.equal('queue');

      mockApi({
        name: 'queue-1',
        url: 'events/queue-jobs/123',
      });

      const queue2 = await queue.fetchLink('self', null, true);
      const queueRecord = queue2.data as Record;
      expect(queueRecord.getRecordType()).to.equal('queue');

      mockApi({
        name: 'event-1',
        url: 'events/queue-jobs/123',
      });

      const updatedRes = await queue.fetchLink('self', null, true);
      const updated = updatedRes.data as Record;
      expect(updated.getRecordType()).to.equal('event');

      expect(updated['title']).to.equal('Test 1');
      expect(updated.getRecordId()).to.equal(12345);
      expect(updated).to.equal(record);
    });

    it('should add a record with response 204', async () => {
      const store = new Store();
      const record = new Record({
        title: 'Example title',
      }, {id: 123, type: 'event'});
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
        title: 'Example title',
      }, {id: 123, type: 'event'});

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
      }, 'event');
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
      }, 'event');

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

      store.remove(record.getRecordType(), record.getRecordId());

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
      store.remove(record.getRecordType(), record.getRecordId());

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
      expect(event2.getRecordId()).to.equal(12345);
      expect(event2.getRecordType()).to.equal('event');
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
      store.remove(event.getRecordType(), event.getRecordId());

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
      expect(event2.getRecordId()).to.equal(12345);
      expect(event2.getRecordType()).to.equal('event');
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
      store.remove(record.getRecordType(), record.getRecordId());
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
      }, 'event');
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
      const updated = await store.destroy(record.getRecordType() as string, record.getRecordId());
      expect(updated).to.equal(true);
      expect(store.findAll('event').length).to.equal(0);
    });

    it('should remove a local record from store without api calls', async () => {
      const store = new Store();
      const record = new Record({
        title: 'Example title',
      }, 'event');
      store.add(record);

      expect(record['title']).to.equal('Example title');

      expect(store.findAll('event').length).to.equal(1);
      const updated = await store.destroy(record.getRecordType() as string, record.getRecordId());
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
