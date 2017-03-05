import IHeaders from './interfaces/IHeaders';
import IRawResponse from './interfaces/IRawResponse';
export declare type FetchType = (method: string, url: string, body?: Object, requestHeaders?: IHeaders) => Promise<IRawResponse>;
export declare type ConfigType = {
    defaultHeaders: IHeaders;
    fetchReference: Function;
    baseFetch: FetchType;
};
export declare const config: ConfigType;
export declare function fetch(method: string, url: string, body?: Object, requestHeaders?: IHeaders): Promise<IRawResponse>;
