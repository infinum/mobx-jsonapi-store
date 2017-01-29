import IDictionary from './IDictionary';
import IJsonApiRelationship from './IJsonApiRelationship';
interface IJsonApiRecord {
    id: number | string;
    type: string;
    attributes: IDictionary<any>;
    relationships?: IDictionary<IJsonApiRelationship>;
}
export default IJsonApiRecord;
