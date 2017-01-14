import IJsonApiRecord from './interfaces/IJsonApiRecord';
import IDictionary from './interfaces/IDictionary';
export declare function mapItems<T>(data: Object | Array<Object>, fn: Function): T | Array<T>;
export declare function flattenRecord(record: IJsonApiRecord): IDictionary<any>;
