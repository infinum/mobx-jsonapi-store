import {action} from 'mobx';

import {Collection, IModel} from 'mobx-collection-store';

import IJsonApiResponse from './interfaces/IJsonApiResponse';
import IJsonApiRecord from './interfaces/IJsonApiRecord';
import {mapItems, flattenRecord} from './utils';

class Store extends Collection {
  @action private __addRecord(obj: IJsonApiRecord): IModel {
    const {type, id} = obj;
    let record = this.find(type, id);
    const flattened = flattenRecord(obj);

    if (record) {
      record.update(flattened);
    } else {
      record = this.add(flattened, obj.type);
    }
    return record;
  }

  @action sync(body: IJsonApiResponse): IModel|Array<IModel> {
    mapItems(body.included || [], this.__addRecord.bind(this));
    return mapItems<IModel>(body.data, this.__addRecord.bind(this));
  }
}

export {Store};