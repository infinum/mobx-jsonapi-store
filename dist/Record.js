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
var Record = (function (_super) {
    __extends(Record, _super);
    function Record() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * Cache link fetch requests
         *
         * @private
         * @type {IDictionary<Promise<Response>>}
         * @memberOf Record
         */
        _this.__relationshipLinkCache = {};
        /**
         * Cache link fetch requests
         *
         * @private
         * @type {IDictionary<Promise<Response>>}
         * @memberOf Record
         */
        _this.__linkCache = {};
        return _this;
    }
    /**
     * Get record relationship links
     *
     * @returns {IDictionary<JsonApi.IRelationship>} Record relationship links
     *
     * @memberOf Record
     */
    Record.prototype.getRelationshipLinks = function () {
        return this.__internal && this.__internal.relationships;
    };
    /**
     * Fetch a relationship link
     *
     * @param {string} relationship Name of the relationship
     * @param {string} name Name of the link
     * @param {IRequestOptions} [options] Server options
     * @param {boolean} [force=false] Ignore the existing cache
     * @returns {Promise<Response>} Response promise
     *
     * @memberOf Record
     */
    Record.prototype.fetchRelationshipLink = function (relationship, name, options, force) {
        if (force === void 0) { force = false; }
        this.__relationshipLinkCache[relationship] = this.__relationshipLinkCache[relationship] || {};
        /* istanbul ignore else */
        if (!(name in this.__relationshipLinkCache) || force) {
            var link = ('relationships' in this.__internal &&
                relationship in this.__internal.relationships &&
                name in this.__internal.relationships[relationship]) ? this.__internal.relationships[relationship][name] : null;
            var headers = options && options.headers;
            this.__relationshipLinkCache[relationship][name] = NetworkUtils_1.fetchLink(link, this.__collection, headers, options);
        }
        return this.__relationshipLinkCache[relationship][name];
    };
    /**
     * Get record metadata
     *
     * @returns {object} Record metadata
     *
     * @memberOf Record
     */
    Record.prototype.getMeta = function () {
        return this.__internal && this.__internal.meta;
    };
    /**
     * Get record links
     *
     * @returns {IDictionary<JsonApi.ILink>} Record links
     *
     * @memberOf Record
     */
    Record.prototype.getLinks = function () {
        return this.__internal && this.__internal.links;
    };
    /**
     * Fetch a record link
     *
     * @param {string} name Name of the link
     * @param {IRequestOptions} [options] Server options
     * @param {boolean} [force=false] Ignore the existing cache
     * @returns {Promise<Response>} Response promise
     *
     * @memberOf Record
     */
    Record.prototype.fetchLink = function (name, options, force) {
        var _this = this;
        if (force === void 0) { force = false; }
        if (!(name in this.__linkCache) || force) {
            var link = ('links' in this.__internal && name in this.__internal.links) ?
                this.__internal.links[name] : null;
            this.__linkCache[name] = NetworkUtils_1.fetchLink(link, this.__collection, options && options.headers, options);
        }
        var request = this.__linkCache[name];
        if (this['__queue__']) {
            request = this.__linkCache[name].then(function (response) {
                var related = _this['__related__'];
                var prop = _this['__prop__'];
                var record = response.data;
                if (record &&
                    record.getRecordType() !== _this.getRecordType() &&
                    record.getRecordType() === related.getRecordType()) {
                    /* istanbul ignore if */
                    if (prop) {
                        related[prop] = record;
                        return response;
                    }
                    related.__persisted = true;
                    return response.replaceData(related);
                }
                return response;
            });
        }
        return request;
    };
    Object.defineProperty(Record.prototype, "__persisted", {
        /**
         * Get the persisted state
         *
         * @readonly
         * @private
         * @type {boolean}
         * @memberOf Record
         */
        get: function () {
            return (this.__internal && this.__internal.persisted) || false;
        },
        /**
         * Set the persisted state
         *
         * @private
         *
         * @memberOf Record
         */
        set: function (state) {
            this.__internal.persisted = state;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Serialize the record into JSON API format
     *
     * @returns {JsonApi.IRecord} JSON API formated record
     *
     * @memberOf Record
     */
    Record.prototype.toJsonApi = function () {
        var _this = this;
        var attributes = this.toJS();
        var useAutogenerated = this.static['useAutogeneratedIds'];
        var data = {
            attributes: attributes,
            id: (this.__persisted || useAutogenerated) ? this.getRecordId() : undefined,
            type: this.getRecordType(),
        };
        var refs = this['__refs'];
        utils_1.objectForEach(refs, function (key) {
            data.relationships = data.relationships || {};
            var rel = utils_1.mapItems(_this[key + "Id"], function (id) {
                if (!id && id !== 0) {
                    return null;
                }
                return { id: id, type: refs[key] };
            });
            data.relationships[key] = { data: rel };
            delete data.attributes[key];
            delete data.attributes[key + "Id"];
            delete data.attributes[key + "Meta"];
        });
        delete data.attributes.__internal;
        delete data.attributes.__type__;
        return data;
    };
    /**
     * Saves (creates or updates) the record to the server
     *
     * @param {IRequestOptions} [options] Server options
     * @returns {Promise<Record>} Returns the record is successful or rejects with an error
     *
     * @memberOf Record
     */
    Record.prototype.save = function (options) {
        var store = this.__collection;
        var data = this.toJsonApi();
        var requestMethod = this.__persisted ? NetworkUtils_1.update : NetworkUtils_1.create;
        return requestMethod(store, this.__getUrl(), { data: data }, options && options.headers)
            .then(NetworkUtils_1.handleResponse(this));
    };
    Record.prototype.saveRelationship = function (relationship, options) {
        var link = ('relationships' in this.__internal &&
            relationship in this.__internal.relationships &&
            'self' in this.__internal.relationships[relationship]) ? this.__internal.relationships[relationship]['self'] : null;
        /* istanbul ignore if */
        if (!link) {
            throw new Error('The relationship doesn\'t have a defined link');
        }
        var store = this.__collection;
        /* istanbul ignore next */
        var href = typeof link === 'object' ? link.href : link;
        var type = this['__refs'][relationship];
        var data = utils_1.mapItems(this[relationship + "Id"], function (id) { return ({ id: id, type: type }); });
        return NetworkUtils_1.update(store, href, { data: data }, options && options.headers)
            .then(NetworkUtils_1.handleResponse(this, relationship));
    };
    /**
     * Remove the records from the server and store
     *
     * @param {IRequestOptions} [options] Server options
     * @returns {Promise<boolean>} Resolves true if successfull or rejects if there was an error
     *
     * @memberOf Record
     */
    Record.prototype.remove = function (options) {
        var _this = this;
        var store = this.__collection;
        if (!this.__persisted) {
            this.__collection.remove(this.getRecordType(), this.getRecordId());
            return Promise.resolve(true);
        }
        return NetworkUtils_1.remove(store, this.__getUrl(), options && options.headers)
            .then(function (response) {
            /* istanbul ignore if */
            if (response.error) {
                throw response.error;
            }
            _this.__persisted = false;
            if (_this.__collection) {
                _this.__collection.remove(_this.getRecordType(), _this.getRecordId());
            }
            return true;
        });
    };
    /**
     * Set the persisted status of the record
     *
     * @param {boolean} state Is the record persisted on the server
     *
     * @memberOf Record
     */
    Record.prototype.setPersisted = function (state) {
        this.__persisted = state;
    };
    /**
     * Get the URL that should be used for the API calls
     *
     * @private
     * @returns {string} API URL
     *
     * @memberOf Record
     */
    Record.prototype.__getUrl = function () {
        var links = this.getLinks();
        if (links && links.self) {
            var self_1 = links.self;
            /* istanbul ignore next */
            return typeof self_1 === 'string' ? self_1 : self_1.href;
        }
        /* istanbul ignore next */
        var url = utils_1.getValue(this.static.endpoint) || this.getRecordType() || this.static.type;
        return this.__persisted
            ? "" + NetworkUtils_1.config.baseUrl + url + "/" + this.getRecordId()
            : "" + NetworkUtils_1.config.baseUrl + url;
    };
    /**
     * Type property of the record class
     *
     * @static
     *
     * @memberOf Record
     */
    Record.typeAttribute = ['__internal', 'type'];
    /**
     * ID property of the record class
     *
     * @static
     *
     * @memberOf Record
     */
    Record.idAttribute = ['__internal', 'id'];
    /**
     * Should the autogenerated ID be sent to the server when creating a record
     *
     * @static
     * @type {boolean}
     * @memberOf Record
     */
    Record.useAutogeneratedIds = false;
    return Record;
}(mobx_collection_store_1.Model));
exports.Record = Record;
