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
    return key ? this.responseExamples[key] : Object.values(this.responseExamples)[0]
  }

  public MatchesUrl(url: string) {
    if (!url.startsWith(this.request.path)) return false
    const pathUrlSplit = url.replace(this.request.path, '').split('?')[0].split('/').filter(d => d.trim().length > 0)
    const params = Object.keys(this.request.params.path)
    if (pathUrlSplit.length !== params.length) return false
    const urlQuery = url.split('?')[1]
    if (urlQuery) {
      const urlQueryParams = urlQuery.split('&').map(q => q.split('='))
      const queryParams = Object.keys(this.request.params.query)
      if (urlQueryParams.length !== queryParams.length) return false
      for (const uqp of urlQueryParams) {
        if (!queryParams.some(qp => qp === uqp[0])) return false
      }
    }
    return true
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
  const selectedResponses: { [index: string]: string } = {}
  const objectToArray = <T>(obj: { [index: string]: T } | undefined) => {
    if (!obj) return []
    return Object.keys(obj).map(key => ({
      key,
      value: obj[key]
    }))
  }
  const getResponse = (method: Method, url: string) => {
    const arrayOfContracts = objectToArray(contracts)
    const filteredContractsByMethod = arrayOfContracts.filter(d => d.value.method === method)
    const contract = filteredContractsByMethod.find(c => c.value.MatchesUrl(url))
    if (!contract) return undefined
    const response = contract.value.GetMockResponse(selectedResponses[contract.key])
    objectToArray(response?.transitions).forEach(transition => selectedResponses[transition.key] = transition.value)
    return response
  }
  const setResponse = (contractKey: string, responseKey: string) => {
    selectedResponses[contractKey] = responseKey
  }
  return { getResponse, setResponse }
}
