import IDictionary from './IDictionary';

interface IIdentifier {
  id: number|string;
  type: string;
};

type ILink = string | {href: string, meta: IDictionary<any>};

interface IError {
  id?: string|number;
  links?: {
    about: ILink,
  };
  status?: number;
  code?: string;
  title?: string;
  details?: string;
  source: {
    pointer?: string,
    parameter?: string,
  };
  meta: IDictionary<any>;
}

interface IRelationship {
  data?: IIdentifier|Array<IIdentifier>;
  links?: IDictionary<ILink>;
}

interface IRecord extends IIdentifier {
  attributes: IDictionary<any>;

  relationships?: IDictionary<IRelationship>;
}

interface IResponse {
  data?: IRecord|Array<IRecord>;
  error?: Array<IError>;

  included?: Array<IRecord>;

  meta?: Object;
  links?: IDictionary<ILink>;
}

export {
  IIdentifier,
  ILink,
  IError,
  IRelationship,
  IRecord,
  IResponse,
};
