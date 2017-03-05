import {Model} from 'mobx-collection-store';

import IDictionary from './interfaces/IDictionary';
import * as JsonApi from './interfaces/JsonApi';

export class Record extends Model {
  public static typeAttribute = 'type';

  public id: number|string;
  public type: string;

  private __internal: IDictionary<Object>;

  public getRelationshipLinks(): Object {
    return this.__internal.relationships;
  }

  public getMeta(): Object {
    return this.__internal.meta;
  }

  public getLinks(): Object {
    return this.__internal.links;
  }

  public toJsonApi(): JsonApi.IRecord {
    const data = this.toJS();
    delete data.id;
    delete data.type;

    return {
      attributes: data,
      id: this.id,
      type: this.type,
    };
  }
}
