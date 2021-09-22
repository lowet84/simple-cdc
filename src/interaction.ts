export interface BaseInteraction<TResponseBody,
  TParams extends ParamsObject.AllParams> {
  description: string;
  withRequest: {
    path: string;
    params: TParams;
    headers: { [index: string]: string };
  };
  responseExamples: ResponseObject<TResponseBody>;
}

export type ResponseObject<TResponseBody> = {
  [index: string]: {
    description: string;
    status: number;
    headers?: { [index: string]: string };
    body?: TResponseBody;
    transitions?: ParamsObject.ParamsValues;
  };
};

export namespace ParamsObject {
  export type ParamsValues = { [index: string]: string };
  export type AllParams = {
    path: ParamsValues;
    query: ParamsValues;
    headers: ParamsValues;
  };
  export type NoParams = { path: {}; query: {}; headers: {} };
  export type PathParams<TPath extends ParamsValues> = {
    path: TPath;
    query: {};
    headers: {};
  };
  export type PathQueryParams<TPath extends ParamsValues,
    TQuery extends ParamsValues> = { path: TPath; query: TQuery; headers: {} };
  export type PathHeaderParams<TPath extends ParamsValues,
    THeaders extends ParamsValues> = { path: TPath; query: {}; headers: THeaders };
  export type QueryParams<T extends ParamsValues> = {
    path: {};
    query: T;
    headers: {};
  };
  export type QueryHeaderParams<TQuery extends ParamsValues,
    THeaders extends ParamsValues> = { path: {}; query: TQuery; headers: THeaders };
  export type HeaderParams<T extends ParamsValues> = {
    path: {};
    query: {};
    headers: T;
  };
}

export interface RequestBodyInteraction<TResponseBody,
  TParams extends ParamsObject.AllParams,
  TRequestBody> extends BaseInteraction<TResponseBody, TParams> {
  request: {
    path: string;
    params: TParams;
    requestBody: TRequestBody;
    headers: { [index: string]: string };
  };
}

export interface GetInteraction<TResponseBody,
  TParams extends ParamsObject.AllParams> extends BaseInteraction<TResponseBody, TParams> {
}

export interface DeleteInteraction<TResponseBody,
  TParams extends ParamsObject.AllParams> extends BaseInteraction<TResponseBody, TParams> {
}

export interface PostInteraction<TResponseBody,
  TParams extends ParamsObject.AllParams,
  TRequestBody> extends RequestBodyInteraction<TResponseBody, TParams, TRequestBody> {
}

export interface PutInteraction<TResponseBody,
  TParams extends ParamsObject.AllParams,
  TRequestBody> extends RequestBodyInteraction<TResponseBody, TParams, TRequestBody> {
}

export function getUrl(
  interaction: BaseInteraction<any, ParamsObject.AllParams>
) {
  const pathParams = Object.values(interaction.withRequest.params.path);
  const query = Object.keys(interaction.withRequest.params.query)
    .map((key) => `${key}=${interaction.withRequest.params.query[key]}`)
    .join("&");
  return `${interaction.withRequest.path}/${pathParams.join("/")}${
    query.length === 0 ? "" : `?${query}`
  }`;
}

export function GetInteraction<TBody,
  TParams extends ParamsObject.AllParams,
  TAccessor>(
  interaction: GetInteraction<TBody, TParams>,
  params: TParams,
  accessor: AccessorMethod<TAccessor>
) {
  return accessor("GET", getUrl(interaction), undefined, params.headers);
}

export function DeleteInteraction<TBody,
  TParams extends ParamsObject.AllParams,
  TAccessor>(
  interaction: DeleteInteraction<TBody, TParams>,
  params: TParams,
  accessor: AccessorMethod<TAccessor>
) {
  return accessor("DELETE", getUrl(interaction), undefined, params.headers);
}

export function PostInteraction<TResponseBody,
  TParams extends ParamsObject.AllParams,
  TRequestBody,
  TAccessor>(
  interaction: PostInteraction<TResponseBody, TParams, TRequestBody>,
  requestBody: TRequestBody,
  params: TParams,
  accessor: AccessorMethod<TAccessor>
) {
  return accessor("POST", getUrl(interaction), requestBody, params.headers);
}

export function PutInteraction<TResponseBody,
  TParams extends ParamsObject.AllParams,
  TRequestBody,
  TAccessor>(
  interaction: PutInteraction<TResponseBody, TParams, TRequestBody>,
  requestBody: TRequestBody,
  params: TParams,
  accessor: AccessorMethod<TAccessor>
) {
  return accessor("PUT", getUrl(interaction), requestBody, params.headers);
}

export type Method = "GET" | "POST" | "PUT" | "DELETE";
export type AccessorMethod<T> = (
  method: Method,
  url: string,
  body: any,
  headers: ParamsObject.ParamsValues
) => T;

export type InteractionsCollection = { [index: string]: BaseInteraction<any, any> }

export const createMockStore = (interactions: InteractionsCollection) => {
  const state = Object.keys(interactions).reduce((acc, cur) => {
    acc[cur] = Object.keys(interactions[cur].responseExamples)[0]
    return acc
  }, {} as { [index: string]: string })

  function getResponse(
    method: Method,
    url: string,
    body: any,
    headers: ParamsObject.ParamsValues) {

  }

  function setState(interactionKey: string, responseKey: string) {
    if (!interactions[interactionKey]) throw `Interaction: ${interactionKey} not found`
    if (!interactions[interactionKey].responseExamples[responseKey]) throw `Interaction ${interactionKey} does not have a response with key: ${responseKey}`
    state[interactionKey] = responseKey
  }

  return {getResponse, setState}
}
