import {computed, extendObservable, autorun, observable} from 'mobx';

const expect = require('chai').expect;

import {Store, Record, IDictionary} from '../src';

class User extends Record {
  static type: string = 'user';

  firstName: string;
  lastName: string;

  @computed get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

class Event extends Record {
  static type: string = 'events';
  static refs = {
    organisers: 'organisers',
    images: 'images',
    image: 'images'
  };

  name: string;
  organisers: Array<Organiser>;
  images: Array<Image>;
  image: Image;
  imagesLinks: IDictionary<string>;
}

class Image extends Record {
  static type: string = 'images';
  static refs = {event: 'events'};

  name: string;
  event: Event;
}

class Organiser extends User {
  static type = 'organisers';
  static refs = {image: 'images'};

  image: Image;
}

class Photo extends Record {
  static type = 'photo';
  static defaults = {
    selected: false
  };

  selected: boolean;
}

class TestStore extends Store {
  static types = [User, Event, Image, Organiser, Photo];

  user: Array<User>;
  events: Array<Event>;
  images: Array<Image>;

  organisers: Array<Organiser>;
  photo: Array<Photo>;
}

describe('MobX JsonApi Store', function() {
  it('should initialize', function() {
    const store = new TestStore();
    expect(store).to.be.an('object');
  });

  it('should sync an event', function() {
    const store = new TestStore();
    const event = store.sync({
      data: {
        type: 'events',
        id: 1,
        attributes: {
          name: 'Demo'
        }
      }
    }) as Event;

    expect(event.name).to.equal('Demo');
  });

  it('should find an event', function() {
    const store = new TestStore();
    store.sync({
      data: {
        type: 'events',
        id: 1,
        attributes: {
          name: 'Demo'
        }
      }
    });

    const event = store.find<Event>('events', 1);
    expect(event.id).to.equal(1);
    expect(event.type).to.equal('events');
    expect(event.name).to.equal('Demo');
  });

  it('should trigger autorun on change', function(done) {
    const store = new TestStore();
    store.sync({
      data: {
        type: 'events',
        id: 1,
        attributes: {
          name: 'Demo'
        }
      }
    });

    let name = 'Demo';

    const event = store.find<Event>('events', 1);
    expect(event.name).to.equal('Demo');

    // TODO: It seems autorun is not running on value change - check mobx-collection-store
    autorun(function() {
      expect(event.name).to.equal(name);

      if (name === 'Foo') {
        done();
      }
    });

    name = 'Foo';
    event.name = 'Foo';
  });

  it('should handle relationships with duplicates', function() {
    const store = new TestStore();
    store.sync({
      data: {
        type: 'events',
        id: 1,
        attributes: {
          name: 'Demo'
        },
        relationships: {
          images: {
            data: [{
              type: 'images',
              id: 2
            }]
          }
        }
      },
      included: [{
        type: 'images',
        id: 2,
        attributes: {
          name: 'Header'
        }
      }, {
        type: 'images',
        id: 2,
        attributes: {
          name: 'Header'
        }
      }]
    });

    const event = store.find<Event>('events', 1);
    expect(event.name).to.equal('Demo');
    expect(event.images.length).to.equal(1);

    const images = store.findAll('images');
    expect(images.length).to.eq(1);

    const foo = store.findAll('foo');
    expect(foo.length).to.eq(0);
  });

  it('should handle relationship elements without links attribute', function() {
    const store = new TestStore();
    store.sync({
      data: {
        type: 'events',
        id: 1,
        attributes: {
          name: 'Demo'
        },
        relationships: {
          image: {
            data: {
              type: 'images',
              id: 2
            }
          }
        }
      }
    });

    const event = store.find<Event>('events', 1);
    expect(event.name).to.equal('Demo');
    console.log(event.image);
    expect(event.image).to.equal(null);
  });

  it('should handle circular relations', function() {
    const store = new TestStore();
    store.sync({
      data: {
        type: 'events',
        id: 1,
        attributes: {
          name: 'Demo'
        },
        relationships: {
          images: {
            data: [{
              type: 'images',
              id: 2
            }]
          }
        }
      },
      included: [{
        type: 'images',
        id: 2,
        attributes: {
          name: 'Header'
        },
        relationships: {
          event: {
            data: {
              type: 'events',
              id: 1
            }
          }
        }
      }]
    });

    const event = store.find<Event>('events', 1);
    expect(event.name).to.equal('Demo');
    expect(event.images[0].name).to.equal('Header');
    expect(event.images[0].event.id).to.equal(1);
  });

  it('should return a event with all associated objects', function() {
    const store = new TestStore();
    store.sync({
      data: {
        type: 'events',
        id: 1,
        attributes: {
          name: 'Nordic.js',
          slug: 'nordicjs'
        },
        relationships: {
          images: {
            data: [
              {type: 'images', id: 1},
              {type: 'images', id: 2},
              {type: 'images', id: 3}
            ]
          },
          organisers: {
            data: [
              {type: 'organisers', id: 1},
              {type: 'organisers', id: 2}
            ]
          }
        }
      }, included: [{
        type: 'organisers',
        id: 1,
        attributes: {
          firstName: 'Jonny'
        },
        relationships: {
          event: {
            data: {type: 'events', id: 1}
          },
          image: {
            data: {type: 'images', id: 2}
          }
        }
      }, {
        type: 'organisers',
        id: 2,
        attributes: {
          firstName: 'Martina'
        },
        relationships: {
          event: {
            data: {type: 'events', id: 1}
          },
          image: {
            data: {type: 'images', id: 3}
          }
        }
      }, {
        type: 'images',
        id: 1,
        attributes: {
          name: 'Header'
        },
        relationships: {
          event: {
            data: {type: 'events', id: 1}
          }
        }
      }, {
        type: 'images',
        id: 2,
        attributes: {
          name: 'Organiser Johannes'
        },
        relationships: {
          event: {
            data: {type: 'events', id: 1}
          }
        }
      }, {
        type: 'images',
        id: 3,
        attributes: {
          name: 'Organiser Martina'
        },
        relationships: {
          event: {
            data: {type: 'events', id: 1}
          }
        }
      }]
    });

    const event = store.find<Event>('events', 1);
    expect(event.organisers.length).to.equal(2);
    expect(event.images.length).to.equal(3);
    expect(event.organisers[0].image.id).to.equal(2);
  });

  it('should remove an event', function() {
    const store = new TestStore();
    store.sync({
      data: [
        {id: 1, type: 'events', attributes: {}},
        {id: 2, type: 'events', attributes: {}}
      ]
    });

    const event = store.find<Event>('events', 1);
    expect(event.id).to.equal(1);
    store.remove('events', 1);
    const event2 = store.find<Event>('events', 1);
    expect(event2).to.equal(null);
  });

  it('should remove all events', function() {
    const store = new TestStore();
    store.sync({
      data: [
        {id: 1, type: 'events', attributes: {}},
        {id: 2, type: 'events', attributes: {}}
      ]
    });

    const events = store.findAll<Event>('events');
    expect(events.length).to.equal(2);
    store.removeAll('events');
    const events2 = store.findAll<Event>('events');
    expect(events2).to.deep.equal([]);
  });

  it('should reset', function() {
    const store = new TestStore();
    store.sync({
      data: [{
        type: 'events',
        id: 1,
        attributes: {
          name: 'Demo'
        },
        relationships: {
          images: {
            data: [{
              type: 'images',
              id: 2
            }]
          }
        }
      }, {
        type: 'events',
        id: 2,
        attributes: {
          name: 'Demo 2'
        }
      }],
      included: [{
        type: 'images',
        id: 2,
        attributes: {
          name: 'Header'
        },
        relationships: {
          event: {
            data: {type: 'events', id: 1}
          }
        }
      }]
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

  it('should handle circular relations', function() {
    const store = new TestStore();
    store.sync({
      data: {
        type: 'events',
        id: 1,
        attributes: {
          name: 'Demo'
        },
        relationships: {
          images: {
            links: {
              self: 'http://example.com/events/1/relationships/images'
            }
          }
        }
      }
    });

    const event = store.find<Event>('events', 1);
    expect(event.name).to.equal('Demo');
    expect(event.imagesLinks).to.deep.equal({self: 'http://example.com/events/1/relationships/images'});
  });

  it('should handle serialization/deserialization with circular relations', function() {
    const store = new TestStore();
    store.sync({
      data: {
        type: 'events',
        id: 1,
        attributes: {
          name: 'Demo'
        },
        relationships: {
          images: {
            links: {
              self: 'http://example.com/events/1/relationships/images'
            }
          }
        }
      }
    });

    const data = JSON.stringify(store.toJS());

    const newStore = new TestStore(JSON.parse(data));

    const event = newStore.find<Event>('events', 1);
    expect(event.name).to.equal('Demo');
    expect(event.imagesLinks).to.deep.equal({self: 'http://example.com/events/1/relationships/images'});
  });

  it('should support custom models', function() {
    const store = new TestStore();

    store.sync({
      data: {
        type: 'user',
        id: 1,
        attributes: {
          firstName: 'John',
          lastName: 'Doe'
        }
      }
    });

    const user = store.find<User>('user', 1);
    expect(user.fullName).to.equal('John Doe');
  });

  it('should support default properties', function() {
    const store = new TestStore();

    store.sync({
      data: [
        {
          type: 'user',
          id: 1,
          attributes: {
            firstName: 'John',
            lastName: 'Doe'
          }
        }, {
          type: 'photo',
          id: 1,
          attributes: {
            filename: 'foo.jpg'
          }
        }, {
          type: 'photo',
          id: 2,
          attributes: {
            filename: 'bar.png',
            selected: true
          }
        }, {
          type: 'photo',
          id: 3,
          attributes: {
            filename: 'baz.png',
            selected: false
          }
        }
      ]
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

  it('should support generic records', function() {
    const store = new Store();
    const user = store.sync({
      data: {
        id: 1,
        type: 'user',
        attributes: {
          name: 'John'
        },
        relationships: {
          self: {
            data: {
              id: 1,
              type: 'user'
            }
          }
        }
      }
    }) as Record;

    expect(user['name']).to.equal('John');
    expect(user['self'].id).to.equal(1);
    expect(store.findAll('user').length).to.equal(1);
  });
});
