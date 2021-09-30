export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type Params = { [index: string]: string }

export interface ResponseExample<TResponseBody> {
  description?: string
  status: number
  headers?: { [index: string]: string }
  body?: TResponseBody
  transitions?: Params
}

export interface Request<TPathParams extends Params, TQueryParams extends Params, THeaderParams extends Params> {
  path: string,
  headers: Params
  params: {
    path: TPathParams,
    query: TQueryParams,
    header: THeaderParams
  },
}

export abstract class Contract<TPathParams extends Params, TQueryParams extends Params, THeaderParams extends Params, TResponseBody, TRequestBody> {
  public method: Method

  protected constructor(
    private description: string,
    method: Method,
    private request: Request<TPathParams, TQueryParams, THeaderParams>,
    private requestBody: TRequestBody,
    private responseExamples: { [index: string]: ResponseExample<TResponseBody> }) {
    this.method = method
  }

  protected async BaseFetch<T>(pathParams: TPathParams, queryParams: TQueryParams, headersParams: THeaderParams, requestBody: TRequestBody, callback: (method: Method, url: string, headers: Params, body: TRequestBody) => Promise<T>) {
    const pathParamsValue = Object.values(pathParams).join('/')
    const queryParamsValue = Object.keys(queryParams).length === 0 ? '' : `?${Object.keys(queryParams).map(key => `${key}=${queryParams[key]}`).join('&')}`
    return await callback(this.method, `${this.request.path}/${pathParamsValue}${queryParamsValue}`, headersParams, requestBody)
  }

  public GetMockResponse(key: string) {
    return this.responseExamples[key]
  }
}

export class GetContract<TPathParams extends Params, TQueryParams extends Params, THeaderParams extends Params, TResponseBody> extends Contract<TPathParams, TQueryParams, THeaderParams, TResponseBody, undefined> {
  constructor(
    description: string,
    request: Request<TPathParams, TQueryParams, THeaderParams>,
    responseExamples: { [index: string]: ResponseExample<TResponseBody> }) {
    super(description, 'GET', request, undefined, responseExamples)
  }

  public async Fetch<T>(pathParams: TPathParams, queryParams: TQueryParams, headersParams: THeaderParams, callback: (method: Method, url: string, headers: Params) => Promise<T>) {
    return await this.BaseFetch(pathParams, queryParams, headersParams, undefined, callback)
  }
}

export class DeleteContract<TPathParams extends Params, TQueryParams extends Params, THeaderParams extends Params, TResponseBody> extends Contract<TPathParams, TQueryParams, THeaderParams, TResponseBody, undefined> {
  constructor(
    description: string,
    request: Request<TPathParams, TQueryParams, THeaderParams>,
    responseExamples: { [index: string]: ResponseExample<TResponseBody> }) {
    super(description, 'DELETE', request, undefined, responseExamples)
  }

  public async Fetch<T>(pathParams: TPathParams, queryParams: TQueryParams, headersParams: THeaderParams, callback: (method: Method, url: string, headers: Params) => Promise<T>) {
    return await this.BaseFetch(pathParams, queryParams, headersParams, undefined, callback)
  }
}

export class PostContract<TPathParams extends Params, TQueryParams extends Params, THeaderParams extends Params, TResponseBody, TRequestBody> extends Contract<TPathParams, TQueryParams, THeaderParams, TResponseBody, TRequestBody> {
  constructor(
    description: string,
    request: Request<TPathParams, TQueryParams, THeaderParams>,
    requestBody: TRequestBody,
    responseExamples: { [index: string]: ResponseExample<TResponseBody> }) {
    super(description, 'POST', request, requestBody, responseExamples)
  }

  public async Fetch<T>(pathParams: TPathParams, queryParams: TQueryParams, headersParams: THeaderParams, body: TRequestBody, callback: (method: Method, url: string, headers: Params) => Promise<T>) {
    return await this.BaseFetch(pathParams, queryParams, headersParams, body, callback)
  }
}

export class PutContract<TPathParams extends Params, TQueryParams extends Params, THeaderParams extends Params, TResponseBody, TRequestBody> extends Contract<TPathParams, TQueryParams, THeaderParams, TResponseBody, TRequestBody> {
  constructor(
    description: string,
    request: Request<TPathParams, TQueryParams, THeaderParams>,
    requestBody: TRequestBody,
    responseExamples: { [index: string]: ResponseExample<TResponseBody> }) {
    super(description, 'PUT', request, requestBody, responseExamples)
  }

  public async Fetch<T>(pathParams: TPathParams, queryParams: TQueryParams, headersParams: THeaderParams, body: TRequestBody, callback: (method: Method, url: string, headers: Params) => Promise<T>) {
    return await this.BaseFetch(pathParams, queryParams, headersParams, body, callback)
  }
}

export const createMockStore = (contracts: {
  [index: string]: Contract<any, any, any, any, any>
}) => {
  const urlMatchesContract = (url: string, contract: Contract<any, any, any, any, any>) => {
    return true
  }
  const getResponse = (method: Method, url: string) => {
    const contract = Object.values(contracts).filter(c => c.method === method).find(c => urlMatchesContract(url, c))

  }
  return { getResponse }
}
