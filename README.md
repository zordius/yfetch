yfetch
======
Yet another fetch. A guide for "How to make fetch more beautiful?".

[fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) is a new API based on [Promise](https://developers.google.com/web/fundamentals/getting-started/primers/promises), it help you to prevent callback hell.

I like fetch, so here is a set of use cases and example codes. You can check how to use yfetch and know it enhanced fetch.

**Core Features**:
* A set of decorator function to help you to deal with request or response.
* opts.base : base url
* opts.query : will be appended into url automatically
* opts.url : pass into fetch() as 1st param with processed opts.base and opts.query
* opts.json : auto json parse the ret.body
* ret.body : auto resolved as String or JSON
* ret.fetchArgs : the arguments of the fetch call

Install
-------

```
npm install yfetch --save
```

You will need these polyfills for [older browsers](http://caniuse.com/#feat=promises) or other environments:
* [Promise](https://www.npmjs.com/search?q=promise%20polyfill&page=1&ranking=popularity)
* [fetch](https://www.npmjs.com/search?q=fetch%20polyfill&page=1&ranking=popularity)
