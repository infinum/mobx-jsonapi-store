import IDictionary from './IDictionary';

import {Response} from '../Response';

interface ICache {
  fetchAll: IDictionary<Promise<Response>>;
}

export default ICache;
