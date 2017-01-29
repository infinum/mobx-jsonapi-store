import { Model } from 'mobx-collection-store';
export declare class Record extends Model {
    static typeAttribute: string;
    id: number | string;
    type: string;
}
