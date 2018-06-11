"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var mobx_collection_store_1 = require("mobx-collection-store");
var NetworkUtils_1 = require("./NetworkUtils");
var NetworkStore = /** @class */ (function (_super) {
    __extends(NetworkStore, _super);
    function NetworkStore() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Prepare the query params for the API call
     *
     * @protected
     * @param {string} type Record type
     * @param {(number|string)} [id] Record ID
     * @param {JsonApi.IRequest} [data] Request data
     * @param {IRequestOptions} [options] Server options
     * @returns {{
     *     url: string,
     *     data?: object,
     *     headers: IHeaders,
     *   }} Options needed for an API call
     *
     * @memberOf NetworkStore
     */
    NetworkStore.prototype.__prepareQuery = function (type, id, data, options) {
        var model = this.static.types.filter(function (item) { return item.type === type; })[0];
        var headers = (options ? options.headers : {}) || {};
        var url = NetworkUtils_1.buildUrl(type, id, model, options);
        return { data: data, headers: headers, url: url };
    };
    return NetworkStore;
}(mobx_collection_store_1.Collection));
exports.NetworkStore = NetworkStore;
