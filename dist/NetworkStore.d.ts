import { Collection } from 'mobx-collection-store';
import IHeaders from './interfaces/IHeaders';
import IRequestOptions from './interfaces/IRequestOptions';
import * as JsonApi from './interfaces/JsonApi';
export declare class NetworkStore extends Collection {
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
    protected __prepareQuery(type: string, id?: number | string, data?: JsonApi.IRequest, options?: IRequestOptions): {
        url: string;
        data?: object;
        headers: IHeaders;
    };
}
