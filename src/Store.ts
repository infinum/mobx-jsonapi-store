import {action} from 'mobx';

import {Collection, IModel} from 'mobx-collection-store';

import IJsonApiIdentifier from './interfaces/IJsonApiIdentifier';
import IJsonApiRecord from './interfaces/IJsonApiRecord';
import IJsonApiResponse from './interfaces/IJsonApiResponse';

import {Record} from './Record';
import {flattenRecord, mapItems} from './utils';

export class Store extends Collection {

  /**
   * List of Models that will be used in the collection
   *
   * @static
   *
   * @memberOf Store
   */
  public static types = [Record];

  /**
   * Import the JSON API data into the store
   *
   * @param {IJsonApiResponse} body - JSON API response
   * @returns {(IModel|Array<IModel>)} - Models parsed from body.data
   *
   * @memberOf Store
   */
  @action public sync(body: IJsonApiResponse): IModel|Array<IModel> {
    const data = this.__iterateEntries(body, this.__addRecord.bind(this));
    this.__iterateEntries(body, this.__updateRelationships.bind(this));
    return data;
  }

  /**
   * Add a new JSON API record to the store
   *
   * @private
   * @param {IJsonApiRecord} obj - Object to be added
   * @returns {IModel}
   *
   * @memberOf Store
   */
  private __addRecord(obj: IJsonApiRecord): IModel {
    const {type, id} = obj;
    let record = this.find(type, id);
    const flattened = flattenRecord(obj);
    const availableModels = this.static.types.map((item) => item.type);

    if (record) {
      record.update(flattened);
    } else if (availableModels.indexOf(obj.type) !== -1) {
      record = this.add(flattened, obj.type);
    } else {
      record = new Record(flattened);
      this.add(record);
    }
    return record;
  }

  /**
   * Update the relationships between models
   *
   * @private
   * @param {IJsonApiRecord} obj - Object to be updated
   * @returns {void}
   *
   * @memberOf Store
   */
  private __updateRelationships(obj: IJsonApiRecord): void {
    const record = this.find(obj.type, obj.id);
    if (!record) {
      return;
    }
    const refs = obj.relationships ? Object.keys(obj.relationships) : [];
    refs.forEach((ref) => {
      const items = obj.relationships[ref].data;
      if (items) {
        const models = mapItems<IModel>(items, ({id, type}) => this.find(type, id));
        record.assignRef(ref, models, obj.type);
      }
    });
  }

  /**
   * Iterate trough JSNO API response models
   *
   * @private
   * @param {IJsonApiResponse} body - JSON API response
   * @param {Function} fn - Function to call for every instance
   * @returns
   *
   * @memberOf Store
   */
  private __iterateEntries(body: IJsonApiResponse, fn: Function) {
    mapItems(body.included || [], fn);
    return mapItems<IModel>(body.data, fn);
  }
}
