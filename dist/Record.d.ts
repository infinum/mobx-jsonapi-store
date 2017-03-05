import { Model } from 'mobx-collection-store';
import * as JsonApi from './interfaces/JsonApi';
export declare class Record extends Model {
    static typeAttribute: string;
    id: number | string;
    type: string;
    private __internal;
    getRelationshipLinks(): Object;
    getMeta(): Object;
    getLinks(): Object;
    toJsonApi(): JsonApi.IRecord;
}
