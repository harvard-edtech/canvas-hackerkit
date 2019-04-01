# Intelligent Caching

This module handles caching in an intuitive way. When setting up the SmartEndpoints object, you have the option to use a `MemoryCache`, a `SessionCache`, your own custom cache, or no cache. Here's how caching works:

- Every time you hit a `GET` endpoint, we cache the result
- If you hit a `GET` endpoint again, we'll used the cached value if it's available
- If we get two simultaneous requests to the same `GET` endpoint, we'll only hit the endpoint once
- We intelligently uncache endpoints. For instance, if you call `createAssignment(...)`, we'll uncache the list of assignments

### Overrides

If you want to ignore the cache, add `ignoreCache: true` to any api function call.

If you don't want to cache a specific call, add `dontCache: true` to any api function call.

### Manual control of the cache:

You can always call `uncache(canvasAPIPath)` or `uncacheAll()` to remove something from the cache.

**Tip:** If you _end_ an uncache path with `*`, we'll uncache everything that starts with the prefix before the `*`. Note: we do not handle `*` in the middle of a path. Examples:

`/api/v1/courses/:course/assignments*` - uncaches the list of assignments and all endpoints that start with `/api/v1/courses/:course/assignments`

`/api/v1/courses/:course/assignments/*` - uncaches all endpoints that start with `/api/v1/courses/:course/assignments/`  

### Caveats

Our intelligent uncaching makes one large assumption: _your tool is the only one editing the Canvas resources with which you are interacting_. If you have many tools that will be simultaneously editing the same resources, cached versions may become out of sync with Canvas. You can resolve this issue by merging the tools and having them use the same cache, by removing caching altogether, or by specifically uncaching the endpoints that you are not caching.
