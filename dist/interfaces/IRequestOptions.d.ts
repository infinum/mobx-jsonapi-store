import IFilters from './IFilters';
import IHeaders from './IHeaders';
interface IRequestOptions {
    headers?: IHeaders;
    include?: any;
    filter?: IFilters;
    sort?: string | Array<string>;
}
export default IRequestOptions;
