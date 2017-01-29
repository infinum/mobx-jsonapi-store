"use strict";
/**
 * Iterate trough object keys
 *
 * @param {Object} obj - Object that needs to be iterated
 * @param {Function} fn - Function that should be called for every iteration
 */
function objectForEach(obj, fn) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            fn(key);
        }
    }
}
/**
 * Iterate trough one item or array of items and call the defined function
 *
 * @export
 * @template T
 * @param {(Object|Array<Object>)} data - Data which needs to be iterated
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
        id: record.id,
        type: record.type,
    };
    objectForEach(record.attributes, function (key) {
        data[key] = record.attributes[key];
    });
    objectForEach(record.relationships, function (key) {
        if (record.relationships[key].links) {
            data[key + "Links"] = record.relationships[key].links;
        }
    });
    return data;
}
exports.flattenRecord = flattenRecord;
