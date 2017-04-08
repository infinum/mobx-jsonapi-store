"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mobx_1 = require("mobx");
var NetworkUtils_1 = require("./NetworkUtils");
var Response = (function () {
    function Response(response, store, options) {
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
        this.data = store.sync(response.data);
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
