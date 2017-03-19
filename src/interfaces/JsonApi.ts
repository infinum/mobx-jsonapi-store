import IDictionary from './IDictionary';

interface IIdentifier {
  id?: number|string;
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
  source?: {
    pointer?: string,
    parameter?: string,
  };
  meta?: IDictionary<any>;
}

interface IRelationship {
  data?: IIdentifier|Array<IIdentifier>;
  links?: IDictionary<ILink>;
}

interface IRecord extends IIdentifier {
  attributes: IDictionary<any>;

  relationships?: IDictionary<IRelationship>;
  links?: IDictionary<ILink>;
  meta?: IDictionary<ILink>;
}

interface IResponse {
  data?: IRecord|Array<IRecord>;
  errors?: Array<IError>;

  included?: Array<IRecord>;

  meta?: Object;
  links?: IDictionary<ILink>;
}

type IRequest = IResponse; // Not sure if this is correct, but it's ok for now

export {
  IIdentifier,
  ILink,
  IError,
  IRelationship,
  IRecord,
  IResponse,
  IRequest,
};
