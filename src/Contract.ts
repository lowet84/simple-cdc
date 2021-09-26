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

export class Contract<TPathParams extends Params, TQueryParams extends Params, THeaderParams extends Params, TResponseBody, TRequestBody> {
  constructor(
    private description: string,
    private method: Method,
    private request: Request<TPathParams, TQueryParams, THeaderParams>,
    private requestBody: TRequestBody,
    private responseExamples: { [index: string]: ResponseExample<TResponseBody> }) {
  }

  public async Fetch<T>(pathParams: TPathParams, queryParams: TQueryParams, headersParams: THeaderParams, requestBody: TRequestBody, callback: (method: Method, url: string, headers: Params, body: TRequestBody) => Promise<T>) {
    const pathParamsValue = Object.values(pathParams).join('/')
    const queryParamsValue = Object.keys(queryParams).length === 0 ? '' : `?${Object.keys(queryParams).map(key => `${key}=${queryParams[key]}`).join('&')}`
    return await callback(this.method, `${this.request.path}/${pathParamsValue}${queryParamsValue}`, headersParams, requestBody)
  }
}

export class GetContract<TPathParams extends Params, TQueryParams extends Params, THeaderParams extends Params, TResponseBody> {
  contract: Contract<TPathParams, TQueryParams, THeaderParams, TResponseBody, undefined>

  constructor(
    description: string,
    request: Request<TPathParams, TQueryParams, THeaderParams>,
    responseExamples: { [index: string]: ResponseExample<TResponseBody> }) {
    this.contract = new Contract(description, 'GET', request, undefined, responseExamples)
  }

  public async Fetch<T>(pathParams: TPathParams, queryParams: TQueryParams, headersParams: THeaderParams, callback: (method: Method, url: string, headers: Params) => Promise<T>) {
    return await this.contract.Fetch(pathParams, queryParams, headersParams, undefined, callback)
  }
}
