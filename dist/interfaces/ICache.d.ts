import IDictionary from './IDictionary';
import { Response } from '../Response';
interface ICache {
    fetchAll: IDictionary<IDictionary<Promise<Response>>>;
    fetch: IDictionary<IDictionary<Promise<Response>>>;
}
export default ICache;
