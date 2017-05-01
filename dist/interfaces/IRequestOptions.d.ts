import IFilters from './IFilters';
import IHeaders from './IHeaders';
interface IRequestOptions {
    headers?: IHeaders;
    include?: string | Array<string>;
    filter?: IFilters;
    sort?: string | Array<string>;
}
export default IRequestOptions;
