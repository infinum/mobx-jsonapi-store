import IDictionary from './interfaces/IDictionary';
import * as JsonApi from './interfaces/JsonApi';
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
export declare function flattenRecord(record: JsonApi.IRecord): IDictionary<any>;
export declare const isBrowser: boolean;
/**
 * Assign objects to the target object
 * Not a complete implementation (Object.assign)
 * Based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign polyfill
 *
 * @private
 * @param {Object} target - Target object
 * @param {Array<Object>} args - Objects to be assigned
 * @returns
 */
export declare function assign(target: Object, ...args: Array<Object>): Object;
