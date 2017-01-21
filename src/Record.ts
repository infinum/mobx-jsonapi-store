import {Model} from 'mobx-collection-store';

export class Record extends Model {
  id: number|string;
  type: string;

  static typeAttribute = 'type';
}
