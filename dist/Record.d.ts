import { IModel, Model } from 'mobx-collection-store';
import IDictionary from './interfaces/IDictionary';
import IRequestOptions from './interfaces/IRequestOptions';
import * as JsonApi from './interfaces/JsonApi';
import { Response } from './Response';
export declare class Record extends Model implements IModel {
    /**
     * Type property of the record class
     *
     * @static
     *
     * @memberOf Record
     */
    static typeAttribute: string[];
    /**
     * ID property of the record class
     *
     * @static
     *
     * @memberOf Record
     */
    static idAttribute: string[];
    /**
     * Should the autogenerated ID be sent to the server when creating a record
     *
     * @static
     * @type {boolean}
     * @memberOf Record
     */
    static useAutogeneratedIds: boolean;
    /**
     * Endpoint for API requests if there is no self link
     *
     * @static
     * @type {string|() => string}
     * @memberOf Record
     */
    static endpoint: string | (() => string);
    'static': typeof Record;
    /**
     * Internal metadata
     *
     * @private
     * @type {IInternal}
     * @memberOf Record
     */
    private __internal;
    /**
     * Cache link fetch requests
     *
     * @private
     * @type {IDictionary<Promise<Response>>}
     * @memberOf Record
     */
    private __relationshipLinkCache;
    /**
     * Cache link fetch requests
     *
     * @private
     * @type {IDictionary<Promise<Response>>}
     * @memberOf Record
     */
    private __linkCache;
    /**
     * Get record relationship links
     *
     * @returns {IDictionary<JsonApi.IRelationship>} Record relationship links
     *
     * @memberOf Record
     */
    getRelationshipLinks(): IDictionary<JsonApi.IRelationship>;
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
    fetchRelationshipLink(relationship: string, name: string, options?: IRequestOptions, force?: boolean): Promise<Response>;
    /**
     * Get record metadata
     *
     * @returns {object} Record metadata
     *
     * @memberOf Record
     */
    getMeta(): object;
    /**
     * Get record links
     *
     * @returns {IDictionary<JsonApi.ILink>} Record links
     *
     * @memberOf Record
     */
    getLinks(): IDictionary<JsonApi.ILink>;
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
    fetchLink(name: string, options?: IRequestOptions, force?: boolean): Promise<Response>;
    /**
     * Get the persisted state
     *
     * @readonly
     * @private
     * @type {boolean}
     * @memberOf Record
     */
    /**
    * Set the persisted state
    *
    * @private
    *
    * @memberOf Record
    */
    private __persisted;
    /**
     * Serialize the record into JSON API format
     *
     * @returns {JsonApi.IRecord} JSON API formated record
     *
     * @memberOf Record
     */
    toJsonApi(): JsonApi.IRecord;
    /**
     * Saves (creates or updates) the record to the server
     *
     * @param {IRequestOptions} [options] Server options
     * @param {boolean} [ignoreSelf=false] Should the self link be ignored if it exists
     * @returns {Promise<Record>} Returns the record is successful or rejects with an error
     *
     * @memberOf Record
     */
    save(options?: IRequestOptions, ignoreSelf?: boolean): Promise<Record>;
    saveRelationship(relationship: string, options?: IRequestOptions): Promise<Record>;
    /**
     * Remove the records from the server and store
     *
     * @param {IRequestOptions} [options] Server options
     * @param {boolean} [ignoreSelf=false] Should the self link be ignored if it exists
     * @returns {Promise<boolean>} Resolves true if successfull or rejects if there was an error
     *
     * @memberOf Record
     */
    remove(options?: IRequestOptions, ignoreSelf?: boolean): Promise<boolean>;
    /**
     * Set the persisted status of the record
     *
     * @param {boolean} state Is the record persisted on the server
     *
     * @memberOf Record
     */
    setPersisted(state: boolean): void;
    /**
     * Get the persisted status of the record
     *
     * @memberOf Record
     */
    getPersisted(): boolean;
    /**
     * Get the URL that should be used for the API calls
     *
     * @private
     * @returns {string} API URL
     *
     * @memberOf Record
     */
    private __getUrl;
}
