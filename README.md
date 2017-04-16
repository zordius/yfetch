yfetch
======
Yet another fetch. A guide for "How to make fetch more beautiful?".

[fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) is a new API based on [Promise](https://developers.google.com/web/fundamentals/getting-started/primers/promises), it help you to prevent callback hell.

I like fetch, so here is a set of use cases and example codes to know how to use yfetch or make your fetch coding style better.

**Core Features**:
* A set of transform functions to help you to deal with fetch request or response.
* Accept same options just like fetch with some extensions:
  * `opts.base` : base url
  * `opts.query` : will be appended into url automatically
  * `opts.url` : pass into fetch() as 1st param with processed opts.base and opts.query
  * `opts.json` : auto json parse the ret.body
  * `response.body` : auto resolved as String or JSON
  * `response.headers` : auto transformed as Object from Header
  * `response.fetchArgs` : the arguments of the fetch call
* [debug](https://www.npmjs.com/package/debug) , export DEBUG=... to show debug log:
  * `yfetch:raw` : show url, response size, status, headers, raw
  * `yfetch:result` : show url, response status, body as text or JSON
  * `yfetch:error` : show url, response status, body as text or JSON, error

Install
-------

```
npm install yfetch --save
```

You will need these polyfills for [older browsers](http://caniuse.com/#feat=promises) or other environments:
* [Promise](https://www.npmjs.com/search?q=promise%20polyfill&page=1&ranking=popularity)
* [fetch](https://www.npmjs.com/search?q=fetch%20polyfill&page=1&ranking=popularity)

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
  body: '...',
  size: 1234,
  fetchArgs: [
    'https://some.where/test?page=10&size=5',
    {}
  ]
}
*/
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
fetch(url, {opts})
.then((response) => response.body.text())
.then (body => {
    // body, but response dropped
});
```

  </td>
  <td valign="top">

```javascript
yfetch({url, ...opts})
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
fetch(url, {opts})
.then((response) => response.body.json())
.then (body => {
    // body as JSON, but response dropped
});
```

  </td>
  <td valign="top">

```javascript
yfetch({url, json: true, ...opts})
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
yfetch({url, json: true, ...opts})
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

You can build your own `transformFetchOptions`, `transformForContext`, `transformFetchResult` and `transformFetchError` , or just enjoy yfetch and reuse the exported yfetch transform functions.

Transform functions
-------------------
