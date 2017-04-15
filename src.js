import { stringify } from 'querystring'
import debug from 'debug'
const debugRaw = debug('yfetch:raw')
const debugResult = debug('yfetch:result')
 
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
const transformForContext = fetchOpts => (response = {}) => {
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
            fetchArgs: fetchOpts
        };
    });
}
 
// keep error.fetchArgs for debug.
const transformFetchError = fetchOpts => error => {
    error.fetchArgs = fetchOpts;
    throw error;
}
 
// Export this for unit testing and mock
export const _fetch = (args) => fetch(...args);
 
// The main yfetch function
export const yfetch = (opts = {}) => {
    const fetchOpts = transformFetchOptions(opts);
 
    // module.exports._fetch allow jasmine to mock it
    return module.exports._fetch(fetchOpts)
    .then(transformForContext(fetchOpts))
    .then(transformFetchResult)
    .catch(transformFetchError(fetchOpts));
}
 
// as default
export default yfetch
