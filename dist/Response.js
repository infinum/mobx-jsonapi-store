"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mobx_1 = require("mobx");
var NetworkUtils_1 = require("./NetworkUtils");
var Response = (function () {
    function Response(response, store, options, overrideData) {
        var _this = this;
        /**
         * Cache used for the link requests
         *
         * @private
         * @type {IDictionary<Promise<Response>>}
         * @memberOf Response
         */
        this.__cache = {};
        this.__store = store;
        this.__options = options;
        this.__response = response;
        this.status = response.status;
        this.data = overrideData ? store.add(overrideData) : store.sync(response.data);
        this.meta = (response.data && response.data.meta) || {};
        this.links = (response.data && response.data.links) || {};
        this.jsonapi = (response.data && response.data.jsonapi) || {};
        this.headers = response.headers;
        this.requestHeaders = response.requestHeaders;
        this.error = (response.data && response.data.errors) || response.error;
        var linkGetter = {};
        Object.keys(this.links).forEach(function (link) {
            linkGetter[link] = mobx_1.computed(function () { return _this.__fetchLink(link); });
        });
        mobx_1.extendObservable(this, linkGetter);
        Object.freeze(this);
    }
    /**
     * Replace the response record with a different record. Used to replace a record while keeping the same reference
     *
     * @param {IModel} data New data
     * @returns {Response}
     *
     * @memberOf Response
     */
    Response.prototype.replaceData = function (data) {
        var record = this.data;
        if (record === data) {
            return this;
        }
        this.__store.remove(record.type, record.id);
        data.update(record.toJS());
        // tslint:disable-next-line:no-string-literal
        data['__data'].id = record.id;
        return new Response(this.__response, this.__store, this.__options, data);
    };
    /**
     * Function called when a link is beeing fetched. The returned value is cached
     *
     * @private
     * @param {any} name Link name
     * @returns Promise that resolves with a Response object
     *
     * @memberOf Response
     */
    Response.prototype.__fetchLink = function (name) {
        if (!this.__cache[name]) {
            var link = name in this.links ? this.links[name] : null;
            this.__cache[name] = NetworkUtils_1.fetchLink(link, this.__store, this.requestHeaders, this.__options);
        }
        return this.__cache[name];
    };
    return Response;
}());
exports.Response = Response;
