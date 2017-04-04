import IHeaders from './IHeaders';

// TODO Be more strict once we know what we need here
interface IRequestOptions {
  headers?: IHeaders;
  include?: any;
  filter?: any;
  sort?: any;
}

export default IRequestOptions;
