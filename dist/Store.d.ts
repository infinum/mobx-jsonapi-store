import { Collection, IModel } from 'mobx-collection-store';
import IJsonApiResponse from './interfaces/IJsonApiResponse';
import { Record } from './Record';
declare class Store extends Collection {
    static types: typeof Record[];
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
     * Iterate trough JSNO API response models
     *
     * @private
     * @param {IJsonApiResponse} body - JSON API response
     * @param {Function} fn - Function to call for every instance
     * @returns
     *
     * @memberOf Store
     */
    private __iterateEntries(body, fn);
    /**
     * Import the JSON API data into the store
     *
     * @param {IJsonApiResponse} body - JSON API response
     * @returns {(IModel|Array<IModel>)} - Models parsed from body.data
     *
     * @memberOf Store
     */
    sync(body: IJsonApiResponse): IModel | Array<IModel>;
}
export { Store };
