const utils = require('../../../common/utils.js');
const api = require('../../../common/genInstructorAPI.js')();
const courseId = require('../../../environment.js').testCourseId;

/*------------------------------------------------------------------------*/
/*                                 Helpers                                */
/*------------------------------------------------------------------------*/

const stamp = Date.now();

// Generate the parameters for a test assignment
function genTestAssignment(index = 0) {
  return {
    courseId,
    name: `temporary_test_${index}_${stamp}`,
    pointsPossible: (index + 1) * 10,
    description: 'this is a test assignment that was auto-generated and can be deleted if it is not deleted automatically',
    published: false,
  };
}

// Generate the parameters for a test rubric
function genTestRubric(assignmentId, index = 0) {
  return {
    courseId,
    assignmentId,
    title: `test_rubric_${index}_${stamp}`,
    rubricItems: [
      {
        description: 'item1',
        longDescription: 'item_1_description',
        points: 60,
      },
      {
        description: 'item2',
        longDescription: 'item_2_description',
        points: 35,
      },
      {
        description: 'item3',
        longDescription: 'item_3_description',
        points: 5,
      },
    ],
  };
}

// Generate the parameters for a test rubric template
function genTestRubricTemplate(index = 0) {
  return {
    context_type: 'Course',
    points_possible: 100,
    title: `test_rubric_${index}_${stamp}`,
    reusable: false,
    public: false,
    read_only: false,
    free_form_criterion_comments: true,
  };
}

/*------------------------------------------------------------------------*/
/*                                  Tests                                 */
/*------------------------------------------------------------------------*/


describe('Endpoints > Course > Rubrics', function () {
  it('Lists rubrics', function () {
    // Create a couple assignments so we can add rubrics to them
    let assignmentsToDelete;
    return Promise.all([
      api.course.assignment.create(genTestAssignment(0)),
      api.course.assignment.create(genTestAssignment(1)),
    ])
      .then((assignments) => {
        assignmentsToDelete = assignments;
        // Create a couple test rubrics so we can check if they're in the course
        // Add rubrics to both assignments
        return Promise.all(
          assignments.map((assignment, i) => {
            return api.course.rubric.createFreeFormGradingRubricInAssignment(
              genTestRubric(assignment.id, i)
            );
          })
        );
      })
      .then(() => {
        // List the rubrics
        return api.course.rubric.list({
          courseId,
        });
      })
      .then((rubrics) => {
        // Make sure all the rubrics we created are in the list
        const notFound = utils.missingTemplatesToString([
          genTestRubricTemplate(0),
          genTestRubricTemplate(1),
        ], rubrics);

        if (notFound) {
          throw new Error(`We could not find the following quizzes: ${notFound}`);
        }
        // Clean up: delete test assignments
        return Promise.all(assignmentsToDelete.map((assignment) => {
          return api.course.assignment.delete({
            courseId,
            assignmentId: assignment.id,
          })
            .catch((err) => {
              throw new Error(`We were able to finish the test but coulnd't delete a test assignment (${assignment.name}) due to an error: ${err.message}`);
            });
        }));
      });
  });

  it('Gets a rubric', function () {
    // Create a test assignment so we can add a rubric to it
    let testAssignmentId;
    return api.course.assignment.create(genTestAssignment())
      .then((assignment) => {
        testAssignmentId = assignment.id;
        // Create a test rubric
        return api.course.rubric.createFreeFormGradingRubricInAssignment(
          genTestRubric(testAssignmentId)
        );
      })
      .then((rubric) => {
        // Get the rubric
        return api.course.rubric.get({
          courseId,
          rubricId: rubric.id,
        });
      })
      .then((rubric) => {
        // Make sure the rubric we got is as we expected
        const comparison = utils.checkTemplate(
          genTestRubricTemplate(),
          rubric
        );

        if (!comparison.isMatch) {
          throw new Error(`The rubric we got didn't match what we expected:\n${comparison.description}`);
        }
        // Clean up: delete the test assignment
        return api.course.assignment.delete({
          courseId,
          assignmentId: testAssignmentId,
        })
          .catch((err) => {
            throw new Error(`Successfully completed the test but could not clean up (delete) the assignment afterward. We ran into this error: ${err.message}`);
          });
      });
  });

  it('Creates a rubric', function () {
    // Create a test assignment so we can add a rubric to it
    let testAssignmentId;
    return api.course.assignment.create(genTestAssignment())
      .then((assignment) => {
        testAssignmentId = assignment.id;
        // Create a test rubric
        return api.course.rubric.createFreeFormGradingRubricInAssignment(
          genTestRubric(testAssignmentId)
        );
      })
      .then((rubric) => {
        // Get the rubric
        return api.course.rubric.get({
          courseId,
          rubricId: rubric.id,
        });
      })
      .then((rubric) => {
        // Make sure the rubric we got is as we expected
        const comparison = utils.checkTemplate(
          genTestRubricTemplate(),
          rubric
        );

        if (!comparison.isMatch) {
          throw new Error(`The rubric we created didn't match what we expected:\n${comparison.description}`);
        }
        // Clean up: delete the test assignment
        return api.course.assignment.delete({
          courseId,
          assignmentId: testAssignmentId,
        })
          .catch((err) => {
            throw new Error(`Successfully completed the test but could not clean up (delete) the assignment afterward. We ran into this error: ${err.message}`);
          });
      });
  });
});
