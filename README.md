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

## Usage (JsonApiStore)

### Methods

#### `sync(body)`
* Sync the JSON API response with the store
* Return value will be either a model or an array of models that were parsed from the response

#### `findAll(type)`
* Returns an array of models of the given type

#### `find(type, [id])`
* Returns a model with the given type and id or undefined

#### `remove(type, [id])`
* Returns all records of a certain type or only a single model with the given id

#### `reset()`
* Clears all records and relationships from the store

## Usage (JsonApiRecord)

JsonApiRecord shouldn't be used directly. It should only be used to extend the model overrides.

### Methods

#### `set(key, value)`

Method used to update the value of a specific model property. Properties can't be updated directly because they're only getters.

## Examples

```javascript
import {computed} from 'mobx';
import {JsonApiStore, JsonApiRecord} from 'mobx-jsonapi-store';

class User extends JsonApiRecord {
  @computed get fullName() {
    return this.firstName + ' ' + this.lastName;
  }
}

const store = new JsonApiStore({
  models: {
    user: User
  },
  defaults: {
    photo: {
      selected: false
    }
  }
});

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
