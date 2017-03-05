"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var mobx_collection_store_1 = require("mobx-collection-store");
var NetworkStore = (function (_super) {
    __extends(NetworkStore, _super);
    function NetworkStore() {
        return _super.apply(this, arguments) || this;
    }
    return NetworkStore;
}(mobx_collection_store_1.Collection));
exports.NetworkStore = NetworkStore;
