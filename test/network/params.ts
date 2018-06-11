import {expect} from 'chai';
import * as fetch from 'isomorphic-fetch';

// tslint:disable:no-string-literal

import {config, ParamArrayType, Store} from '../../src';

import mockApi from '../utils/api';
import {Event, TestStore} from '../utils/setup';

describe('params', () => {
  beforeEach(() => {
    config.fetchReference = fetch;
    config.baseUrl = 'http://example.com/';
  });

  it('should support basic filtering', async () => {
    mockApi({
      name: 'events-1',
      query: (q) => expect(q).to.eql({filter: {name: 'foo'}}),
      url: 'event',
    });

    const store = new Store();
    const events = await store.fetchAll('event', false, {filter: {name: 'foo'}});

    expect(events.data).to.be.an('array');
    expect(events.data['length']).to.equal(4);
  });

  it('should support advanced filtering', async () => {
    mockApi({
      name: 'events-1',
      query: (q) => expect(q).to.eql({filter: {'bar.id': '2', 'name': 'foo'}}),
      url: 'event',
    });

    const store = new Store();
    const events = await store.fetchAll('event', false, {filter: {name: 'foo', bar: {id: 2}}});

    expect(events.data).to.be.an('array');
    expect(events.data['length']).to.equal(4);
  });

  it('should support sorting', async () => {
    mockApi({
      name: 'events-1',
      query: (q) => expect(q).to.eql({sort: 'name'}),
      url: 'event',
    });

    const store = new Store();
    const events = await store.fetchAll('event', false, {sort: 'name'});

    expect(events.data).to.be.an('array');
    expect(events.data['length']).to.equal(4);
  });

  it('should support advanced sorting', async () => {
    mockApi({
      name: 'events-1',
      query: (q) => expect(q).to.eql({sort: '-name,bar.id'}),
      url: 'event',
    });

    const store = new Store();
    const events = await store.fetchAll('event', false, {sort: ['-name', 'bar.id']});

    expect(events.data).to.be.an('array');
    expect(events.data['length']).to.equal(4);
  });

  it('should support inclusion of related resources', async () => {
    mockApi({
      name: 'events-1',
      query: (q) => expect(q).to.eql({include: 'bar'}),
      url: 'event',
    });

    const store = new Store();
    const events = await store.fetchAll('event', false, {include: 'bar'});

    expect(events.data).to.be.an('array');
    expect(events.data['length']).to.equal(4);
  });

  it('should support advanced inclusion of related resources', async () => {
    mockApi({
      name: 'events-1',
      query: (q) => expect(q).to.eql({include: 'bar,bar.baz'}),
      url: 'event',
    });

    const store = new Store();
    const events = await store.fetchAll('event', false, {include: ['bar', 'bar.baz']});

    expect(events.data).to.be.an('array');
    expect(events.data['length']).to.equal(4);
  });

  it('should support saving with inclusion of related resources', async () => {
    const req = mockApi({
      method: 'POST',
      name: 'event-1',
      query: (q) => expect(q).to.eql({include: 'bar'}),
      url: 'events',
    });

    const store = new TestStore();
    const event = store.add<Event>({}, Event.type);
    await event.save({include: 'bar'});
    expect(event.getRecordId()).to.equal(12345);
    expect(req.isDone()).to.equal(true);
  });

  it('should support sparse fields', async () => {
    mockApi({
      name: 'events-1',
      query: (q) => expect(q).to.eql({fields: {foo: 'name', bar: 'name'}}),
      url: 'event',
    });

    const store = new Store();
    const events = await store.fetchAll('event', false, {fields: {foo: 'name', bar: 'name'}});

    expect(events.data).to.be.an('array');
    expect(events.data['length']).to.equal(4);
  });

  it('should support advanced sparse fields', async () => {
    mockApi({
      name: 'events-1',
      query: (q) => expect(q).to.eql({fields: {'foo': 'name', 'bar': 'name', 'bar.baz': 'foo,bar'}}),
      url: 'event',
    });

    const store = new Store();
    const events = await store.fetchAll('event', false, {fields: {
      'bar': 'name',
      'bar.baz': ['foo', 'bar'],
      'foo': 'name',
    }});

    expect(events.data).to.be.an('array');
    expect(events.data['length']).to.equal(4);
  });

  it('should support raw params', async () => {
    mockApi({
      name: 'events-1',
      query: (q) => expect(q).to.eql({a: '1', b: '2', c: '3', sort: 'name'}),
      url: 'event',
    });

    const store = new Store();
    const events = await store.fetchAll('event', false, {
      params: ['a=1', 'b=2', {key: 'c', value: '3'}],
      sort: 'name',
    });

    expect(events.data).to.be.an('array');
    expect(events.data['length']).to.equal(4);
  });

  describe('Param array types', () => {
    afterEach(() => {
      config.paramArrayType = ParamArrayType.COMMA_SEPARATED;
    });

    it('should work with coma separated values', async () => {
      mockApi({
        name: 'events-1',
        query: (q) => expect(q).to.eql({filter: {a: '1,2', b: '3'}}),
        url: 'event',
      });

      config.paramArrayType = ParamArrayType.COMMA_SEPARATED;
      const store = new Store();
      const events = await store.fetchAll('event', false, {filter: {a: [1, 2], b: 3}});

      expect(events.data).to.be.an('array');
      expect(events.data['length']).to.equal(4);
    });

    it('should work with multiple params', async () => {
      mockApi({
        name: 'events-1',
        query: (q) => expect(q).to.eql({filter: {a: ['1', '2'], b: '3'}}),
        url: 'event',
      });

      config.paramArrayType = ParamArrayType.MULTIPLE_PARAMS;
      const store = new Store();
      const events = await store.fetchAll('event', false, {filter: {a: [1, 2], b: 3}});

      expect(events.data).to.be.an('array');
      expect(events.data['length']).to.equal(4);
    });

    it('should work with multiple params', async () => {
      mockApi({
        name: 'events-1',
        query: (q) => expect(q).to.eql({filter: {'a.0': '1', 'a.1': '2', 'b': '3'}}),
        url: 'event',
      });

      config.paramArrayType = ParamArrayType.OBJECT_PATH;
      const store = new Store();
      const events = await store.fetchAll('event', false, {filter: {a: [1, 2], b: 3}});

      expect(events.data).to.be.an('array');
      expect(events.data['length']).to.equal(4);
    });

    it('should work with multiple params', async () => {
      mockApi({
        name: 'events-1',
        query: (q) => expect(q).to.eql({filter: {a: ['1', '2'], b: '3'}}),
        url: 'event',
      });

      config.paramArrayType = ParamArrayType.PARAM_ARRAY;
      const store = new Store();
      const events = await store.fetchAll('event', false, {filter: {a: [1, 2], b: 3}});

      expect(events.data).to.be.an('array');
      expect(events.data['length']).to.equal(4);
    });
  });
});
