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
function mapItems(data, fn) {
    return data instanceof Array ? data.map(function (item) { return fn(item); }) : fn(data);
}
exports.mapItems = mapItems;
function flattenRecord(record) {
    var data = {
        id: record.id,
        type: record.type
    };
    objectForEach(record.attributes, function (key) {
        data[key] = record.attributes[key];
    });
    objectForEach(record.relationships, function (key) {
        data[key] = mapItems(record.relationships[key].data, function (item) { return item && item.id; });
        if (record.relationships[key].links) {
            data[key + "Links"] = record.relationships[key].links;
        }
    });
    return data;
}
exports.flattenRecord = flattenRecord;
