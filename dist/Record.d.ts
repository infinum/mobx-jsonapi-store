import { Model } from 'mobx-collection-store';
export declare class Record extends Model {
    id: number | string;
    type: string;
    static typeAttribute: string;
}
