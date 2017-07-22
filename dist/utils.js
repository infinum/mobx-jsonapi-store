"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Iterate trough object keys
 *
 * @param {object} obj - Object that needs to be iterated
 * @param {Function} fn - Function that should be called for every iteration
 */
function objectForEach(obj, fn) {
    for (var key in obj) {
        /* istanbul ignore else */
        if (obj.hasOwnProperty(key)) {
            fn(key);
        }
    }
}
exports.objectForEach = objectForEach;
/**
 * Iterate trough one item or array of items and call the defined function
 *
 * @export
 * @template T
 * @param {(object|Array<object>)} data - Data which needs to be iterated
 * @param {Function} fn - Function that needs to be callse
 * @returns {(T|Array<T>)} - The result of iteration
 */
function mapItems(data, fn) {
    return data instanceof Array ? data.map(function (item) { return fn(item); }) : fn(data);
}
exports.mapItems = mapItems;
/**
 * Flatten the JSON API record so it can be inserted into the model
 *
 * @export
 * @param {IJsonApiRecord} record - original JSON API record
 * @returns {IDictionary<any>} - Flattened object
 */
function flattenRecord(record) {
    var data = {
        __internal: {
            id: record.id,
            type: record.type,
        },
    };
    objectForEach(record.attributes, function (key) {
        data[key] = record.attributes[key];
    });
    objectForEach(record.relationships, function (key) {
        var rel = record.relationships[key];
        if (rel.meta) {
            data[key + "Meta"] = rel.meta;
        }
        if (rel.links) {
            data.__internal.relationships = data.__internal.relationships || {};
            data.__internal.relationships[key] = rel.links;
        }
    });
    objectForEach(record.links, function (key) {
        /* istanbul ignore else */
        if (record.links[key]) {
            data.__internal.links = data.__internal.links || {};
            data.__internal.links[key] = record.links[key];
        }
    });
    objectForEach(record.meta, function (key) {
        /* istanbul ignore else */
        if (record.meta[key]) {
            data.__internal.meta = data.__internal.meta || {};
            data.__internal.meta[key] = record.meta[key];
        }
    });
    return data;
}
exports.flattenRecord = flattenRecord;
exports.isBrowser = (typeof window !== 'undefined');
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
function assign(target) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    args.forEach(function (nextSource) {
        if (nextSource != null) {
            for (var nextKey in nextSource) {
                /* istanbul ignore else */
                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                    target[nextKey] = nextSource[nextKey];
                }
            }
        }
    });
    return target;
}
exports.assign = assign;
/**
 * Returns the value if it's not a function. If it's a function
 * it calls it.
 *
 * @export
 * @template T
 * @param {(T|(() => T))} target can be  anything or function
 * @returns {T} value
 */
function getValue(target) {
    if (typeof target === 'function') {
        return target();
    }
    return target;
}
exports.getValue = getValue;
/**
 * Get all object keys
 *
 * @export
 * @param {object} obj Object to process
 * @returns {Array<string>} List of object keys
 */
function keys(obj) {
    var keyList = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            keyList.push(key);
        }
    }
    return keyList;
}
exports.keys = keys;
