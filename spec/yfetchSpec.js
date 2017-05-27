import { enableMockHttp, disableMockHttp, MOCK_URLS, MOCK_BODY } from './mockHttp';

const target = process.env.TESTTARGET || 'src';
const yFetch = require(`../${target}`);
const { transformFetchOptions, yfetch } = yFetch;

describe(`yfetch [${target}.js]`, () => {
  describe('transformFetchOptions()', () => {
    it('should handle opts.base', () => {
      expect(transformFetchOptions({ base: 'pre_' })).toEqual(['pre_', { headers: {} }]);
    });

    it('should handle opts.url', () => {
      expect(transformFetchOptions({ url: 'test' })).toEqual(['test', { headers: {} }]);
    });

    it('should handle opts.base + opts.url', () => {
      expect(transformFetchOptions({ base: 'pre_', url: 'test' })).toEqual(['pre_test', { headers: {} }]);
    });

    it('should handle null opts.query', () => {
      expect(transformFetchOptions({ url: 'test', query: null })).toEqual(['test', { headers: {} }]);
    });

    it('should handle opts.query', () => {
      expect(transformFetchOptions({ url: 'test', query: { foo: 'bar' } })).toEqual(['test?foo=bar', { headers: {} }]);
    });

    it('should hanlde headers when opts.json is true', () => {
      expect(transformFetchOptions({ json: true })).toEqual(['', { json: true, headers: { Accept: 'application/json', 'Content-Type': 'application/json' } }]);
    });

    it('should allow different headers when opts.json is true', () => {
      expect(transformFetchOptions({ json: true, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })).toEqual(['', { json: true, headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' } }]);
    });
  });

  describe('yfetch()', () => {
    describe('(unit tests)', () => {
      beforeEach(() => spyOn(yFetch, 'executeFetch').and.returnValue(Promise.resolve()));

      it('should call executeFetch()', () => {
        yfetch();
        expect(yFetch.executeFetch).toHaveBeenCalled();
      });

      it('should handle opts.base + opts.url + opts.query when call executeFetch()', () => {
        yfetch({ url: 'ok', base: '/r/', query: { foo: 'bar' } });
        expect(yFetch.executeFetch).toHaveBeenCalledWith(['/r/ok?foo=bar', { headers: {} }]);
      });
    });

    describe('(functional tests)', () => {
      beforeAll(enableMockHttp);
      afterAll(disableMockHttp);

      it('should be ok', () => yfetch({ url: MOCK_URLS.OK }));

      it('should failed', done => yfetch({ url: '_should_error_' }).then(done.fail, done));

      it('should failed with context', () => yfetch({ url: '_should_error_' }).then(fail, (error) => {
        expect(error.response).toEqual({});
        expect(error.fetchArgs).toEqual(['_should_error_', { headers: {} }]);
      }));

      it('should receive full context of fetch', () => yfetch({ url: MOCK_URLS.OK }).then((context) => {
        expect(context).toEqual({
          url: MOCK_URLS.OK,
          headers: {},
          status: 200,
          statusText: 'OK',
          ok: true,
          body: MOCK_BODY.OK,
          size: 0,
          fetchArgs: [MOCK_URLS.OK, { headers: {} }],
        });
      }));

      it('should support timeout', () => yfetch({ url: MOCK_URLS.OK_DELAY2, timeout: 100 }).then(fail, (error) => {
        expect(error.response).toEqual({});
        expect(error.fetchArgs).toEqual([MOCK_URLS.OK_DELAY2, { timeout: 100, headers: {} }]);
      }));

      // json
      it('should response text when no opts.json', () => yfetch({ url: MOCK_URLS.OK_JSON }).then((response) => {
        expect(response.body).toEqual(JSON.stringify(MOCK_BODY.OK_JSON));
      }));
      it('should handle JSON when opts.json is true', () => yfetch({ url: MOCK_URLS.OK_JSON, json: true }).then((response) => {
        expect(response.body).toEqual(MOCK_BODY.OK_JSON);
      }));

      // error
      it('should ignore bad opts.error', () => yfetch({ url: MOCK_URLS.OK, error: 1 }));
      it('should ignore empty opts.error', () => yfetch({ url: MOCK_URLS.OK, error: [] }));
      it('should success when opts.error not matched', () => yfetch({ url: MOCK_URLS.OK, error: [404, 500] }));
      it('should threat code 200 as error', () => yfetch({ url: MOCK_URLS.OK, error: [200] }).then(fail, (err) => {
        expect(err.message).toEqual('Response Code 200 means Error (includes: 200)');
        })
      );
      it('should threat code 200 as error', done => yfetch({ url: MOCK_URLS.OK, error: [100, 200, 300] }).then(fail, (err) => {
        expect(err.message).toEqual('Response Code 200 means Error (includes: 100,200,300)');
        expect(err.response).toEqual({
          url: 'http://test/ok',
          status: 200,
          statusText: 'OK',
          ok: true,
          size: 0,
          body: 'Yes, OK',
          headers: {},
          fetchArgs: ['http://test/ok', {
            headers: {},
            error: [100, 200, 300],
          }],
        });
        done();
      }));
    });
  });
});
