const api = require('../../../common/genInstructorAPI.js')();
const utils = require('../../../common/utils.js');
const courseId = require('../../../environment.js').testCourseId;

/*------------------------------------------------------------------------*/
/*                                 Helpers                                */
/*------------------------------------------------------------------------*/

const stamp = Date.now();

// Generate the parameters for a test gradebook column
function genTestGradebookColumn(index = 0) {
  return {
    courseId,
    title: `temporary_test_${index}_${stamp}`,
    hidden: true,
  };
}

// Generate the template of a test gradebook column
function genTestGradebookColumnTemplate(index = 0) {
  return {
    title: `temporary_test_${index}_${stamp}`,
    hidden: true,
  };
}

/*------------------------------------------------------------------------*/
/*                                  Tests                                 */
/*------------------------------------------------------------------------*/

describe('Endpoints > Course > Gradebook Columns', function () {
  it('Lists custom gradebook columns', function () {
    // Create gradebook columns so we can check if they show up in the list
    let columnsToDelete;
    return Promise.all([
      api.course.gradebookColumn.create(genTestGradebookColumn(0)),
      api.course.gradebookColumn.create(genTestGradebookColumn(1)),
    ])
      .then((columns) => {
        columnsToDelete = columns;
        // Get list of columns
        return api.course.gradebookColumn.list({
          courseId,
          includeHidden: true,
        });
      })
      .then((columns) => {
        // Make sure both test columns are in the list
        const notFound = utils.missingTemplatesToString([
          genTestGradebookColumnTemplate(0),
          genTestGradebookColumnTemplate(1),
        ], columns);

        if (notFound) {
          throw new Error(`We could not find the following gradebook columns: ${notFound}`);
        }
        // Clean up: delete the gradebook columns
        return Promise.all(
          columnsToDelete.map((column) => {
            return api.course.gradebookColumn.delete({
              courseId,
              columnId: column.id,
            })
              .catch((err) => {
                throw new Error(`We finished the test successfully but couldn't clean up (delete gradebook column(s)). We ran into this error: ${err.message}`);
              });
          })
        );
      });
  });

  it('Updates a custom gradebook column', function () {
    // Create a gradebook column so we can update it
    let testColumnId;
    return api.course.gradebookColumn.create(genTestGradebookColumn())
      .then((column) => {
        testColumnId = column.id;
        // Update the column
        return api.course.gradebookColumn.update({
          courseId,
          columnId: testColumnId,
          title: `updated_title_${stamp}`,
          hidden: false,
        });
      })
      .then(() => {
        // Get the column so we can check its contents
        return api.course.gradebookColumn.get({
          courseId,
          columnId: testColumnId,
        });
      })
      .then((updatedColumn) => {
        const comparison = utils.checkTemplate(
          {
            id: testColumnId,
            title: `updated_title_${stamp}`,
            hidden: false,
          },
          updatedColumn
        );

        if (!comparison.isMatch) {
          throw new Error(`The column didn't match the form we expected (perhaps the updates weren't applied):\n${comparison.description}`);
        }

        // Clean up: delete the gradebook column
        return api.course.gradebookColumn.delete({
          courseId,
          columnId: testColumnId,
        })
          .catch((err) => {
            throw new Error(`We finished the test successfully but couldn't clean up (delete gradebook column(s)). We ran into this error: ${err.message}`);
          });
      });
  });

  it('Creates a custom gradebook column', function () {
    // Create a gradebook column
    let testColumnId;
    return api.course.gradebookColumn.create(genTestGradebookColumn())
      .then((column) => {
        testColumnId = column.id;
        // Get the column so we can check its contents
        return api.course.gradebookColumn.get({
          courseId,
          columnId: testColumnId,
          isHidden: true,
        });
      })
      .then((updatedColumn) => {
        const comparison = utils.checkTemplate(
          genTestGradebookColumnTemplate(),
          updatedColumn
        );

        if (!comparison.isMatch) {
          throw new Error(`The column didn't match the form we expected (perhaps it wasn't created properly):\n${comparison.description}`);
        }

        // Clean up: delete the gradebook column
        return api.course.gradebookColumn.delete({
          courseId,
          columnId: testColumnId,
        })
          .catch((err) => {
            throw new Error(`We finished the test successfully but couldn't clean up (delete gradebook column(s)). We ran into this error: ${err.message}`);
          });
      });
  });

  it('Deletes a custom gradebook column', function () {
    // Create a gradebook column
    let testColumnId;
    return api.course.gradebookColumn.create(genTestGradebookColumn())
      .then((column) => {
        testColumnId = column.id;
        // Delete the gradebook column
        return api.course.gradebookColumn.delete({
          courseId,
          columnId: testColumnId,
        });
      })
      .then(() => {
        // Get list of columns so we can make sure the column was deleted
        return api.course.gradebookColumn.list({
          courseId,
          includeHidden: true,
        });
      })
      .then((columns) => {
        // Make sure the column is no longer in the list
        if (utils.templateFound(genTestGradebookColumnTemplate(), columns)) {
          // We found the column but shouldn't have!
          throw new Error('After attempting to delete the column, we still found it in the list.');
        }
      });
  });
});
