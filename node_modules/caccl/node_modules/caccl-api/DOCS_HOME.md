# caccl-api
A class that defines a set of Canvas endpoints that can be easily accessed. Each endpoint is equipped with the appropriate pre- and post-processing steps to make the Canvas endpoints "behave". For instance, _getSubmissions()_ fetches student submissions and removes the test student's submission in post-processing.

## I _have_ a caccl-api instance...

**Click the _Endpoints_ button in the menu at the top of the page for the full list of endpoint functions**

Using _async-await_, here are some examples:

```js
// List the students in a course
const students = await api.course.listStudents({ courseId: 58329 });

// List the assignments in a course
const assignments = await api.course.assignment.list({ courseId: 58329 });
```

## I _do not have_ a caccl-api instance...

Note: if you set up your project with [caccl on npm](https://www.npmjs.com/package/caccl), you should _already_ have a caccl-api instance. Please check the [caccl docs](https://www.npmjs.com/package/caccl) to see how to access your alread-initialized caccl-api instance.

### Let caccl create one for you (recommended):

caccl-api is a sub-component of the umbrella caccl project. Most people use caccl and allow it to initialize caccl-api for them.

Visit [caccl](https://www.npmjs.com/package/caccl) to get started.

### Create caccl-api instance manually:

**1. Initialize caccl-api:**

```js
const API = require('caccl-api');

const api = new API({
  canvasHost: 'canvas.myschool.edu',
  accessToken: '5368~059382...3e57293hga3',
});
```

**2. Further configure caccl-api:**

When initializing `caccl-api`, you can pass in many different configuration options to customize its behavior or turn on/off certain functionality. In the example above, we only included the `canvasHost` and `accessToken` configuration options.

**Note:** all configuration options are optional.

Config Option | Type | Description | Default
:--- | :--- | :--- | :---
canvasHost | string | a default Canvas host to use for requests | canvas.instructure.com
accessToken | string | a default access token to apply to all requests. If excluded, every function call must contain an `accessToken` parameter | none
sendRequest | [SendRequest](https://github.com/harvard-edtech/caccl-send-request) | a function that sends an http request | [caccl-send-request](https://github.com/harvard-edtech/caccl-send-request)
defaultNumRetries | number | the number of times to retry failed requests | 3
defaultItemsPerPage | number | the number of items to request on a get request | 100
cacheType | string | if 'memory', cache is stored in memory. If 'session', cache is stored in the express session. To include a custom cache, include it using the "cache" config option | none
cache | [Cache](https://github.com/harvard-edtech/caccl-api/blob/master/contributor-docs/Cache.md) | a custom cache instance (Not required if using 'memory' or 'session' cacheType: those caches are built-in) | none

## Part of the CACCL library
**C**anvas  
**A**pp  
**C**omplete  
**C**onnection  
**L**ibrary  
