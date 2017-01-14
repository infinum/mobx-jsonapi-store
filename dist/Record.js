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
    return Record;
}(mobx_collection_store_1.Model));
exports.Record = Record;
