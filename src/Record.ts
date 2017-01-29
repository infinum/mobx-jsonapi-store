import {Model} from 'mobx-collection-store';

export class Record extends Model {
  public static typeAttribute = 'type';

  public id: number|string;
  public type: string;
}
