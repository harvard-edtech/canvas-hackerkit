const fs = require('fs');
const path = require('path');

const utils = require('../../../common/utils.js');
const api = require('../../../common/genInstructorAPI.js')();
const courseId = require('../../../environment.js').testCourseId;

/*------------------------------------------------------------------------*/
/*                                 Helpers                                */
/*------------------------------------------------------------------------*/

const stamp = Date.now();
const xml = fs.readFileSync(
  path.join(__dirname, '../../../common/testAppXML.txt'),
  'utf-8'
);

// Generate the parameters for a test app
function genTestApp(index = 0) {
  return {
    courseId,
    xml,
    name: `test-app-${index}-${stamp}`,
    key: `key-${stamp}`,
    secret: `secret-${stamp}`,
    description: 'This is a test app and will be deleted automatically. If it\'s not deleted, you are welcome to delete it.',
  };
}

// Generate the template of a test app's canvas response
function genTestAppTemplate(index = 0) {
  return {
    domain: null,
    url: 'https://example.com/not/a/real/url',
    consumer_key: `key-${stamp}`,
    name: `test-app-${index}-${stamp}`,
    description: 'This is a test app and will be deleted automatically. If it\'s not deleted, you are welcome to delete it.',
    privacy_level: 'public',
    custom_fields: {},
    workflow_state: 'public',
  };
}

/*------------------------------------------------------------------------*/
/*                                  Tests                                 */
/*------------------------------------------------------------------------*/

describe('Endpoints > Course > Apps', function () {
  it('Lists apps', function () {
    // Add a couple apps to the list
    let createdApps;
    return Promise.all([
      api.course.app.add(genTestApp(0)),
      api.course.app.add(genTestApp(1)),
    ])
      .then((apps) => {
        createdApps = apps;
        // List the apps
        return api.course.app.list({
          courseId,
        });
      })
      .then((apps) => {
        // Make sure the apps we added are in the list
        const notFound = utils.missingTemplatesToString([
          genTestAppTemplate(0),
          genTestAppTemplate(1),
        ], apps);

        if (notFound) {
          throw new Error(`We could not find the following apps:${notFound}`);
        }

        // Clean up: delete the apps
        return Promise.all(
          createdApps.map((app) => {
            return api.course.app.remove({
              courseId,
              appId: app.id,
            })
              .catch((err) => {
                throw new Error(`We completed the test successfully but ran into an error while cleaning up (deleting the test app(s)): ${err.message}`);
              });
          })
        );
      });
  });

  it('Get an app', function () {
    // Add a test app so we can get it
    return api.course.app.add(genTestApp())
      .then((app) => {
        // Get the app
        return api.course.app.get({
          courseId,
          appId: app.id,
        });
      })
      .then((app) => {
        // Verify the app information
        const comparison = utils.checkTemplate(genTestAppTemplate(), app);
        if (!comparison.isMatch) {
          throw new Error(`The app we found didn't match the one we added:\n${comparison.description}`);
        }
        // Clean up: delete the app
        return api.course.app.remove({
          courseId,
          appId: app.id,
        })
          .catch((err) => {
            throw new Error(`We completed the test successfully but ran into an error while cleaning up (deleting the test app(s)): ${err.message}`);
          });
      });
  });

  it('Adds an app', function () {
    // Add the app
    return api.course.app.add(genTestApp())
      .then((app) => {
        // Get the app to make sure it's added
        return api.course.app.get({
          courseId,
          appId: app.id,
        });
      })
      .then((app) => {
        // Verify the app information
        const comparison = utils.checkTemplate(genTestAppTemplate(), app);
        if (!comparison.isMatch) {
          throw new Error(`The app we found didn't match the one we added:\n${comparison.description}`);
        }
        // Clean up: delete the app
        return api.course.app.remove({
          courseId,
          appId: app.id,
        })
          .catch((err) => {
            throw new Error(`We completed the test successfully but ran into an error while cleaning up (deleting the test app(s)): ${err.message}`);
          });
      });
  });

  it('Removes an app', function () {
    // Add a test app so we can delete it
    return api.course.app.add(genTestApp())
      .then((app) => {
        // Delete the app
        return api.course.app.remove({
          courseId,
          appId: app.id,
        });
      })
      .then(() => {
        // List the apps
        return api.course.app.list({
          courseId,
        });
      })
      .then((apps) => {
        // Check to make sure the app was removed
        const found = utils.templateFound(genTestApp(), apps);

        if (found) {
          // It's in the list! This is wrong.
          throw new Error('The app wasn\'t removed properly.');
        }
      });
  });
});
