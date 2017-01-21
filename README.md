# mobx-jsonapi-store
JSON API Store for MobX

[![npm version](https://badge.fury.io/js/mobx-jsonapi-store.svg)](https://badge.fury.io/js/mobx-jsonapi-store)
[![Build Status](https://travis-ci.org/infinum/mobx-jsonapi-store.svg?branch=master)](https://travis-ci.org/infinum/mobx-jsonapi-store)
[![Dependency Status](https://david-dm.org/infinum/mobx-jsonapi-store.svg)](https://david-dm.org/infinum/mobx-jsonapi-store)
[![devDependency Status](https://david-dm.org/infinum/mobx-jsonapi-store/dev-status.svg)](https://david-dm.org/infinum/mobx-jsonapi-store#info=devDependencies)

Inspired by [yayson](https://github.com/confetti/yayson).

## Basic example

```javascript
import {Store} from 'mobx-jsonapi-store';

const store = new Store();
const user = store.sync(userResponse); // Assumption: userResponse was received from some API call and it's a valid JSON API response
console.log(user.name); // "John"
```

For more, check out the [advanced example](#advanced-example).

## Installation

```bash
npm install mobx-jsonapi-store
```

## Changes since v1

Two main differences: It's more *robust* and *lightweight*. This might sound weird, but v1 had signifficant overhead because of the way records were handled internally.

### Breaking

* Initial setup of the store is different - the class should be extended and `types` should be added as a static prop
* Initial setup of records is also by extending the `Record` and adding static `type`, `refs` and `defaults` props
* Constructor properties are completely different (compatible with the `toJS()` method)
* `remove` was separated into `remove` and `removeAll` so it works in the same way `find` and `findAll` work
* There shouldn't be more than one instance of a model anymore (in v1, a new instance was created every time it was retreived)
* Links are not available on the exact key name, instead, a "Links" part is appended, e.g. if the link relationship `details` is present, it will be available in the record as `detailsLinks` instead of `details`

### Minor

* The references can be either a single model or an array of models (more flexible)
* The references are computed properties so the circular references can be handled in a more robust way
* The reference ids can be retreived without using the reference model using the "Id" sufix, e.g. `photos` reference will also create a `photosId` property
* TypeScript typings are available
* A list of all models of a certain type is available as `collection[type]`
* `find` works without the record `id`, by returning the first result

### Internal

* The lib is internally using the [`mobx-collection-store`](https://github.com/infinum/mobx-collection-store) library and adds some JSON API specific functionality. Since `Store` and `Record` are extending the `Collection` and `Model` classes, all the same methods work.
* The lib was rewritten in TypeScript

## Usage

### Store

* `constructor([serializedData])` - The constructor can be provided with the serialized data from `toJS` in order to deserialize
* `static types` - Array of classes extended from the `Record`
* `length` - Number of unique records in the store
* `sync(body)` - Sync the JSON API response with the store. Return value will be either a record or an array of records that were parsed from the response.
* `add(record, [type])` - Add a record (or an array of records). Type param is required if the first argument is an plain object (or an array of plain objects) and you want to map them to the correct record classes
* `find(type, [id])` - Find a specific model (first found model if id is not given)
* `findAll(type)` - Returns an array of records of the given type
* `remove(type, [id])` - Remove the selected record (or first record of type if id not given)
* `removeAll(type)` - Remove all records of the given type
* `reset()` - Clears all records and relationships from the store
* `toJS()` - Convert the store into a plain JS Object array in order to be serialized

### Record

* `constructor([serializedData])` - The constructor can be provided with the serialized data from `toJS` in order to deserialize
* `static idAttribute` - Property name of the unique identifier in your data (default is `id`)
* `static type` - Type of the record
* `static defaults` - An object with default record properties
* `update(data)` - Update the record with new data (object)
* `assign(key, value)` - Method used to add a new property or update an existing one
* `assignRef(key, value, [type])` - Assign a new reference to the record
* `toJS()` - Convert the record into a plain JS Object in order to be serialized

*Note:* If adding a new property, use `assign` or `assignRef` methods. Don't assign the properties directly to the record.

## Advanced example

*Note:* Static class props and decorators are not standard JavaScript features, but they have valid alternatives (see [basic example](#basic-example) and [MobX documentation](https://mobx.js.org/))

```javascript
import {computed} from 'mobx';
import {Store, Record} from 'mobx-jsonapi-store';

class User extends Record {
  static type = 'user';
  static refs = {photos: 'photo'};

  @computed get fullName() {
    return this.firstName + ' ' + this.lastName;
  }
}

class Photo extends Record {
  static type = 'photo';
  static refs = {author: 'user'};

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
console.log(user.fullName); // John Doe
console.log(user.photos[0].extension); // 'jpg'

const photos = store.photo; // alternative: store.findAll('photo')
const selectedPhotos = photos.filter((photo) => photo.selected);
```

### Typescript example

```typescript
import {computed} from 'mobx';
import {Store, Record} from 'mobx-jsonapi-store';

class User extends Record {
  static type = 'user';
  static refs = {photos: 'photo'};

  firstName: string;
  lastName: string;
  photos: Photo|Array<Photo>;

  @computed get fullName(): string {
    return this.firstName + ' ' + this.lastName;
  }
}

class Photo extends Record {
  static type = 'photo';
  static refs = {author: 'user'};

  static defaults = {
    selected: false
  };

  selected: boolean;
  extension: string;
  author: User; // The correct type would be User|Array<User>
}

class ExampleStore extends Store {
  static types = [User, Photo];

  photo: Array<Photo>;
  user: Array<User>;
}

const store = new ExampleStore();

// Get some data (e.g. API call)
store.sync(data);

const user = store.find<User>('user', 1);
console.log(user.fullName); // John Doe
console.log(user.photos[0].extension); // 'jpg'

const photos = store.photo; // alternative: store.findAll<Photo>('photo')
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
