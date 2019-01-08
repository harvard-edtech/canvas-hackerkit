const utils = require('../../../common/utils.js');
const api = require('../../../common/genInstructorAPI.js')();
const courseId = require('../../../environment.js').testCourseId;

/*------------------------------------------------------------------------*/
/*                                 Helpers                                */
/*------------------------------------------------------------------------*/

const stamp = new Date().getTime();

// Generate the parameters for a test page
function genTestPage(index = 0) {
  return {
    courseId,
    title: `test-page-${index}-${stamp}`,
    body: 'This is a test page. If it\'s not automatically deleted, you are welcome to delete this page.',
    published: false,
  };
}

// Generate the template of a test page
function genTestPageTemplate(index = 0) {
  return {
    title: `test-page-${index}-${stamp}`,
    published: false,
  };
}

/*------------------------------------------------------------------------*/
/*                                  Tests                                 */
/*------------------------------------------------------------------------*/

describe('Endpoints > Course > Pages', function () {
  it('Lists pages', function () {
    // Create two pages so we can check if they're in the list
    let pagesToDelete;
    return Promise.all([
      api.course.page.create(genTestPage(0)),
      api.course.page.create(genTestPage(1)),
    ])
      .then((pages) => {
        pagesToDelete = pages;
        // List the pages
        return api.course.page.list({
          courseId,
        });
      })
      .then((pagesInCourse) => {
        // Check if our test pages are in the list
        const notFound = utils.missingTemplatesToString([
          genTestPageTemplate(0),
          genTestPageTemplate(1),
        ], pagesInCourse);

        if (notFound) {
          throw new Error(`We could not find the following pages:${notFound}`);
        }

        // Clean up (delete the test pages)
        return Promise.all(
          pagesToDelete.map((page) => {
            return api.course.page.delete({
              courseId,
              pageURL: page.url,
            })
              .catch((err) => {
                throw new Error(`We completed the test successfully but couldn't clean up the test page(s) properly. We ran into this error: ${err.message}`);
              });
          })
        );
      });
  });

  it('Gets pages', function () {
    // Create a test page so we can get it
    let testPageURL;
    return api.course.page.create(genTestPage())
      .then((page) => {
        testPageURL = page.url;
        // List the pages
        return api.course.page.get({
          courseId,
          pageURL: testPageURL,
        });
      })
      .then((page) => {
        // Check if page matches
        const comparison = utils.checkTemplate(genTestPageTemplate(), page);
        if (!comparison.isMatch) {
          throw new Error(`The page we got didn't match the one we expected:\n${comparison.description}`);
        }
        // Clean up (delete the test page)
        return api.course.page.delete({
          courseId,
          pageURL: testPageURL,
        })
          .catch((err) => {
            throw new Error(`We completed the test successfully but couldn't clean up the test page(s) properly. We ran into this error: ${err.message}`);
          });
      });
  });

  it('Updates pages', function () {
    // Create a test page so we can update it
    let testPageURL;
    return api.course.page.create(genTestPage())
      .then((page) => {
        // Update the page
        return api.course.page.update({
          courseId,
          pageURL: page.url,
          title: `updated_title_${stamp}`,
          body: `updated_body_${stamp}`,
          published: true,
        });
      })
      .then((updatedPage) => {
        testPageURL = updatedPage.url;
        // Get the updated page
        return api.course.page.get({
          courseId,
          pageURL: testPageURL,
        });
      })
      .then((updatedPage) => {
        // Check if page matches
        const comparison = utils.checkTemplate(
          {
            title: `updated_title_${stamp}`,
            body: `updated_body_${stamp}`,
            published: true,
          },
          updatedPage
        );
        if (!comparison.isMatch) {
          throw new Error(`The page we got didn't match the one we expected (perhaps the updates weren't made):\n${comparison.description}`);
        }
        // Clean up (delete the test page)
        return api.course.page.delete({
          courseId,
          pageURL: testPageURL,
        })
          .catch((err) => {
            throw new Error(`We completed the test successfully but couldn't clean up the test page(s) properly. We ran into this error: ${err.message}`);
          });
      });
  });

  it('Creates pages', function () {
    // Create a page
    return api.course.page.create(genTestPage())
      .then((page) => {
        // Get the page
        return api.course.page.get({
          courseId,
          pageURL: page.url,
        });
      })
      .then((page) => {
        // Check if page matches
        const comparison = utils.checkTemplate(genTestPageTemplate(), page);
        if (!comparison.isMatch) {
          throw new Error(`The page we got didn't match the one we expected (perhaps the page wasn't created):\n${comparison.description}`);
        }
        // Clean up (delete the test page)
        return api.course.page.delete({
          courseId,
          pageURL: page.url,
        })
          .catch((err) => {
            throw new Error(`We completed the test successfully but couldn't clean up the test page(s) properly. We ran into this error: ${err.message}`);
          });
      });
  });

  it('Deletes pages', function () {
    // Create a test page that we can delete
    return api.course.page.create(genTestPage())
      .then((page) => {
        // Clean up (delete the test page)
        return api.course.page.delete({
          courseId,
          pageURL: page.url,
        });
      })
      .then(() => {
        // List the pages
        return api.course.page.list({
          courseId,
        });
      })
      .then((pages) => {
        // Check to make sure the page was removed
        const found = utils.templateFound(
          genTestPage(),
          pages
        );

        if (found) {
          // It's in the list! This is wrong.
          throw new Error('The page wasn\'t deleted properly.');
        }
      });
  });
});
