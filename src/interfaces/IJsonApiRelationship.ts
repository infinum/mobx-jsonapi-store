import IJsonApiIdentifier from './IJsonApiIdentifier';
import IDictionary from './IDictionary';

interface IJsonApiRelationship {
  data?: IJsonApiIdentifier|Array<IJsonApiIdentifier>;
  links?: IDictionary<string>;
}

export default IJsonApiRelationship;