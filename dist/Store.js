"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var mobx_1 = require("mobx");
var mobx_collection_store_1 = require("mobx-collection-store");
var utils_1 = require("./utils");
var Store = (function (_super) {
    __extends(Store, _super);
    function Store() {
        return _super.apply(this, arguments) || this;
    }
    Store.prototype.__addRecord = function (obj) {
        var type = obj.type, id = obj.id;
        var record = this.find(type, id);
        var flattened = utils_1.flattenRecord(obj);
        if (record) {
            record.update(flattened);
        }
        else {
            record = this.add(flattened, obj.type);
        }
        return record;
    };
    Store.prototype.sync = function (body) {
        utils_1.mapItems(body.included || [], this.__addRecord.bind(this));
        return utils_1.mapItems(body.data, this.__addRecord.bind(this));
    };
    return Store;
}(mobx_collection_store_1.Collection));
exports.Store = Store;
__decorate([
    mobx_1.action
], Store.prototype, "___addRecord", null);
__decorate([
    mobx_1.action
], Store.prototype, "sync", null);
