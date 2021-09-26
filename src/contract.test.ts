import { Contract, GetContract } from './Contract'
import * as path from 'path'

describe('Contract', () => {
  test('Create contract', () => {
    const contract = new Contract(
      'Description',
      'GET',
      {
        headers: {},
        path: '/api/test',
        params: { path: { p: 'somepath' }, query: { q: 'somequery' }, header: { h: 'someheader' } }
      },
      undefined,
      {
        success: {
          body: { name: 'myName' },
          status: 200,
          headers: { 'content-type': 'application/json' }
        }
      }
    )
    const accessor = jest.fn()
    contract.Fetch({ p: 'path' }, { q: 'query' }, { h: 'header' }, undefined, accessor)
    expect(accessor).toHaveBeenCalledWith('GET', '/api/test/path?q=query', { 'h': 'header' }, undefined)
  })

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
})
