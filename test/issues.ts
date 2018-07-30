import {expect} from 'chai';
import * as fetch from 'isomorphic-fetch';
import {computed} from 'mobx';

// tslint:disable:no-string-literal
// tslint:disable:max-classes-per-file

import {config, Record, Store} from '../src';

import mockApi from './utils/api';
import {Event, Image, Organiser, Photo, TestStore, User} from './utils/setup';

describe('Reported issues', () => {
  beforeEach(() => {
    config.fetchReference = fetch;
    config.baseUrl = 'http://example.com/';
  });

  describe('Issue #29', () => {
    it('should return both units', async () => {
      class UnitRecord extends Record {
        public static type = 'units';
        public static refs = { organization: 'organizations' };

        public organization?: OrganizationRecord;
      }

      class OrganizationRecord extends Record {
        public static type = 'organizations';
        public static refs = {
          units: {
            model: 'units',
            property: 'organization',
          },
        };

        public name: string;
        public units: Array<UnitRecord>;
      }

      class ApiStore extends Store {
        public static types = [OrganizationRecord, UnitRecord];

        public organizations: Array<OrganizationRecord>;
        public units: Array<UnitRecord>;
      }

      const store = new ApiStore();

      mockApi({
        name: 'issue-29',
        query: {include: 'units'},
        url: 'organizations',
      });

      const response = await store.fetchAll('organizations', undefined, {include: 'units'});

      const org = response.data[0] as OrganizationRecord;

      expect(org.getRecordId()).to.equal('ORG-A');
      expect(org.units).to.be.an('array');
    });
  });

  describe('fetch issues', () => {
    beforeEach(() => {
      this.defaultFetch = config.fetchReference;
    });

    afterEach(() => {
      config.fetchReference = this.defaultFetch;
    });

    it('should not send a body on GET and HEAD', async () => {
      config.fetchReference = async (url, options) => {
        expect(options.body).to.be.an('undefined');

        // Mock response
        return {
          status: 204,
          async json() {
            return {};
          },
        };
      };

      const store = new Store();
      const events = await store.fetchAll('event');
    });
  });

  describe('save creates a new model', () => {
    it('should update the existing generic model', async () => {
      const store = new Store();
      const record = new Record({
        password: 'hunter2',
        username: 'foobar',
      }, 'sessions');
      store.add(record);

      mockApi({
        method: 'POST',
        name: 'session-1',
        url: 'sessions',
      });

      const updated = await record.save();
      expect(updated).to.equal(record);
      expect(store.length).to.equal(1);
    });

    it('should update the existing custom model', async () => {
      class Session extends Record {}
      Session.type = 'sessions';
      Session.endpoint = 'sessions';

      class AppStore extends Store {}
      AppStore.types = [Session];
      const store = new AppStore();

      mockApi({
        method: 'POST',
        name: 'session-1',
        url: 'sessions',
      });

      const login = new Session({email: 'test@example.com', password: 'hunter2'});
      store.add(login);
      const session = await login.save();

      expect(session).to.equal(login);
      expect(store.length).to.equal(1);
      expect(store.find('sessions', 12345)).to.equal(session);
    });
  });

  describe('wrong toJsonApi references when null', () => {
    it('should work', () => {
      class UnitRecord extends Record {
        public static type = 'units';
        public static refs = { organization: 'organizations' };

        public organization?: OrganizationRecord;
        public organizationId?: number|string;
      }

      class OrganizationRecord extends Record {
        public static type = 'organizations';
        public static refs = {
          units: {
            model: 'units',
            property: 'organization',
          },
        };

        public name: string;
        public units: Array<UnitRecord>;
      }

      class ApiStore extends Store {
        public static types = [OrganizationRecord, UnitRecord];

        public organizations: Array<OrganizationRecord>;
        public units: Array<UnitRecord>;
      }

      const store = new ApiStore();
      const unit = new UnitRecord();

      expect(unit.toJsonApi().relationships.organization.data).to.equal(null);

      store.add(unit);

      expect(unit.toJsonApi().relationships.organization.data).to.equal(null);

      unit.organization = new OrganizationRecord({name: 'Foo'});
      expect(unit.toJsonApi().relationships.organization.data['id']).to.equal(unit.organizationId);
      expect(unit.toJsonApi().relationships.organization.data['type']).to.equal('organizations');
    });
  });

  describe('Issue #84 - Server response with null reference', () => {
    it('should remove the reference if null', async () => {
      class EventRecord extends Record {
        public static type = 'event';
        public static refs = { image: 'image' };

        public image?: ImageRecord|Array<ImageRecord>;
      }

      class ImageRecord extends Record {
        public static type = 'image';

        public name: string;
        public event: Array<EventRecord>;
      }

      class ApiStore extends Store {
        public static types = [ImageRecord, EventRecord];

        public image: Array<ImageRecord>;
        public event: Array<EventRecord>;
      }

      const store = new ApiStore();

      mockApi({
        name: 'issue-84a',
        url: 'event/1',
      });

      const response = await store.fetch('event', 1);

      const event = response.data as EventRecord;

      expect(event.image).to.equal(store.image[0]);

      mockApi({
        name: 'issue-84b',
        url: 'event/1',
      });
      await store.fetch('event', 1, true);
      expect(event.image).to.equal(null);

      mockApi({
        name: 'issue-84a',
        url: 'event/1',
      });
      await store.fetch('event', 1, true);
      expect(event.image).to.equal(store.image[0]);

      mockApi({
        name: 'issue-84d',
        url: 'event/1',
      });
      await store.fetch('event', 1, true);
      expect(event.image['length']).to.equal(1);
      expect(event.image[0]).to.equal(store.image[0]);

      mockApi({
        name: 'issue-84e',
        url: 'event/1',
      });
      await store.fetch('event', 1, true);
      expect(event.image['length']).to.equal(0);
    });

    it('should update the reference if not null', async () => {
      class EventRecord extends Record {
        public static type = 'event';
        public static refs = { image: 'image' };

        public image?: ImageRecord;
      }

      class ImageRecord extends Record {
        public static type = 'image';

        public name: string;
        public event: Array<EventRecord>;
      }

      class ApiStore extends Store {
        public static types = [ImageRecord, EventRecord];

        public image: Array<ImageRecord>;
        public event: Array<EventRecord>;
      }

      const store = new ApiStore();

      mockApi({
        name: 'issue-84a',
        url: 'event/1',
      });

      const response = await store.fetch('event', 1);

      const event = response.data as EventRecord;

      expect(event.image).to.equal(store.image[0]);

      mockApi({
        name: 'issue-84c',
        url: 'event/1',
      });
      await store.fetch('event', 1, true);
      expect(event.image).to.equal(store.image[1]);

      mockApi({
        name: 'issue-84a',
        url: 'event/1',
      });
      await store.fetch('event', 1, true);
      expect(event.image).to.equal(store.image[0]);
    });
  });
});
