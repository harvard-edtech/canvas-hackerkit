# caccl-canvas-api
A class that defines a set of Canvas endpoints that can be easily accessed. Each endpoint is equipped with the appropriate pre- and post-processing steps to make the Canvas endpoints "behave". For instance, _getSubmissions()_ fetches student submissions and removes the test student's submission in post-processing.

## Quickstart

```js
// Import
const CanvasAPI = require('caccl-canvas-api');

// Create CanvasAPI instance
const api = new CanvasAPI({
  canvasHost: 'canvas.instructor.com',
  accessToken: '5368~059382...3e57293hga3',
  cache: 'memory',
});

// Hit an endpoint
api.course.listStudents({
  courseId: 52618,
})
  .then((students) => {
    // ...
  })
  .catch((err) => {
    // ...
  });
```

For a full list of supported endpoints, check out the `/docs` folder.

## Creating a CanvasAPI instance

### Required arguments:

- **canvasHost** - Your Canvas instance host. E.g., `'canvas.instructure.com'`

### Optional arguments:

- **accessToken** - An access token to add to all requests. If you leave this out, you'll be in charge of adding credentials to API requests.
- **cacheType** - Leave out to disable caching. Three allowed values: `['memory', 'session', 'custom']`
  * If `cacheType` equals `'session'`, `req` must be included and cache is stored in the express session.
  * If `cacheType` equals `'custom'`, your custom cache must be included as `cache` (see below).
- **req** - Express request object with req.session support (required if using `'session'` cacheType.
- **cache** - Custom cache manager instance (required if using `'custom'` cacheType (see below).
- **visitEndpoint** - Optional function that sends requests to the Canvas API. By default, we use `caccl-visit-endpoint`. You can use your own visitEndpoint function, though we recommend using `caccl-visit-endpoint` anyway and just swapping out the `sendRequest` function when creating an instance of `caccl-visit-endpoint`.


## Custom Cache

If using `cacheType = 'custom'`, you need to include an instance of your own custom cache. We use a nested cache. Given an endpoint `path` _and_ `params`, there should be one `value` stored. For instance, we might want to store the following:

```js
path: '/api/v1/courses'
params: { include: ['term'] }
value: [ /* courses with terms */ ]
```
<center>and</center>

```js
path: '/api/v1/courses'
params: { include: ['sections'] }
value: [ /* courses with sections */ ]
```

Thus, `path` isn't enough to save/retrieve cache entries.

### Cache Class Definition:

If your cache has the ability to store promises as values\*, your cache instance should have a property to indicate this:

```js
cache.storePromises = true;
```

Your cache should include the following functions (all return
Promises):

- **get(path, params)** - returns a Promise that resolves with the value associated with the key pair: `(path [string], params [object])`. Resolves with `undefined` or `null` if no cached value
- **set(path, params, value)** - returns a Promise that resolves when the value has been saved to the key pair: `(path [string], params [object])`
- **deletePaths(paths)** - returns a Promise that resolves when the given list of paths (and all params associated with those paths) are deleted from the cache
- **getAllPaths()** - returns a Promise that resolves with the list of cached paths
- **deleteAllPaths()** - returns a Promise that resolves when all paths are deleted (entire cache is cleared)

Example of cache in use:

```js
cache.set('/api/v1/courses', { include: ['sections'] }, courseList1);
> cache contents:
>  - /api/v1/courses
>    - { include: ['sections'] } = courseList1

cache.set('/api/v1/courses', { include: ['term'] }, courseList2);
> cache contents:
>  - /api/v1/courses
>    - { include: ['sections'] } = courseList1
>    - { include: ['term'] } = courseList2

cache.set('/api/v1/users/self/profile', {}, myProfile);
> cache contents:
>  - /api/v1/courses
>    - { include: ['sections'] } = courseList1
>    - { include: ['term'] } = courseList2
>  - /api/v1/users/self/profile
>    - {} = myProfile

cache.get('/api/v1/users/self/profile', {})
> myProfile

cache.getAllPaths()
> ['/api/v1/courses', '/api/v1/users/self/profile']

cache.deletePaths(['/api/v1/courses'])
> cache contents:
>  - /api/v1/users/self/profile
>    - {} = myProfile

cache.deleteAllPaths()
> cache contents (empty)
```

**\*** If possible, we like storing promises instead of values. This allows us to further optimize/speed up Canvas integration. Say you call `api.course.listStudents(...)` and before that function returns, you call `listStudents` again. Ordinarily, your second request would find that we have no cached value (yet) and we would send the request again (twice the requests we need!). If your cache allows storing Promises, we store unfinished calls to the api immediately. Thus, when you call `listStudents` the second time, we'll just give you the pending promise from the first call, and when that first request finishes, both calls to `listStudents` resolve simultaneously. We just cut the number of requests in half and the second call resolved earlier. Note: the built-in `session` cache does not support Promises, but the built-in `memory` cache does support Promises.

## Part of the CACCL library
**C**anvas  
**A**pp  
**C**omplete  
**C**onnection  
**L**ibrary  
