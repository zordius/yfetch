import nock from 'nock';

export const MOCK_HOST = 'http://test';

const MOCK_CONFIG = {
    OK: ['/ok', 'Yes, OK'],
    OK_JSON: ['/ok/json', {yes: 'ok', payload: {is: 'good'}}]
};

const errorNotEnabled = 'Please run enableMockHttp first!';
export let MOCK_URLS = errorNotEnabled;
export let MOCK_BODY = errorNotEnabled;

export const enableMockHttp = () => {
    MOCK_URLS = {};
    MOCK_BODY = {};

    let N = nock(MOCK_HOST).persist();

    Object.entries(MOCK_CONFIG).forEach(([name, [path, body, code = 200]]) => {
        N = N.get(path).reply(code, body);
        MOCK_URLS[name] = MOCK_HOST + path;
        MOCK_BODY[name] = body;
    });
}

export const disableMockHttp = () => {
    MOCK_URLS = errorNotEnabled;
    MOCK_BODY = errorNotEnabled;
    nock.cleanAll();
}
