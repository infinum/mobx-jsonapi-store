import IDictionary from './IDictionary';
import IJsonApiIdentifier from './IJsonApiIdentifier';
interface IJsonApiRelationship {
    data?: IJsonApiIdentifier | Array<IJsonApiIdentifier>;
    links?: IDictionary<string>;
}
export default IJsonApiRelationship;
