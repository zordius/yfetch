yfetch
======
Yet another fetch. A guide for "How to make fetch more beautiful?".

[![npm version](https://img.shields.io/npm/v/yfetch.svg)](https://www.npmjs.org/package/yfetch) [![Build Status](https://travis-ci.org/zordius/yfetch.svg?branch=master)](https://travis-ci.org/zordius/yfetch) [![Test Coverage](https://codeclimate.com/github/zordius/yfetch/badges/coverage.svg)](https://codeclimate.com/github/zordius/yfetch) [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

[fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) is a new API based on [Promise](https://developers.google.com/web/fundamentals/getting-started/primers/promises), it help you to prevent callback hell.

I like fetch, so here is a set of use cases and example codes to know how to use yfetch or make your fetch coding style better.

**Core Features**:
* A set of transform functions to help you to deal with fetch request or response.
* support JSONP at client side.
* Accept same options just like fetch with some extensions:
  * `opts.base` : base url
  * `opts.query` : will be appended into url automatically
  * `opts.url` : pass into fetch() as 1st param with processed opts.base and opts.query
  * `opts.json` : auto json headers in request, then json parse the response.body
  * `opts.ignoreJsonError` : ignore JSON parse error, and the respose.body will be a string
  * `opts.error` : rejects when the response http code be included in opts.error array
  * `response.body` : auto resolved as String or JSON
  * `response.parsed` : true when opts.json successed
  * `response.headers` : auto transformed as Object from Header
  * `response.fetchArgs` : the arguments of the fetch call
* [debug](https://www.npmjs.com/package/debug) , export DEBUG=... to show debug log:
  * `yfetch:start`: show url and fetch arguments just before the request starts
  * `yfetch:raw` : show url, response size, status, headers, raw
  * `yfetch:result` : show url, response status, body as text or JSON
  * `yfetch:error` : show url, response status, body as text or JSON, error

Install
-------

```
npm install yfetch --save
```

You will need these polyfills for older browsers or other environments:
* [Promise](https://www.npmjs.com/search?q=promise%20polyfill&page=1&ranking=popularity) : [browser support](http://caniuse.com/#feat=promises)
* [fetch](https://www.npmjs.com/search?q=fetch%20polyfill&page=1&ranking=popularity) : [browser support](http://caniuse.com/#feat=fetch)

Usage
-----

```javascript
import yfetch from 'yfetch';

// Same as fetch('https://some.where/test?page=10&size=5', {})
yfetch({
  url: '/test',
  base: 'https://some.where',
  query: {
    page: 10,
    size: 5
  }
}).then((ret) => console.log(ret));

/*
{
  url: 'https://some.where/test?page=10&size=5',
  headers: { ... },
  status: 200,
  statusText: 'OK',
  ok: true,
  body: '...',                                  // yfetch transformed text or JSON
  size: 1234,
  fetchArgs: [                                  // yfetch exntends attribute,
    'https://some.where/test?page=10&size=5',   // original fetch arguments stores here
    {}
  ]
}
*/
```

**JSONP**

You will need <a href="https://www.npmjs.com/package/fetch-jsonp">fetch-jsonp</a> for JSONP feature. When you set { jsonp: true } in yfetch arguments and global.fetchJsonp() exists, the request will made by jsonp.

```javascript

import yfetch from 'yfetch';

yfetch({
  url: 'http://another.host.com/jsonp',
  jsonp: true,                          // Required for jsonp
  // Allow fetch-jsonp options https://github.com/camsong/fetch-jsonp
  jsonpCallback: 'custom_callback_param_name',            // Optional
  jsonpCallbackFunction: 'custom_callback_function_name', // Optional
}).then((ret) => console.log(ret.body));
```

To ensure global.fetchJsonp() ready at client side, you can add these:

```javascript
import fetchJsonp from 'fetch-jsonp'

if (global.window) {
  global.fetchJsonp = fetchJsonp
}
```

Why I need yfetch?
------------------

Check these daily use cases, you may use yfetch to make things simple, or just do the same task with more code.

**Get Response body**
<table>
 <tr>
  <th width="50%">without yfetch</th><th width="50%">with yfetch</th>
 </tr>
 <tr>
  <td valign="top">

```javascript
fetch(url, opts)
.then((response) => response.body.text())
.then (body => {
    // body, but response dropped
});
```

  </td>
  <td valign="top">

```javascript
yfetch({ url, ...opts })
.then(response => {
    // response.body
});
```

  </td>
 </tr>
</table>

**Get Response as JSON**
<table>
 <tr>
  <th width="50%">without yfetch</th><th width="50%">with yfetch</th>
 </tr>
 <tr>
  <td valign="top">

```javascript
fetch(url, { headers: { Accept: 'application/json' }, ...opts })
.then((response) => response.body.json())
.then (body => {
    // body as JSON, but response dropped
});
```

  </td>
  <td valign="top">

```javascript
yfetch({ url, json: true, ...opts })
.then(response => {
    // response.body as JSON
});
```

  </td>
 </tr>
</table>

**Debug**
<table>
 <tr>
  <th width="50%">without yfetch</th><th width="50%">with yfetch</th>
 </tr>
 <tr>
  <td valign="top">

```javascript
// ES6 arrow function to return the promise
myfetch = (url, opts) => fetch(url, opts)
.then((response) => response.body.json())
.then (
body => console.log('success', body, url, opts),
error => console.log('error', error, url, opts)
);

// always use the wrapped version
myfetch(url, opts);
```

  </td>
  <td valign="top">

```javascript
// debug in your code....deprecated
yfetch({ url, ...opts })
.then(
resp => console.log('success', resp.body, resp.fetchArgs),
error => console.log('error', error, error.fetchArgs)
);

// BETTER: export DEBUG=yfetch:* then
// just do yfetch without changing your code
yfetch({url, json: true, ...opts})
```

  </td>
 </tr>
</table>

**Conclusion**

You always need a wrapped version of fetch for debugging and response handling, you can just use yfetch, or do it your own. If you do not use yfetch, we still encourage you to use ES6 coding style to make your fetch more beautiful. In simple words, yfetch is:

```javascript
const yfetch = (opts = {}) => {
    const fetchArgs = transformFetchOptions(opts);
    return fetch(...fetchArgs)
    .then(transformForContext(fetchArgs))
    .then(transformFetchResult)
    .catch(transformFetchError(fetchArgs));
}
```

You can build your own `transformFetchOptions`, `transformForContext`, `transformFetchResult` and `transformFetchError` , or just enjoy yfetch and reuse the exported yfetch transform functions. Review [yfetch source code](src.js) , then make your decision.

Transform functions
-------------------
**transformFetchOptions(opts)**

Deal with `opts.base`, `opts.url` and `opts.query`.

```javascript
import { transformFetchOptions } from 'yfetch';

transformFetchOptions({}));     // ['', {}]
transformFetchOptions({ base: 'pre_' }));   // ['pre_', {}]
transformFetchOptions({ url: 'test' }));    // ['test', {}]
transformFetchOptions({ base: 'pre_', url: 'test' }));      // ['pre_test', {}]
transformFetchOptions({ url: 'test', query: { foo: 'bar' } }));      // ['test?foo=bar', {}]

transformFetchOptions({ url: 'ya', json: true }));
// ['ya', {
//   json: true,
//   headers: {
//     Accept: 'application/json',
//     'Content-Type': 'application/json' } }]
```

**transformFetchResult(response)**

The response must contains .fetchArgs property. Deal with `opts.json` and `opts.error`.

```javascript
import { transformFetchResult } from 'yfetch';

transformFetchResult({body, fetchArgs: [url, {json: true}}]);       // will JSON.parse(body)
transformFetchResult({code: 404, fetchArgs: [url, {error: [404, 500]}}]);   // will throw
```
