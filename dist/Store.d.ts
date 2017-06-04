import { IModel } from 'mobx-collection-store';
import IRequestOptions from './interfaces/IRequestOptions';
import * as JsonApi from './interfaces/JsonApi';
import { NetworkStore } from './NetworkStore';
import { Record } from './Record';
import { Response } from './Response';
export declare class Store extends NetworkStore {
    /**
     * List of Models that will be used in the collection
     *
     * @static
     *
     * @memberOf Store
     */
    static types: typeof Record[];
    /**
     * Should the cache be used for API calls when possible
     *
     * @static
     *
     * @memberof Store
     */
    static cache: boolean;
    static: typeof Store;
    /**
     * Cache async actions (can be overriden with force=true)
     *
     * @private
     *
     * @memberOf Store
     */
    private __cache;
    /**
     * Import the JSON API data into the store
     *
     * @param {IJsonApiResponse} body - JSON API response
     * @returns {(IModel|Array<IModel>)} - Models parsed from body.data
     *
     * @memberOf Store
     */
    sync(body: JsonApi.IResponse): IModel | Array<IModel>;
    /**
     * Fetch the records with the given type and id
     *
     * @param {string} type Record type
     * @param {number|string} type Record id
     * @param {boolean} [force] Force fetch (currently not used)
     * @param {IRequestOptions} [options] Server options
     * @returns {Promise<Response>} Resolves with the Response object or rejects with an error
     *
     * @memberOf Store
     */
    fetch(type: string, id: number | string, force?: boolean, options?: IRequestOptions): Promise<Response>;
    /**
     * Fetch the first page of records of the given type
     *
     * @param {string} type Record type
     * @param {boolean} [force] Force fetch (currently not used)
     * @param {IRequestOptions} [options] Server options
     * @returns {Promise<Response>} Resolves with the Response object or rejects with an error
     *
     * @memberOf Store
     */
    fetchAll(type: string, force?: boolean, options?: IRequestOptions): Promise<Response>;
    /**
     * Destroy a record (API & store)
     *
     * @param {string} type Record type
     * @param {(number|string)} id Record id
     * @param {IRequestOptions} [options] Server options
     * @returns {Promise<boolean>} Resolves true or rejects with an error
     *
     * @memberOf Store
     */
    destroy(type: string, id: number | string, options?: IRequestOptions): Promise<boolean>;
    request(url: string, method?: string, data?: object, options?: IRequestOptions): Promise<Response>;
    /**
     * Make the request and handle the errors
     *
     * @param {IQueryParams} query Request query info
     * @param {IRequestOptions} [options] Server options
     * @returns {Promise<Response>} Resolves with the Response object or rejects with an error
     *
     * @memberof Store
     */
    private __doFetch(query, options?);
    /**
     * Function used to handle response errors
     *
     * @private
     * @param {Response} response API response
     * @returns API response
     *
     * @memberOf Store
     */
    private __handleErrors(response);
    /**
     * Add a new JSON API record to the store
     *
     * @private
     * @param {IJsonApiRecord} obj - Object to be added
     * @returns {IModel}
     *
     * @memberOf Store
     */
    private __addRecord(obj);
    /**
     * Update the relationships between models
     *
     * @private
     * @param {IJsonApiRecord} obj - Object to be updated
     * @returns {void}
     *
     * @memberOf Store
     */
    private __updateRelationships(obj);
    /**
     * Iterate trough JSON API response models
     *
     * @private
     * @param {IJsonApiResponse} body - JSON API response
     * @param {Function} fn - Function to call for every instance
     * @returns
     *
     * @memberOf Store
     */
    private __iterateEntries(body, fn);
}
