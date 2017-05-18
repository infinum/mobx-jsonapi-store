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
var utils_1 = require("./utils");
var NetworkStore = (function (_super) {
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
     *     data?: Object,
     *     headers: IHeaders,
     *   }} Options needed for an API call
     *
     * @memberOf NetworkStore
     */
    NetworkStore.prototype.__prepareQuery = function (type, id, data, options) {
        var model = this.static.types.filter(function (item) { return item.type === type; })[0];
        var path = model ? (model['baseUrl'] || model.type) : type;
        var url = id ? path + "/" + id : "" + path;
        var headers = options ? options.headers : {};
        var params = this.__prepareFilters((options && options.filter) || {}).concat(this.__prepareSort(options && options.sort), this.__prepareIncludes(options && options.include), this.__prepareFields((options && options.fields) || {}));
        var baseUrl = this.__appendParams(this.__prefixUrl(url), params);
        return { data: data, headers: headers, url: baseUrl };
    };
    NetworkStore.prototype.__prepareFilters = function (filters) {
        return this.__parametrize(filters).map(function (item) { return "filter[" + item.key + "]=" + item.value; });
    };
    NetworkStore.prototype.__prepareSort = function (sort) {
        return sort ? ["sort=" + sort] : [];
    };
    NetworkStore.prototype.__prepareIncludes = function (include) {
        return include ? ["include=" + include] : [];
    };
    NetworkStore.prototype.__prepareFields = function (fields) {
        var list = [];
        utils_1.objectForEach(fields, function (key) {
            list.push("fields[" + key + "]=" + fields[key]);
        });
        return list;
    };
    NetworkStore.prototype.__prefixUrl = function (url) {
        return "" + NetworkUtils_1.config.baseUrl + url;
    };
    NetworkStore.prototype.__appendParams = function (url, params) {
        if (params.length) {
            url += '?' + params.join('&');
        }
        return url;
    };
    NetworkStore.prototype.__parametrize = function (params, scope) {
        var _this = this;
        if (scope === void 0) { scope = ''; }
        var list = [];
        utils_1.objectForEach(params, function (key) {
            if (typeof params[key] === 'object') {
                list.push.apply(list, _this.__parametrize(params[key], key + "."));
            }
            else {
                list.push({ key: "" + scope + key, value: params[key] });
            }
        });
        return list;
    };
    return NetworkStore;
}(mobx_collection_store_1.Collection));
exports.NetworkStore = NetworkStore;
