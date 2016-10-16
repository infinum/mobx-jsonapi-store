var _ = require('lodash');
var mobx = require('mobx');

var JsonApiRecord = function() {};

// Inspired by https://github.com/confetti/yayson

/**
 * Handle iteration trough both arrays and objects
 *
 * @param {Object|Object[]} data - Data we want to iterate trough
 * @param {Function} fn - Function we want to call in every iteration
 * @return {Mixed} Result of the fn execution
 */
function mapItems(data, fn) {
  return _.isArray(mobx.toJS(data)) ? data.map(fn) : fn(data);
}

/**
 * Method for setting the initial state of the store
 *
 * @private
 * @param {Object} initialState - Initial state that should be set
 * @return {undefined}
 */
var Store = function _initData(initialState) {
  initialState = initialState || {records: [], relations: []};
  var state = _.assign({}, initialState);
  var self = this;
  state.recors = initialState.records.map(function(record) {
    var Record = self._getRecordModel(record.type);
    return new Record(record);
  });
  mobx.runInAction(function() {
    mobx.extendObservable(self, initialState);
  });
};

/**
 * Get the class used for the records of a certain type
 *
 * @param {String} type - Record type
 * @return {Class} Record class that should be used
 */
Store.prototype._getRecordModel = function _getRecordModel(type) {
  return (this.types && this.types[type])
    || this.recordModel
    || JsonApiRecord;
};

/**
* Transform record to model with linked values
*
* @private
* @param {Record} record - Record
* @param {String} modelType - Record type
* @param {Object} [models={}] - Models
* @return {Object} Created model
*/
Store.prototype._toModel = function _toModel(record, modelType, models) {
  models = models || {};
  var model = mobx.toJS(record.attributes) || {};
  model.id = record.id;
  model.type = record.type;
  models[modelType] = models[modelType] || {};
  models[modelType][record.id] = models[modelType][record.id] || model;

  if (record.relationships) {
    _.forEach(record.relationships, function(value, key) {
      var modelLinks = value.links ? {links: value.links} : null;
      model[key] = mapItems(value.data, function(item) {
        item = item || {};
        var resolvedModel = this.find(type, id, models);
        return resolvedModel
          ? _.assign(resolvedModel, modelLinks || {})
          : modelLinks;
      });
    });
  }
  return model;
};

/**
 * Reset the store data
 *
 * @return {undefined}
 */
Store.prototype.reset = function reset() {
  var self = this;
  mobx.runInAction(function() {
    mobx.extendObservable(self, {records: [], relations: {}});
  });
};

/**
 * Find a record in the store
 *
 * @param {String} type - Record type
 * @param {Number} id - Record ID
 * @return {Record|null} Found record or null
 */
Store.prototype.findRecord = function findRecord(type, id) {
  return _.find(this.records, function(record) {
    return record.type === type && record.id === id;
  });
};

/**
 * Find records of type
 *
 * @param {String} type - Record type
 * @return{Record[]} List of found records
 */
Store.prototype.findRecords = function findRecords(type) {
  return _.filter(this.records, {type: type});
}

/**
 * Find record
 *
 * @param {String} type - Record type
 * @param {Number} id - Record ID
 * @param {Object} [models={}] - Model Object
 * @return {Record|null} Found record or null
 */
Store.prototype.find = function find(type, id, models) {
  models = models || {};
  var record = this.findRecord(type, id);
  if (!record) {
    return null;
  }
  models[type] = models[type] || {};
  models[type][id] = models[type][id] || this._toModel(record, type, models);
  return models[type][id];
}

/**
 * Find records
 *
 * @param {String} type - Record type
 * @param {Object} [models={}] - Model Object
 * @return {Record[]} List of found records
 */
Store.prototype.findAll = function findAll(type, models) {
  models = models || {};
  var self = this;
  var records = this.findRecords(type);
  if (records) {
    _.forEach(records, function(record) {
      self._toModel(record, type, models);
    });
    return _.values(models[type]);
  }
  return [];
}

/**
 * Remove record(s) from the store
 *
 * @param {String} type - Record type
 * @param {Number} [id=null] - Record ID
 * @return {undefined}
 */
Store.prototype.remove = mobx.action(function remove(type, id) {
  if (id) {
    var record = this.findRecord(type, id);
    return record ? this.records.remove(record) : true;
  }
  var self = this;
  var records = this.findRecords(type);
  mobx.runInAction(function() {
    _.every(records, _.bind(self.records.remove, self));
  });
});

/**
 * Add object to the store
 *
 * @private
 * @param {Object} [obj=null] - Object to add
 * @return {Record} Inserted record
 */
Store.prototype._add = function _add(obj) {
  if (!obj) {
    return null;
  }
  var self = this;
  this.remove(obj.type, obj.id);
  var Record = this._getRecordModel(obj.type);
  var record = new Record(obj);
  mobx.runInAction(function() {
    self.records.push(record);
  });
  return record;
};

/**
 * Sync store with new data
 *
 * @param {Object} body - New data to Inserted
 * @return {Record|Record[]|null} Key inserted records
 */
Store.prototype.sync = function sync(body) {
  var self = this;
  mapItems(body.included, _.bind(this._add, this));
  var records = mapItems(body.data, _.bind(this._add, this));
  return mapItems(records, function(record) {
    return self._toModel(record, record.type);
  });
}

module.exports = {
  Record: JsonApiRecord,
  Store: Store
};
