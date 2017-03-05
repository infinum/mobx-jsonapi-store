"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var mobx_collection_store_1 = require("mobx-collection-store");
var Record = (function (_super) {
    __extends(Record, _super);
    function Record() {
        return _super.apply(this, arguments) || this;
    }
    Record.prototype.getRelationshipLinks = function () {
        return this.__internal.relationships;
    };
    Record.prototype.getMeta = function () {
        return this.__internal.meta;
    };
    Record.prototype.getLinks = function () {
        return this.__internal.links;
    };
    Record.prototype.toJsonApi = function () {
        var data = this.toJS();
        delete data.id;
        delete data.type;
        return {
            attributes: data,
            id: this.id,
            type: this.type,
        };
    };
    return Record;
}(mobx_collection_store_1.Model));
exports.Record = Record;
Record.typeAttribute = 'type';
