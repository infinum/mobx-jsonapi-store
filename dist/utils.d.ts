import IJsonApiRecord from './interfaces/IJsonApiRecord';
import IDictionary from './interfaces/IDictionary';
/**
 * Iterate trough one item or array of items and call the defined function
 *
 * @export
 * @template T
 * @param {(Object|Array<Object>)} data - Data which needs to be iterated
 * @param {Function} fn - Function that needs to be callse
 * @returns {(T|Array<T>)} - The result of iteration
 */
export declare function mapItems<T>(data: Object | Array<Object>, fn: Function): T | Array<T>;
/**
 * Flatten the JSON API record so it can be inserted into the model
 *
 * @export
 * @param {IJsonApiRecord} record - original JSON API record
 * @returns {IDictionary<any>} - Flattened object
 */
export declare function flattenRecord(record: IJsonApiRecord): IDictionary<any>;
