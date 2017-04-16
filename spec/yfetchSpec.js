const target = process.env.TESTTARGET || 'src';
const yFetch = require('../' + target);
const { transformFetchOptions, yfetch } = yFetch;
import { enableMockHttp, disableMockHttp, MOCK_URLS, MOCK_BODY } from './mockHttp';

describe('yfetch [' + target + '.js]', () => {
    describe('transformFetchOptions()', () => {
        it('should handle opts.base', () => {
            expect(transformFetchOptions({base: 'pre_'})).toEqual(['pre_', {}]);
        });

        it('should handle opts.url', () => {
            expect(transformFetchOptions({url: 'test'})).toEqual(['test', {}]);
        });

        it('should handle opts.base + opts.url', () => {
            expect(transformFetchOptions({base: 'pre_', url: 'test'})).toEqual(['pre_test', {}]);
        });

        it('should handle null opts.query', () => {
            expect(transformFetchOptions({url: 'test', query: null})).toEqual(['test', {}]);
        });

        it('should handle opts.query', () => {
            expect(transformFetchOptions({url: 'test', query: {foo: 'bar'}})).toEqual(['test?foo=bar', {}]);
        });
    });

    describe('yfetch()', () => {
        describe('(unit tests)', () => {
            beforeEach(() => spyOn(yFetch, '_fetch').and.returnValue(Promise.resolve()));

            it('should call _fetch()', () => {
                yfetch();
                expect(yFetch._fetch).toHaveBeenCalled();
            });

            it('should handle opts.base + opts.url + opts.query when call _fetch()', () => {
                yfetch({url: 'ok', base: '/r/', query: {foo: 'bar'}});
                expect(yFetch._fetch).toHaveBeenCalledWith(['/r/ok?foo=bar', {}]);
            });
        });

        describe('(functional tests)', () => {
            beforeAll(enableMockHttp);
            afterAll(disableMockHttp);

            it('should be ok', () => yfetch({url: MOCK_URLS.OK}));

            it('should failed', (done) => yfetch({url: '_should_error_'}).then(done.fail, done));

            it('should failed with context', () => yfetch({url: '_should_error_'}).then(fail, (error) => {
                expect(error.response).toEqual({});
                expect(error.fetchArgs).toEqual(['_should_error_', {}]);
            }));

            it('should receive full context of fetch', () => yfetch({url: MOCK_URLS.OK}).then((context) => {
                expect(context).toEqual({
                    url: MOCK_URLS.OK,
                    headers: {},
                    status: 200,
                    statusText: 'OK',
                    ok: true,
                    body: MOCK_BODY.OK,
                    size: 0,
                    fetchArgs: [MOCK_URLS.OK, {}]
                });
            }));

            it('should support timeout', () => yfetch({url: MOCK_URLS.OK_DELAY2, timeout: 100}).then(fail, (error) => {
                expect(error.response).toEqual({});
                expect(error.fetchArgs).toEqual([MOCK_URLS.OK_DELAY2, {timeout: 100}]);
            }));
        });
    });
});
