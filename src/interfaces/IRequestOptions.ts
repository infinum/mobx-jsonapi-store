import IFilters from './IFilters';
import IHeaders from './IHeaders';

// TODO Be more strict once we know what we need here
interface IRequestOptions {
  headers?: IHeaders;
  include?: any;
  filter?: IFilters;
  sort?: string|Array<string>;
}

export default IRequestOptions;
