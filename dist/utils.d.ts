import IDictionary from './interfaces/IDictionary';
import * as JsonApi from './interfaces/JsonApi';
/**
 * Iterate trough object keys
 *
 * @param {object} obj - Object that needs to be iterated
 * @param {Function} fn - Function that should be called for every iteration
 */
export declare function objectForEach(obj: object, fn: Function): void;
/**
 * Iterate trough one item or array of items and call the defined function
 *
 * @export
 * @template T
 * @param {(object|Array<object>)} data - Data which needs to be iterated
 * @param {Function} fn - Function that needs to be callse
 * @returns {(T|Array<T>)} - The result of iteration
 */
export declare function mapItems<T>(data: object | Array<object>, fn: Function): T | Array<T>;
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
 * @param {object} target - Target object
 * @param {Array<object>} args - Objects to be assigned
 * @returns
 */
export declare function assign(target: object, ...args: Array<object>): object;
/**
 * Returns the value if it's not a function. If it's a function
 * it calls it.
 *
 * @export
 * @template T
 * @param {(T|(() => T))} target can be  anything or function
 * @returns {T} value
 */
export declare function getValue<T>(target: T | (() => T)): T;
