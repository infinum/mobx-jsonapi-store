import { Collection, IModel } from 'mobx-collection-store';
import IJsonApiResponse from './interfaces/IJsonApiResponse';
declare class Store extends Collection {
    private __addRecord(obj);
    sync(body: IJsonApiResponse): IModel | Array<IModel>;
}
export { Store };
