import IHeaders from './IHeaders';
import * as JsonApi from './JsonApi';

interface IRawResponse {
  data?: JsonApi.IResponse;
  error?: Error;
  headers?: IHeaders;
  requestHeaders?: IHeaders;
  status?: number;
};

export default IRawResponse;
