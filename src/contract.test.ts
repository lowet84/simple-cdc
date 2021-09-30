import {
  Contract,
  createMockStore,
  DeleteContract,
  GetContract,
  PostContract,
  PutContract,
  serializeContracts
} from './Contract'
import * as path from 'path'

describe('Contract', () => {
  test('Get', () => {
    const getContract = new GetContract('Description', {
      headers: {},
      path: '/api/test',
      params: { path: {}, header: {}, query: {} }
    }, {
      success: {
        body: { name: 'myName' },
        status: 200,
        headers: { 'content-type': 'application/json' }
      }
    })
    const accessor = jest.fn()
    getContract.Fetch({ p: 'path' }, { q: 'query' }, { h: 'header' }, accessor)
    expect(accessor).toHaveBeenCalledWith('GET', '/api/test/path?q=query', { 'h': 'header' }, undefined)
  })

  test('Delete', () => {
    const getContract = new DeleteContract('Description', {
      headers: {},
      path: '/api/test',
      params: { path: {}, header: {}, query: {} }
    }, {
      success: {
        body: { name: 'myName' },
        status: 200,
        headers: { 'content-type': 'application/json' }
      }
    })
    const accessor = jest.fn()
    getContract.Fetch({ p: 'path' }, { q: 'query' }, { h: 'header' }, accessor)
    expect(accessor).toHaveBeenCalledWith('DELETE', '/api/test/path?q=query', { 'h': 'header' }, undefined)
  })

  test('Post', () => {
    const getContract = new PostContract('Description', {
      headers: {},
      path: '/api/test',
      params: { path: {}, header: {}, query: {} }
    }, { id: 'someId' }, {
      success: {
        body: { name: 'myName' },
        status: 200,
        headers: { 'content-type': 'application/json' }
      }
    })
    const accessor = jest.fn()
    getContract.Fetch({ p: 'path' }, { q: 'query' }, { h: 'header' }, { id: 'myId' }, accessor)
    expect(accessor).toHaveBeenCalledWith('POST', '/api/test/path?q=query', { 'h': 'header' }, { id: 'myId' })
  })

  test('Put', () => {
    const getContract = new PutContract('Description', {
        headers: {},
        path: '/api/test',
        params: { path: {}, header: {}, query: {} }
      },
      { id: 'someId' },
      {
        success: {
          body: { name: 'myName' },
          status: 200,
          headers: { 'content-type': 'application/json' }
        }
      })
    const accessor = jest.fn()
    getContract.Fetch({ p: 'path' }, { q: 'query' }, { h: 'header' }, { id: 'myId' }, accessor)
    expect(accessor).toHaveBeenCalledWith('PUT', '/api/test/path?q=query', { 'h': 'header' }, { id: 'myId' })
  })

  test('Get mock response', () => {
    const response = {
      body: { name: 'myName' },
      status: 200,
      headers: { 'content-type': 'application/json' }
    }
    const getContract = new GetContract('Description', {
      headers: {},
      path: '/api/test',
      params: { path: {}, header: {}, query: {} }
    }, {
      success: response
    })
    const mockResponse = getContract.GetMockResponse('success')
    expect(mockResponse).toStrictEqual(response)
  })

  test('Mock store', () => {
    const getContract = new GetContract('Description', {
      headers: {},
      path: '/api/test',
      params: { path: {}, header: {}, query: {} }
    }, {
      success: {
        body: { name: 'myName' },
        status: 200,
        headers: { 'content-type': 'application/json' }
      }
    })
    const store = createMockStore({ getContract })
    const response = store.getResponse('GET', '/api/test')
    expect(response?.body).toStrictEqual({ name: 'myName' })
    expect(response?.status).toEqual(200)
  })

  test('Mock store with transition', () => {
    const firstContract = new GetContract('Description', {
      headers: {},
      path: '/api/first',
      params: { path: {}, header: {}, query: {} }
    }, {
      withTransition: {
        body: { name: 'A' },
        status: 200,
        headers: { 'content-type': 'application/json' },
        transitions: {
          otherContract: 'responseB'
        }
      }
    })
    const otherContract = new GetContract('Description', {
      headers: {},
      path: '/api/other',
      params: { path: {}, header: {}, query: {} }
    }, {
      responseA: {
        body: { name: 'A' },
        status: 200,
        headers: { 'content-type': 'application/json' }
      },
      responseB: {
        body: { name: 'B' },
        status: 200,
        headers: { 'content-type': 'application/json' }
      }
    })
    const store = createMockStore({ firstContract, otherContract })
    const response1 = store.getResponse('GET', '/api/other')
    expect(response1?.body).toStrictEqual({ name: 'A' })
    store.getResponse('GET', '/api/first')
    const response2 = store.getResponse('GET', '/api/other')
    expect(response2?.body).toStrictEqual({ name: 'B' })
  })

  test('Mock store, path params', () => {
    const getContract = new GetContract('Description', {
      headers: {},
      path: '/api/test',
      params: { path: { id: 'id' }, header: {}, query: {} }
    }, {
      success: {
        body: { name: 'myName' },
        status: 200,
        headers: { 'content-type': 'application/json' }
      }
    })
    const store = createMockStore({ getContract })
    const response = store.getResponse('GET', '/api/test/someId')
    expect(response?.body).toStrictEqual({ name: 'myName' })
    expect(response?.status).toEqual(200)
    const wrongResponse = store.getResponse('GET', '/api/test/someId/error')
    expect(wrongResponse).toBeUndefined()
  })

  test('Mock store, query params', () => {
    const getContract = new GetContract('Description', {
      headers: {},
      path: '/api/test',
      params: { path: {}, header: {}, query: { s: 'search', lang: 'en' } }
    }, {
      success: {
        body: { name: 'myName' },
        status: 200,
        headers: { 'content-type': 'application/json' }
      }
    })
    const store = createMockStore({ getContract })
    const response1 = store.getResponse('GET', '/api/test?s=something&lang=en')
    expect(response1?.body).toStrictEqual({ name: 'myName' })
    expect(response1?.status).toEqual(200)
    const response2 = store.getResponse('GET', '/api/test?lang=en&s=something')
    expect(response2?.body).toStrictEqual({ name: 'myName' })
    const response3 = store.getResponse('GET', '/api/test?lang=en&sa=something')
    expect(response3?.body).toBeUndefined()
    const response4 = store.getResponse('GET', '/api/test?lang=en')
    expect(response4?.body).toBeUndefined()
  })

  test('serialize', () => {
    const getContract = new GetContract('Description', {
      headers: {},
      path: '/api/test',
      params: { path: {}, header: {}, query: { s: 'search', lang: 'en' } }
    }, {
      success: {
        body: { name: 'myName' },
        status: 200,
        headers: { 'content-type': 'application/json' }
      }
    })
    const serialized = serializeContracts({ getContract })
    expect(serialized).not.toBeUndefined()
  })
})
