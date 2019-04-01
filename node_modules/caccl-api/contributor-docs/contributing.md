# Contributing

This Canvas API endpoints integration library is not yet complete. Though we strive to add functions for as many of the endpoints in the Canvas API as possible, we cannot be complete. If you run into an API endpoint that isn't yet included in this library, please contribute back to this project by adding the API to our definitions.

## Endpoints file structure

In the `./endpoints` folder, you'll find:

- A `config.js` file that contains the list of endpoints
- A `helpers/` folder that contains a set of helpers (see descriptions of each below)
- A set of subfolders, each representing a "category" of endpoints

Endpoint categories are actual groupings of endpoints. For instance, if we put `listStudents(...)`, `listInstructors(...)`, `listApps(...)`, and `addApp(...)` in the "course" category and we put `getAvatarURL(...)` and `getCanvasId(...)` in the "user" category, programmers can access those functions as follows:

```js
const SmartEndpoints = require('caccl-smart-canvas-endpoints');
const se = new SmartEndpoints(...);

se.course.listStudents(...);
se.course.listInstructors(...);
se.course.listApps(...);
se.course.addApp(...);
se.user.getAvatarURL(...);
se.user.getCanvasId(...);
```

Within each category (subfolder), endpoints are divided into conceptual groups by file. For instance, `listStudents(...)` and `listInstructors(...)` are both enrollments-related and `listApps(...)` and `addApp(...)` are both app-related. Thus, we create two files and put associated endpoints in those files:

```js
endpoints/course/apps.js
	> listApps(...)
	> addApp(...)
endpoints/course/enrollments.js
	> listStudents(...)
	> listInstructors(...)
```

To be clear: both `apps.js` and `enrollments.js` are only for organizational purposes. We separate endpoints into different files so we can keep things organized. Only the folder categories show up when using SmartEndpoints. Thus, you'll still access `listApps(...)` as follows: `se.course.listApps(...)`, not `se.course.apps.listApps(...)`.

The `config.js` file must be updated if new categories and/or files are created. For our example, the `config.js` file should look like:

```js
// Import "course" category files
const apps = require('./course/apps.js');
const enrollments = require('./course/enrollments.js');

...

module.exports = {
	course: [
		apps,
		enrollments,
	],
	...
};
```

If we were to add another category called "user" that has two files: `/endpoints/user/info.js` and `/endpoints/user/files.js`, we would update the config:

```js
// Import "course" category files
const apps = require('./course/apps.js');
const enrollments = require('./course/enrollments.js');

// Import "user" category files
const info = require('./user/info.js');
const files = require('./user/files.js');

module.exports = {
	course: [
		apps,
		enrollments,
	],
	user: [
		info,
		files,
	],
};
```

## Adding an endpoint

1. In the `/endpoints` folder, choose the category (each category is a subfolder) that best represents the new endpoint. If you want to create a new category, follow the instructions below.
1. Choose a file in the category (subfolder) that best represents the new endpoint. If you want to create a new file, follow the instructions below.
1. Within the file, add a new object to the list, following this structure:

```js
{
	name: 'listStudents',
	action: 'get the student roster from a course',
	run: (cg) => {
		// ...
	},
}
```

### `name` should be the name of the function

Naming conventions:

- If returning a list, start the name with "list". Examples: `listQuizzes`, `listAssignments`, etc.
- If returning a single object, start the name with "get". Examples: `getQuiz`, `getAssignment`, etc.
- If creating new content, start the name with "create". Examples: `createQuiz`, `createAssignment`, etc.
- If updating/changing existing content, start the name with "update". Examples: `updateQuiz`, `updateAssignment`, etc.
- If deleting content, start the name with "delete". Examples: `deleteQuiz`, `deleteAssignment`, etc.
- If content/items already exist and you're just _adding_ them to a new context, start the name with "add". Examples: `addApp`, etc.
- If you're removing content/items that will continue to exist after they're removed from the current context, start the name with "remove". Examples: `removeApp`, etc.

**Note:** Please keep the following ordering convention:

1. `listItems`
1. `getItem`
1. `updateItem`
1. `createItem`/`addItem`
1. `deleteItem`/`removeItem`

### `action` should be a present-tense action sentence

The action should fit in the following sentences:

- Due to a network error, we could not ___.
- While we were attempting to ___, we encountered an unknown error.

Example actions:

- "get an assignment in a course"
- "upload a file to a student's submission"

### `run(cg)` is the function that'll run when the endpoint is called

#### cg properties (a.k.a. config)

```js
cg = {
  options,
  self,
  visitEndpoint,
};
```

`options` should be an object that contains all info passed from the endpoint caller.

`self` is the current endpoint category object.

`visitEndpoint` is a function you can use to visit a specific Canvas API endpoint. Call it as follows:

```js
visitEndpoint({
	path: '/api/v1/courses/' + courseID + '/enrollments',
	method: 'GET',
	// ^ If method excluded, defaults to 'GET'
	params: {
		...
	},
	// ^ params optional
})
	.then((response) => {
		// ...
	})
	.catch((err) => {
	    // ^ err is a CACCLError
	});
```

#### Response type: run(options) should return a promise

The returned promise should...

- reject on failure with a `CACCLError`
- resolve on success with the following response types:

##### Response type if uncaching any paths:

```js
{
	response: /* result to return to caller */,
	uncache: [
		`/api/v1/courses/195620/assignments`,
		`/api/v1/courses/195620/assignments/57184',
	],
}
```

When you want to uncache paths:

- You just created a new assignment. You'll want to uncache `/api/v1/courses/:course/assignments`, which lists assignments
- You just edited an assignment. You'll want to uncache `/api/v1/courses/:course/assignments` AND `/api/v1/courses/:course/assignments/:assignment_you_just_edited`

**Tip:** If you _end_ an uncache path with `*`, we'll uncache everything that starts with the prefix before the `*`. Note: we do not handle `*` in the middle of a path. Examples:

`/api/v1/courses/:course/assignments*` - uncaches the list of assignments and all endpoints that start with `/api/v1/courses/:course/assignments`

`/api/v1/courses/:course/assignments/*` - uncaches all endpoints that start with `/api/v1/courses/:course/assignments/`  
_^ Note that the only difference is the ending /_

##### Response type if not uncaching any paths:

If not uncaching anything, just return the response.

## Calling other endpoints in the category from within an endpoint

Use the `cg.self` to call other endpoints within the category.

**Note:** Only include `options`. Do not include the whole `cg` object. See example:

```js
...
    {
      name: 'listStudents',
      action: 'get the list of students in a course',
      run: (cg) => {
        const newOptions = options;
        newOptions.types = ['student'];
        return cg.self.getEnrollments(newOptions);
      },
    },
...
```

**Note:** You can only call endpoints within the same category.


## Creating a new endpoint category

1. Create a new subfolder for the category: `/endpoints/categoryname`

**Note:** You should delete endpoint categories if they contain no files (git will not include them anyway)

## Creating a new endpoint category file

1. Create a file in your category `/endpoints/categoryname/filename.js`
2. Fill the file with this skeleton:

```js
module.exports = [
  // Endpoint definitions go here
];
```
