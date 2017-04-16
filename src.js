import { stringify } from 'querystring'
import debug from 'debug'
const debugRaw = debug('yfetch:raw')
const debugResult = debug('yfetch:result')
const debugError = debug('yfetch:error')
 
// Support simple opts.query and opts.base
// the output can be inputed into fetch() as arguments
export const transformFetchOptions = ({query, base = '', url = '', ...opts})  => {
    const queryString = stringify(query);
    const urlString = base + url + (queryString ? ('?' + queryString)  : '');
 
    return [urlString, opts];
}
 
// Support opts.json to JSON parse the response.body
export const transformFetchResult = (context = {}) => {
    const {fetchArgs, ...response} = context;
 
    if (fetchArgs.json) {
        response.body = JSON.parse(response.body);
    }
 
    debugResult('url: %s - status: %s - body: %O', response.url, response.status, response.body);
 
    return {...response, fetchArgs};
}
 
// handle response.text() promise, make response simple, keep response.fetchArgs for debug.
const transformForContext = fetchArgs => (response = {}) => {
    const {url, status, statusText, headers = [], ok, body, size} = response;
    const H = {};
 
    headers.forEach((v, k) => {
        H[k] = v;
    });
 
    let job = response.text ? response.text() : Promise.resolve();
 
    return job
    .then((bodyText) => {
        debugRaw('url: %s - status: %s - size: %s - header: %o - body: %s', url, status, size, H, bodyText);
 
        return {
            url, status, statusText, ok, size,
            headers: H,
            body: bodyText,
            fetchArgs: fetchArgs
        };
    });
}
 
// keep error.fetchArgs for debug.
const transformFetchError = (fetchArgs, response) => error => {
    debugError('url: %s - status: %s - size: %s - body: %s - %O', fetchArgs[0], response.status, response.size, response.body, error);
    error.fetchArgs = fetchArgs;
    error.response = response;
    throw error;
}
 
// Export this for unit testing and mock
export const _fetch = (args) => fetch(...args);
 
// The main yfetch function
export const yfetch = (opts = {}) => {
    const fetchArgs = transformFetchOptions(opts);
    let R = {};
 
    // module.exports._fetch allow jasmine to mock it
    return module.exports._fetch(fetchArgs)
    .then(transformForContext(fetchArgs))
    .then((response) => Object.assign(R, response))
    .then(transformFetchResult)
    .catch(transformFetchError(fetchArgs, R));
}
 
// as default
export default yfetch
