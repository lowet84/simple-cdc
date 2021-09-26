import { GetInteraction, ParamsObject } from './interaction'

describe('interactions', function() {
  describe('accessor', () => {
    describe('get', () => {
      test('no parameters', async () => {
        const accessor = jest.fn().mockImplementation((...args) => args)
        const interaction: GetInteraction<{ name: string },
          ParamsObject.NoParams> = {
          withRequest: {
            path: '/api/test',
            params: { path: {}, query: {}, headers: {} },
            headers: {}
          },
          responseExamples: {
            success: {
              body: { name: 'someName' },
              status: 200
            }
          }
        }
        await GetInteraction(
          interaction,
          { path: {}, query: {}, headers: {} },
          accessor
        )
        expect(accessor).toHaveBeenCalledWith(
          'GET',
          '/api/test/',
          undefined,
          {}
        )
      })

      test('path parameters', async () => {
        const accessor = jest.fn().mockImplementation((...args) => args)
        const interaction: GetInteraction<{ name: string },
          ParamsObject.PathParams<{ id: string }>> = {
          withRequest: {
            path: '/api/test',
            params: { path: { id: 'id' }, query: {}, headers: {} },
            headers: {}
          },
          responseExamples: {
            success: {
              body: { name: 'someName' },
              status: 200
            }
          }
        }
        await GetInteraction(
          interaction,
          { path: { id: '123456' }, query: {}, headers: {} },
          accessor
        )
        expect(accessor).toHaveBeenCalledWith(
          'GET',
          '/api/test/123456',
          undefined,
          {}
        )
      })

      test('query parameters', async () => {
        const accessor = jest.fn().mockImplementation((...args) => args)
        const interaction: GetInteraction<{ name: string },
          ParamsObject.QueryParams<{ search: string; key: string }>> = {
          withRequest: {
            path: '/api/test',
            params: {
              path: {},
              query: { search: 'search', key: 'key' },
              headers: {}
            },
            headers: {}
          },
          responseExamples: {
            success: {
              body: { name: 'someName' },
              status: 200
            }
          }
        }

        await GetInteraction(
          interaction,
          { path: {}, query: { search: 'abcde', key: 'somekey' }, headers: {} },
          accessor
        )
        expect(accessor).toHaveBeenCalledWith(
          'GET',
          '/api/test/?search=abcde&key=somekey',
          undefined,
          {}
        )
      })

      test.skip('ignore extra parameters', async () => {
        const accessor = jest.fn().mockImplementation((...args) => args)
        const interaction: GetInteraction<{ name: string },
          ParamsObject.PathQueryHeaderParams<{ path: string }, { query: string }, { header: string }>> = {
          withRequest: {
            path: '/api/test',
            params: {
              path: { path: 'somepath' },
              query: { query: 'somequery' },
              headers: { header: 'someheader' }
            },
            headers: {}
          },
          responseExamples: {
            success: {
              body: { name: 'someName' },
              status: 200
            }
          }
        }
        const path = { path: 'p', extra: 'd' }
        const query = { query: 'q', extra: 'd' }
        const headers = { header: 'h', extra: 'd' }
        await GetInteraction(
          interaction,
          { path, query, headers },
          accessor
        )
        expect(accessor).toHaveBeenCalledWith(
          'GET',
          '/api/test/p/?query=q',
          undefined,
          { header: 'h' }
        )
      })
    })
  })
})
