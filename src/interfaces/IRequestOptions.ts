import IDictionary from './IDictionary';
import IFilters from './IFilters';
import IHeaders from './IHeaders';

interface IRequestOptions {
  headers?: IHeaders;
  include?: string|Array<string>;
  filter?: IFilters;
  sort?: string|Array<string>;
  fields?: IDictionary<string|Array<string>>;
}

export default IRequestOptions;
