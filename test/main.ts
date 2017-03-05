import {expect} from 'chai';
import * as fetch from 'isomorphic-fetch';
import {autorun, computed, extendObservable, observable} from 'mobx';

import {config, IDictionary, Record, Store} from '../src';

// tslint:disable:max-classes-per-file
// tslint:disable:no-string-literal

config.fetchReference = fetch;

class User extends Record {
  public static type: string = 'user';

  public firstName: string;
  public lastName: string;

  @computed get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

class Event extends Record {
  public static type: string = 'events';
  public static refs = {
    image: 'images',
    images: 'images',
    organisers: 'organisers',
  };

  public name: string;
  public organisers: Array<Organiser>;
  public images: Array<Image>;
  public image: Image;
  public imagesLinks: IDictionary<string>;
}

class Image extends Record {
  public static type: string = 'images';
  public static refs = {event: 'events'};

  public name: string;
  public event: Event;
}

class Organiser extends User {
  public static type = 'organisers';
  public static refs = {image: 'images'};

  public image: Image;
}

class Photo extends Record {
  public static type = 'photo';
  public static defaults = {
    selected: false,
  };

  public selected: boolean;
}

class TestStore extends Store {
  public static types = [User, Event, Image, Organiser, Photo];

  public user: Array<User>;
  public events: Array<Event>;
  public images: Array<Image>;

  public organisers: Array<Organiser>;
  public photo: Array<Photo>;
}

describe('MobX JsonApi Store', () => {
  it('should initialize', () => {
    const store = new TestStore();
    expect(store).to.be.an('object');
  });

  it('should sync an event', () => {
    const store = new TestStore();
    const event = store.sync({
      data: {
        attributes: {
          name: 'Demo',
        },
        id: 1,
        type: 'events',
      },
    }) as Event;

    expect(event.name).to.equal('Demo');
  });

  it('should find an event', () => {
    const store = new TestStore();
    store.sync({
      data: {
        attributes: {
          name: 'Demo',
        },
        id: 1,
        type: 'events',
      },
    });

    const event = store.find<Event>('events', 1);
    expect(event.id).to.equal(1);
    expect(event.type).to.equal('events');
    expect(event.name).to.equal('Demo');
  });

  it('should trigger autorun on change', (done) => {
    const store = new TestStore();
    store.sync({
      data: {
        attributes: {
          name: 'Demo',
        },
        id: 1,
        type: 'events',
      },
    });

    let name = 'Demo';

    const event = store.find<Event>('events', 1);
    expect(event.name).to.equal('Demo');

    // TODO: It seems autorun is not running on value change - check mobx-collection-store
    autorun(() => {
      expect(event.name).to.equal(name);

      if (name === 'Foo') {
        done();
      }
    });

    name = 'Foo';
    event.name = 'Foo';
  });

  it('should handle relationships with duplicates', () => {
    const store = new TestStore();
    store.sync({
      data: {
        attributes: {
          name: 'Demo',
        },
        id: 1,
        relationships: {
          images: {
            data: [{
              id: 2,
              type: 'images',
            }],
          },
        },
        type: 'events',
      },
      included: [{
        attributes: {
          name: 'Header',
        },
        id: 2,
        type: 'images',
      }, {
        attributes: {
          name: 'Header',
        },
        id: 2,
        type: 'images',
      }],
    });

    const event = store.find<Event>('events', 1);
    expect(event.name).to.equal('Demo');
    expect(event.images.length).to.equal(1);

    const images = store.findAll('images');
    expect(images.length).to.eq(1);

    const foo = store.findAll('foo');
    expect(foo.length).to.eq(0);
  });

  it('should handle relationship elements without links attribute', () => {
    const store = new TestStore();
    store.sync({
      data: {
        attributes: {
          name: 'Demo',
        },
        id: 1,
        relationships: {
          image: {
            data: {
              id: 2,
              type: 'images',
            },
          },
        },
        type: 'events',
      },
    });

    const event = store.find<Event>('events', 1);
    expect(event.name).to.equal('Demo');
    expect(event.image).to.equal(null);
  });

  it('should handle basic circular relations', () => {
    const store = new TestStore();
    store.sync({
      data: {
        attributes: {
          name: 'Demo',
        },
        id: 1,
        relationships: {
          images: {
            data: [{
              id: 2,
              type: 'images',
            }],
          },
        },
        type: 'events',
      },
      included: [{
        attributes: {
          name: 'Header',
        },
        id: 2,
        relationships: {
          event: {
            data: {
              id: 1,
              type: 'events',
            },
          },
        },
        type: 'images',
      }],
    });

    const event = store.find<Event>('events', 1);
    expect(event.name).to.equal('Demo');
    expect(event.images[0].name).to.equal('Header');
    expect(event.images[0].event.id).to.equal(1);
  });

  it('should return a event with all associated objects', () => {
    const store = new TestStore();
    store.sync({
      data: {
        attributes: {
          name: 'Nordic.js',
          slug: 'nordicjs',
        },
        id: 1,
        relationships: {
          images: {
            data: [
              {type: 'images', id: 1},
              {type: 'images', id: 2},
              {type: 'images', id: 3},
            ],
          },
          organisers: {
            data: [
              {type: 'organisers', id: 1},
              {type: 'organisers', id: 2},
            ],
          },
        },
        type: 'events',
      }, included: [{
        attributes: {
          firstName: 'Jonny',
        },
        id: 1,
        relationships: {
          event: {
            data: {type: 'events', id: 1},
          },
          image: {
            data: {type: 'images', id: 2},
          },
        },
        type: 'organisers',
      }, {
        attributes: {
          firstName: 'Martina',
        },
        id: 2,
        relationships: {
          event: {
            data: {type: 'events', id: 1},
          },
          image: {
            data: {type: 'images', id: 3},
          },
        },
        type: 'organisers',
      }, {
        attributes: {
          name: 'Header',
        },
        id: 1,
        relationships: {
          event: {
            data: {type: 'events', id: 1},
          },
        },
        type: 'images',
      }, {
        attributes: {
          name: 'Organiser Johannes',
        },
        id: 2,
        relationships: {
          event: {
            data: {type: 'events', id: 1},
          },
        },
        type: 'images',
      }, {
        attributes: {
          name: 'Organiser Martina',
        },
        id: 3,
        relationships: {
          event: {
            data: {type: 'events', id: 1},
          },
        },
        type: 'images',
      }],
    });

    const event = store.find<Event>('events', 1);
    expect(event.organisers.length).to.equal(2);
    expect(event.images.length).to.equal(3);
    expect(event.organisers[0].image.id).to.equal(2);
  });

  it('should remove an event', () => {
    const store = new TestStore();
    store.sync({
      data: [
        {id: 1, type: 'events', attributes: {}},
        {id: 2, type: 'events', attributes: {}},
      ],
    });

    const event = store.find<Event>('events', 1);
    expect(event.id).to.equal(1);
    store.remove('events', 1);
    const event2 = store.find<Event>('events', 1);
    expect(event2).to.equal(null);
  });

  it('should remove all events', () => {
    const store = new TestStore();
    store.sync({
      data: [
        {id: 1, type: 'events', attributes: {}},
        {id: 2, type: 'events', attributes: {}},
      ],
    });

    const events = store.findAll<Event>('events');
    expect(events.length).to.equal(2);
    store.removeAll('events');
    const events2 = store.findAll<Event>('events');
    expect(events2).to.deep.equal([]);
  });

  it('should reset', () => {
    const store = new TestStore();
    store.sync({
      data: [{
        attributes: {
          name: 'Demo',
        },
        id: 1,
        relationships: {
          images: {
            data: [{
              id: 2,
              type: 'images',
            }],
          },
        },
        type: 'events',
      }, {
        attributes: {
          name: 'Demo 2',
        },
        id: 2,
        type: 'events',
      }],
      included: [{
        attributes: {
          name: 'Header',
        },
        id: 2,
        relationships: {
          event: {
            data: {type: 'events', id: 1},
          },
        },
        type: 'images',
      }],
    });

    const events = store.findAll('events');
    const images = store.findAll('images');
    expect(events.length).to.equal(2);
    expect(images.length).to.equal(1);

    store.reset();

    const events2 = store.findAll('events');
    const images2 = store.findAll('images');
    expect(events2).to.deep.equal([]);
    expect(images2).to.deep.equal([]);
  });

  it('should handle circular relations', () => {
    const store = new TestStore();
    store.sync({
      data: {
        attributes: {
          name: 'Demo',
        },
        id: 1,
        relationships: {
          images: {
            links: {
              self: 'http://example.com/events/1/relationships/images',
            },
          },
        },
        type: 'events',
      },
    });

    const event = store.find<Event>('events', 1);
    expect(event.name).to.equal('Demo');
    expect(event.getRelationshipLinks()['images'])
      .to.deep.equal({self: 'http://example.com/events/1/relationships/images'});
  });

  it('should handle serialization/deserialization with circular relations', () => {
    const store = new TestStore();
    store.sync({
      data: {
        attributes: {
          name: 'Demo',
        },
        id: 1,
        relationships: {
          images: {
            links: {
              self: 'http://example.com/events/1/relationships/images',
            },
          },
        },
        type: 'events',
      },
    });

    const data = JSON.stringify(store.toJS());

    const newStore = new TestStore(JSON.parse(data));

    const event = newStore.find<Event>('events', 1);
    expect(event.name).to.equal('Demo');
    expect(event.getRelationshipLinks()['images'])
      .to.deep.equal({self: 'http://example.com/events/1/relationships/images'});
  });

  it('should support custom models', () => {
    const store = new TestStore();

    store.sync({
      data: {
        attributes: {
          firstName: 'John',
          lastName: 'Doe',
        },
        id: 1,
        type: 'user',
      },
    });

    const user = store.find<User>('user', 1);
    expect(user.fullName).to.equal('John Doe');
  });

  it('should support default properties', () => {
    const store = new TestStore();

    store.sync({
      data: [
        {
          attributes: {
            firstName: 'John',
            lastName: 'Doe',
          },
          id: 1,
          type: 'user',
        }, {
          attributes: {
            filename: 'foo.jpg',
          },
          id: 1,
          type: 'photo',
        }, {
          attributes: {
            filename: 'bar.png',
            selected: true,
          },
          id: 2,
          type: 'photo',
        }, {
          attributes: {
            filename: 'baz.png',
            selected: false,
          },
          id: 3,
          type: 'photo',
        },
      ],
    });

    const user = store.find<User>('user', 1);
    expect(user['selected']).to.be.an('undefined');

    const photo1 = store.find<Photo>('photo', 1);
    expect(photo1.selected).to.equal(false);
    expect(photo1['foo']).to.not.equal(false);
    expect(photo1['foo']).to.be.an('undefined');

    const photo2 = store.find<Photo>('photo', 2);
    expect(photo2.selected).to.equal(true);
    const photo3 = store.find<Photo>('photo', 3);
    expect(photo3.selected).to.equal(false);

    const photos = store.findAll<Photo>('photo');
    const selected = photos.filter((photo) => photo.selected);
    expect(selected.length).to.equal(1);
    expect(selected[0].id).to.equal(2);
  });

  it('should support generic records', () => {
    const store = new Store();
    const user = store.sync({
      data: {
        attributes: {
          name: 'John',
        },
        id: 1,
        relationships: {
          self: {
            data: {
              id: 1,
              type: 'user',
            },
          },
        },
        type: 'user',
      },
    }) as Record;

    expect(user['name']).to.equal('John');
    expect(user['self'].id).to.equal(1);
    expect(store.findAll('user').length).to.equal(1);
  });
});
