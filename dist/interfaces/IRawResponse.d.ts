import IHeaders from './IHeaders';
import IResponseHeaders from './IResponseHeaders';
import * as JsonApi from './JsonApi';
interface IRawResponse {
    data?: JsonApi.IResponse;
    error?: Error;
    headers?: IResponseHeaders;
    requestHeaders?: IHeaders;
    status?: number;
}
export default IRawResponse;
