# mobx-jsonapi-store
JSON API Store for MobX

[![Build Status](https://travis-ci.org/infinum/mobx-jsonapi-store.svg?branch=master)](https://travis-ci.org/infinum/mobx-jsonapi-store)
[![Dependency Status](https://david-dm.org/infinum/mobx-jsonapi-store.svg)](https://david-dm.org/infinum/mobx-jsonapi-store)
[![devDependency Status](https://david-dm.org/infinum/mobx-jsonapi-store/dev-status.svg)](https://david-dm.org/infinum/mobx-jsonapi-store#info=devDependencies)

Inspired by [yayson](https://github.com/confetti/yayson).

## Installation

```bash
npm install mobx-jsonapi-store
```

## Usage (Store)

### Methods

#### `sync(body)`
* Sync the JSON API response with the store
* Return value will be either a record or an array of records that were parsed from the response

#### `find(type, [id])`
* Returns a record with the given type and id or undefined

#### `findAll(type)`
* Returns an array of records of the given type

#### `remove(type, [id])`
* Remove the selected record (or first record of type if id not given)

#### `removeAll(type)`
* Remove all records of the given type

#### `reset()`
* Clears all records and relationships from the store

## Usage (Record)

JsonApiRecord shouldn't be used directly. It should only be used to extend the record overrides.

### Methods

#### `set(key, value)`

Method used to update the value of a specific record property. Properties can't be updated directly because they're only getters.

## Examples

```javascript
import {computed} from 'mobx';
import {Store, Record} from 'mobx-jsonapi-store';

class User extends Record {
  static type = 'user';

  @computed get fullName() {
    return this.firstName + ' ' + this.lastName;
  }
}

class Photo extends Record {
  static type = 'photo';
  static defaults = {
    selected: false
  };
}

class ExampleStore extends Store {
  static types = [User, Photo];
}

const store = new ExampleStore();

// Get some data (e.g. API call)
store.sync(data);

const user = store.find('user', 1);
console.log(user.fullName); // John doe

const photos = store.findAll('photo');
const selectedPhotos = photos.filter((photo) => photo.selected);
```

## JSON API support
* `data`
* `included`
* `relationships.data`
* `relationships.links`

## License

The MIT License

![](https://assets.infinum.co/assets/brand-logo-9e079bfa1875e17c8c1f71d1fee49cf0.svg) © 2016 Infinum Inc.
