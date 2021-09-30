import { Contract, createMockStore, DeleteContract, GetContract, PostContract, PutContract } from './Contract'
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
    const response1 = store.getResponse('GET', '/api/test')
  })
})
