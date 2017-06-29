import {expect} from 'chai';
import * as fetch from 'isomorphic-fetch';
import {computed} from 'mobx';

// tslint:disable:no-string-literal
// tslint:disable:max-classes-per-file

import {config, Record, Store} from '../src';

import mockApi from './api';
import {Event, Image, Organiser, Photo, TestStore, User} from './setup';

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

      expect(org.id).to.equal('ORG-A');
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
});
