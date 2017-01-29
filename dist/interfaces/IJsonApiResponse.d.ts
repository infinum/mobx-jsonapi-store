import IJsonApiRecord from './IJsonApiRecord';
interface IJsonApiResponse {
    data: IJsonApiRecord | Array<IJsonApiRecord>;
    included?: Array<IJsonApiRecord>;
}
export default IJsonApiResponse;
