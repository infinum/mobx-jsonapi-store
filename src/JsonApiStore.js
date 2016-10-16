import {extendObservable, toJS, action, transaction} from 'mobx';

import JsonApiRecord from './JsonApiRecord';

// Inspired by https://github.com/confetti/yayson

/**
 * Handle iteration trough both arrays and objects
 *
 * @param {Object|Object[]} data - Data we want to iterate trough
 * @param {Function} fn - Function we want to call in every iteration
 * @return {Mixed} Result of the fn execution
 */
function mapItems(data, fn) {
  const rawData = toJS(data);
  if (!rawData) {
    return null;
  }
  return Array.isArray(rawData) ? data.map(fn) : fn(data);
}

/**
 * Class used as abstraction for the JSON API
 */
class JsonApiStore {

  /**
   * Observable store
   *
   * @param {Object} initialState - Initial state that should be set
   * @return {undefined}
   */
  constructor(initialState) {
    this._initData(initialState);
  }

  /**
   * Initialize the record model
   *
   * @param {Object} record - Record data
   * @return {Object} The record object
   */
  _initRecord(record) {
    const base = this.defaults[record.type];
    const attributes = base
      ? Object.assign({}, base, record.attributes)
      : record.attributes;
    return Object.assign({relationships: {}}, record, {
      attributes
    });
  }

  /**
   * Method for setting the initial state of the store
   *
   * @private
   * @param {Object} [initialState={}] - Initial state that should be set
   * @param {Array} [initialState.records=[]] - List of initial records
   * @param {Object} [initialState.relations={}] - Initial relations
   * @param {Object} [initialState.models={}] - Custom models for data types
   * @param {Object} [initialState.defaults={}] - Default values merged with the added models
   * @return {undefined}
   */
  @action _initData({records = [], relations = {}, models = {}, defaults = {}} = {}) {
    this.models = models;
    this.defaults = defaults;
    const initialState = {records, relations};
    const state = Object.assign({}, initialState);
    state.records = records.map(this._initRecord.bind(this));
    extendObservable(this, initialState);
  }

  /**
   * Get the class used for the records of a certain type
   *
   * @param {String} type - Record type
   * @return {Class} Record class that should be used
   */
  _getRecordModel(type) {
    return (type in this.models)
      ? this.models[type]
      : this.recordModel || JsonApiRecord;
  }

  /**
  * Transform record to model with linked values
  *
  * @private
  * @param {Record} record - Record
  * @param {String} modelType - Record type
  * @param {Object} [models={}] - Models
  * @return {Object} Created model
  */
  _toModel(record, modelType, models = {}) {
    const Record = this._getRecordModel(modelType);
    const modelInstance = new Record({
      id: record.id,
      type: record.type
    }, record, this);
    models[modelType] = models[modelType] || {};
    models[modelType][record.id] = models[modelType][record.id] || modelInstance;

    if (record.relationships) {
      for (const key of Object.keys(record.relationships)) {
        const {data, links} = record.relationships[key];
        const modelLinks = links ? {links} : null;
        modelInstance[key] = mapItems(data || links, ({type, id} = {}) => {
          const resolvedModel = this.find(type, id, models);
          return resolvedModel
            ? Object.assign(resolvedModel, modelLinks || {})
            : modelLinks;
        });
      }
    }
    return modelInstance;
  }

  /**
   * Reset the store data
   *
   * @return {undefined}
   */
  @action reset() {
    extendObservable(this, {records: [], relations: {}});
  }

  /**
   * Find a record in the store
   *
   * @param {String} type - Record type
   * @param {Number} id - Record ID
   * @return {Record|null} Found record or null
   */
  _findRecord(type, id) {
    return this.records.find((record) => record.type === type && record.id === id);
  }

  /**
   * Find records of type
   *
   * @param {String} type - Record type
   * @return{Record[]} List of found records
   */
  _findRecords(type) {
    return this.records.filter((record) => record.type === type);
  }

  /**
   * Find record
   *
   * @param {String} type - Record type
   * @param {Number} id - Record ID
   * @param {Object} [models={}] - Model Object
   * @return {Record|null} Found record or null
   */
  find(type, id, models = {}) {
    const record = this._findRecord(type, id);
    if (record) {
      models[type] = models[type] || {};
      models[type][id] = models[type][id] || this._toModel(record, type, models);
      return models[type][id];
    }
    return null;
  }

  /**
   * Find records
   *
   * @param {String} type - Record type
   * @param {Object} [models={}] - Model Object
   * @return {Record[]} List of found records
   */
  findAll(type, models = {}) {
    const records = this._findRecords(type);
    records.forEach((record) => this._toModel(record, type, models));
    return Object.keys(models[type] || {}).map((key) => models[type][key]);
  }

  /**
   * Remove record(s) from the store
   *
   * @param {String} type - Record type
   * @param {Number} [id=null] - Record ID
   * @return {Boolean} Success
   */
  @action remove(type, id = null) {
    if (id) {
      const record = this._findRecord(type, id);
      return record ? this.records.remove(record) : true;
    }
    const records = this._findRecords(type);
    return records.every((record) => this.records.remove(record));
  }

  /**
   * Add object to the store
   *
   * @private
   * @param {Object} [obj=null] - Object to add
   * @return {Record} Inserted record
   */
  @action _add(obj = null) {
    if (!obj) {
      return null;
    }
    const {type, id} = obj;
    let record = this._findRecord(type, id);
    if (record) {
      if (record.attributes) {
        extendObservable(record.attributes, obj.attributes || {});
      }

      if (record.relationships) {
        extendObservable(record.relationships, obj.relationships || {});
      }
    } else {
      record = this._initRecord(obj);
      this.records.push(record);
    }
    return record;
  }

  /**
   * Sync store with new data
   *
   * @param {Object} body - New data to Inserted
   * @return {Record|Record[]|null} Key inserted records
   */
  sync(body) {
    let result;
    transaction(() => {
      mapItems(body.included, this._add.bind(this));
      const records = mapItems(body.data, this._add.bind(this));
      result = mapItems(records, (record) => this._toModel(record, record.type));
    });
    return result;
  }
}

module.exports = {
  JsonApiRecord,
  JsonApiStore
};
