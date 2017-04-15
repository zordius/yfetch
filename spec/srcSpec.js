import * as yFetch from '../src'
import { decorateFetchOptions, yfetch } from '../src'
import { enableMockHttp, disableMockHttp, MOCK_URLS, MOCK_BODY } from '../mockHttp'

describe('yfetch', () => {
    describe('decorateFetchetchOptions()', () => {
        it('should handle opts.base', () => {
            expect(decorateFetchetchOptions({base: 'pre_'})).toEqual(['pre_', {}]);
        });

        it('should handle opts.url', () => {
            expect(decorateFetchetchOptions({url: 'test'})).toEqual(['test', {}]);
        });

        it('should handle opts.base + opts.url', () => {
            expect(decorateFetchetchOptions({base: 'pre_', url: 'test'})).toEqual(['pre_test', {}]);
        });

        it('should handle null opts.query', () => {
            expect(decorateFetchetchOptions({url: 'test', query: null})).toEqual(['test', {}]);
        });

        it('should handle opts.query', () => {
            expect(decorateFetchetchOptions({url: 'test', query: {foo: 'bar'}})).toEqual(['test?foo=bar', {}]);
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

            it('should receive full context of fetch', () => yfetch({url: MOCK_URLS.OK}).then((context) => {
                expect(context).toEqual({
                    url: MOCK_URLS.OK,
                    headers: {},
                    status: 200,
                    statusText: 'OK',
                    ok: true,
                    body: MOCK_BODY.OK,
                    size: 0,
                    fetchOptions: [MOCK_URLS.OK, {}]
                });
            }));
        });
    });
});
