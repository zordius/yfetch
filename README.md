yfetch
======
Yet another fetch. A guide for "How to make fetch more beautiful?".

[fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) is a new API based on [Promise](https://developers.google.com/web/fundamentals/getting-started/primers/promises), it help you to prevent callback hell.

I like fetch, so here is a set of use cases and example codes. You can check how to use yfetch and know it enhanced fetch.

**Core Features**:
* A set of decorator function to help you to deal with request or response.
* `opts.base` : base url
* `opts.query` : will be appended into url automatically
* `opts.url` : pass into fetch() as 1st param with processed opts.base and opts.query
* `opts.json` : auto json parse the ret.body
* `ret.body` : auto resolved as String or JSON
* `ret.headers` : auto resolved as Object from Header
* `ret.fetchArgs` : the arguments of the fetch call

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

Why I need this?
----------------

Check these daily use cases, you may need yfetch, or coding in the way just like yfetch.

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
