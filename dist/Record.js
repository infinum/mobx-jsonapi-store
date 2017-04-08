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
var Record = (function (_super) {
    __extends(Record, _super);
    function Record() {
        return _super !== null && _super.apply(this, arguments) || this;
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
     * Get record metadata
     *
     * @returns {Object} Record metadata
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
            this.__internal = this.__internal || {};
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
        var attributes = this.toJS();
        delete attributes.id;
        delete attributes.type;
        return {
            attributes: attributes,
            id: this.__persisted ? this.id : undefined,
            type: this.type,
        };
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
        var _this = this;
        var store = this.__collection;
        var data = this.toJsonApi();
        var requestMethod = this.__persisted ? NetworkUtils_1.update : NetworkUtils_1.create;
        return requestMethod(store, this.__getUrl(), { data: data }, options && options.headers)
            .then(function (response) {
            if (response.error) {
                throw response.error;
            }
            _this.__persisted = true;
            return response.data;
        });
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
            this.__collection.remove(this.type, this.id);
            return Promise.resolve(true);
        }
        return NetworkUtils_1.remove(store, this.__getUrl(), options && options.headers)
            .then(function (response) {
            if (response.error) {
                throw response.error;
            }
            _this.__persisted = false;
            _this.__collection.remove(_this.type, _this.id);
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
            return typeof self_1 === 'string' ? self_1 : self_1.href;
        }
        return this.__persisted
            ? "" + NetworkUtils_1.config.baseUrl + this.type + "/" + this.id
            : "" + NetworkUtils_1.config.baseUrl + this.type;
    };
    return Record;
}(mobx_collection_store_1.Model));
/**
 * Type property of the record class
 *
 * @static
 *
 * @memberOf Record
 */
Record.typeAttribute = 'type';
exports.Record = Record;
