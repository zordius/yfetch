import { stringify } from 'query-string';
import debug from 'debug';

const debugRaw = debug('yfetch:raw');
const debugResult = debug('yfetch:result');
const debugError = debug('yfetch:error');

export class YfetchError extends Error {}

export const JSON_HEADER = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

// Support simple opts.query , opts.base and opts.url logic
// Support opts.json headers
// return fetch() arguments
export const transformFetchOptions = ({ query, headers, base = '', url = '', ...opts }) => {
  const queryString = stringify(query);
  const urlString = base + url + (queryString ? `?${queryString}` : '');
  const H = opts.json ? JSON_HEADER : {};

  return [urlString, { headers: { ...H, ...headers }, ...opts }];
};

// Support opts.json, send debug yfetch:result
export const transformFetchResult = ({ fetchArgs, ...response }) => {
  if (fetchArgs[1].json) {
    response.body = JSON.parse(response.body);
  }

  debugResult('url: %s - status: %s - body: %O', response.url, response.status, response.body);

  return { ...response, fetchArgs };
};

// Support opts.error
export const transformFetchStatusError = ({ fetchArgs, ...response }) => {
  if (fetchArgs[1].error
      && fetchArgs[1].error.indexOf
      && fetchArgs[1].error.indexOf(response.status) > -1) {
    throw new YfetchError(`Response Code ${response.status} means Error (includes: ${fetchArgs[1].error.join(',')})`);
  }

  return { ...response, fetchArgs };
};

// handle response.text() promise, make response simple, keep response.fetchArgs
// send debug yfetch:raw
const transformForContext = fetchArgs => (response = {}) => {
  const { url, status, statusText, headers = [], ok, size } = response;
  const H = {};

  headers.forEach((v, k) => {
    H[k] = v;
  });

  const job = response.text ? response.text() : Promise.resolve();

  return job
  .then((body) => {
    debugRaw('url: %s - status: %s - size: %s - header: %o - body: %s', url, status, size, H, body);

    return {
      url,
      status,
      statusText,
      ok,
      size,
      body,
      fetchArgs,
      headers: H,
    };
  });
};

// keep error.fetchArgs and error.response , send debug yfetch:error
// const transformFetchError = (fetchArgs, { response = {} }) => (error) => {
const transformFetchError = (fetchArgs, R) => (error) => {
  const response = R.response || {};
  debugError('url: %s - status: %s - size: %s - body: %s - %O', fetchArgs[0], response.status, response.size, response.body, error);
  error.fetchArgs = fetchArgs;
  error.response = response;
  throw error;
};

// The main yfetch function
export const yfetch = (opts = {}) => {
  const fetchArgs = transformFetchOptions(opts);
  const R = {};

  const storeResponse = (response) => {
    R.response = response;
    return response;
  };

  return ((global.fetchJsonp && fetchArgs[1].jsonp)
  ? global.fetchJsonp(...fetchArgs)
  : fetch(...fetchArgs))
  .then(transformForContext(fetchArgs))
  .then(storeResponse)
  .then(transformFetchResult)
  .then(storeResponse)
  .then(transformFetchStatusError)
  .catch(transformFetchError(fetchArgs, R));
};

// as default
export default yfetch;
