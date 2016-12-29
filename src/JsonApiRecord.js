import {action, computed, extendObservable, isObservable} from 'mobx';

export default class JsonApiRecord {

  /**
   * Set up the model data
   *
   * @param {Object} [initialState={}] - Initial model state
   * @param {Object} [originalRecord=null] - Reference to the original JSON API record
   * @param {Object} [store={}] - Reference to the record store
   * @return {undefined}
   */
  constructor(initialState = {}, originalRecord = null, store = {}) {
    if (originalRecord) {
      const computedVals = {};
      Object.keys(originalRecord.attributes || {}).forEach((key) => {
        computedVals[key] = computed(() => originalRecord.attributes[key]);
      });
      const props = Object.assign(initialState, computedVals, {_record: originalRecord, _store: store});
      extendObservable(this, props);
    } else {
      Object.assign(this, initialState);
      this.attributes.selected = false;
    }
  }

  /**
   * Set a value on the model
   *
   * @param {String} key - Key of the value that should be set
   * @param {Mixed} value - Value that should be set
   * @return {undefined}
   */
  @action set(key, value) {
    const updatedData = {[key]: value};
    if (key in this._record) {
      this._record.attributes[key] = value;
    } else if (this._record && this._record.attributes) {
      extendObservable(this._record.attributes, updatedData);
    }
    return this._update(updatedData);
  }

  /**
   * Method used for updating the model data
   *
   * @param {Object} data - Data to be updated
   * @return {undefined}
   */
  @action _update(data) {
    if (typeof data === 'object' && !(data instanceof Array) && !isObservable(this)) {
      Object.assign(this, data);
    }
  }
}
