# mobx-jsonapi-store

JSON API Store for MobX

## Deprecation and migration

`mobx-jsonapi-store` and `mobx-collection-store` are deprecated in favor of [`datx`](https://github.com/infinum/datx) - it follows the same concepts, but adds support for MobX 4 and 5, better TypeScript support and more extensibility.

If you're new to the libraries, check out the datx [examples](https://github.com/infinum/datx/tree/master/examples) and [docs](https://github.com/infinum/datx/wiki).

If you already use `mobx-jsonapi-store`, check out the [migration guide](https://github.com/infinum/datx/wiki/Migration-from-mobx-jsonapi-store).

-------

Don't need any [JSON API](http://jsonapi.org/) specific features? Check out [mobx-collection-store](https://github.com/infinum/mobx-collection-store).

**Can be used with [Redux DevTools](https://github.com/infinum/mobx-jsonapi-store/wiki/Redux-DevTools).**

[![Build Status](https://travis-ci.org/infinum/mobx-jsonapi-store.svg?branch=master)](https://travis-ci.org/infinum/mobx-jsonapi-store)
[![Test Coverage](https://codeclimate.com/github/infinum/mobx-jsonapi-store/badges/coverage.svg)](https://codeclimate.com/github/infinum/mobx-jsonapi-store/coverage)
[![npm version](https://badge.fury.io/js/mobx-jsonapi-store.svg)](https://badge.fury.io/js/mobx-jsonapi-store)

[![Dependency Status](https://david-dm.org/infinum/mobx-jsonapi-store.svg)](https://david-dm.org/infinum/mobx-jsonapi-store)
[![devDependency Status](https://david-dm.org/infinum/mobx-jsonapi-store/dev-status.svg)](https://david-dm.org/infinum/mobx-jsonapi-store#info=devDependencies)
[![Greenkeeper badge](https://badges.greenkeeper.io/infinum/mobx-jsonapi-store.svg)](https://greenkeeper.io/)

## Basic example

```javascript
import {Store} from 'mobx-jsonapi-store';

const store = new Store();
const user = store.sync(userResponse); // Assumption: userResponse was received from some API call and it's a valid JSON API response
console.log(user.name); // "John"
```

For more, check out the [Getting started](https://github.com/infinum/mobx-jsonapi-store/wiki/Getting-started) guide.

## Installation

To install, use `npm` or `yarn`. The lib has a peer dependency of `mobx` 2.7.0 or later (including MobX 3) and `mobx-collection-store`.

```bash
npm install mobx-jsonapi-store mobx-collection-store mobx --save
```

```bash
yarn add mobx-jsonapi-store mobx-collection-store mobx
```

Since the lib is exposed as a set of CommonJS modules, you'll need something like [webpack](https://webpack.js.org/) or browserify in order to use it in the browser.

Don't forget to [prepare your code for production](https://webpack.js.org/guides/production/) for better performance!

# Migration from v3 to v4

Version 4 has a few breaking changes described in the [migration guide](https://github.com/infinum/mobx-jsonapi-store/wiki/Migrating-from-v3-to-v4).

# Getting started
The main idea behind the library is to have one instance of the store that contains multiple model types. This way, there can be references between models that can handle all use cases, including circular dependencies.

* [Setting up networking](https://github.com/infinum/mobx-jsonapi-store/wiki/Networking)
* [Defining models](https://github.com/infinum/mobx-jsonapi-store/wiki/Defining-models)
* [References](https://github.com/infinum/mobx-jsonapi-store/wiki/References)
* [Configuring the store](https://github.com/infinum/mobx-jsonapi-store/wiki/Configuring-the-store)
* [Using the store](https://github.com/infinum/mobx-jsonapi-store/wiki/Using-the-store)
* [Using the network methods](https://github.com/infinum/mobx-jsonapi-store/wiki/Using-the-network)
* [Persisting data locally](https://github.com/infinum/mobx-jsonapi-store/wiki/Persisting-data-locally)
* [Redux DevTools](https://github.com/infinum/mobx-jsonapi-store/wiki/Redux-DevTools)

# JSON API Spec
mobx-jsonapi-store is [100% compatible with the JSON API v1.0 spec](https://github.com/infinum/mobx-jsonapi-store/wiki/JSON-API-Spec)

# API reference

* [config](https://github.com/infinum/mobx-jsonapi-store/wiki/config)
* [Store](https://github.com/infinum/mobx-jsonapi-store/wiki/Store)
* [Record](https://github.com/infinum/mobx-jsonapi-store/wiki/Record)
* [Response](https://github.com/infinum/mobx-jsonapi-store/wiki/Response)
* [TypeScript interfaces](https://github.com/infinum/mobx-jsonapi-store/wiki/Interfaces)

## License

The [MIT License](LICENSE)

## Credits

mobx-jsonapi-store is maintained and sponsored by
[Infinum](http://www.infinum.co).

<img src="https://infinum.co/infinum.png" width="264">
