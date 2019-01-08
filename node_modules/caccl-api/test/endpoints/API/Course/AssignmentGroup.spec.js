const utils = require('../../../common/utils.js');
const api = require('../../../common/genInstructorAPI.js')();
const courseId = require('../../../environment.js').testCourseId;

/*------------------------------------------------------------------------*/
/*                                 Helpers                                */
/*------------------------------------------------------------------------*/


const stamp = new Date().getTime();

// Generate the parameters for a test assignment group
function genTestAssignmentGroup(index = 0) {
  return {
    courseId,
    name: `test-assignment-group-${index}-${stamp}`,
    weight: (index + 1) * 10,
  };
}

// Generate the template of a test assignment group's canvas response
function genTestAssignmentGroupTemplate(index = 0) {
  return {
    name: `test-assignment-group-${index}-${stamp}`,
    group_weight: (index + 1) * 10,
  };
}

/*------------------------------------------------------------------------*/
/*                                  Tests                                 */
/*------------------------------------------------------------------------*/

describe('Endpoints > Course > AssignmentGroups', function () {
  it('List assignment groups', function () {
    // Create assignment groups so we can list them
    let createdAssignmentGroups;
    return Promise.all([
      api.course.assignmentgroup.create(genTestAssignmentGroup(0)),
      api.course.assignmentgroup.create(genTestAssignmentGroup(1)),
    ])
      .then((assignmentGroups) => {
        createdAssignmentGroups = assignmentGroups;
        // List assignment groups
        return api.course.assignmentgroup.list({
          courseId,
        });
      })
      .then((assignmentGroups) => {
        // Check that both assignment groups we made are there
        const notFound = utils.missingTemplatesToString([
          genTestAssignmentGroupTemplate(0),
          genTestAssignmentGroupTemplate(1),
        ], assignmentGroups);

        if (notFound) {
          throw new Error(`We could not find the following assignment groups:${notFound}`);
        }
        // Clean up (delete all assignment groups)
        return Promise.all(
          createdAssignmentGroups.map((assignmentGroup) => {
            return api.course.assignmentgroup.delete({
              courseId,
              assignmentGroupId: assignmentGroup.id,
            })
              .catch((err) => {
                throw new Error(`We completed the test successfully but we ran into an error while cleaning up: ${err.message}`);
              });
          })
        );
      });
  });

  it('Updates an assignment group', function () {
    return api.course.assignmentgroup.create(genTestAssignmentGroup())
      .then((assignmentGroups) => {
        // Get the assignment group to make sure it's created
        return api.course.assignmentgroup.get({
          courseId,
          assignmentGroupId: assignmentGroups.id,
        });
      })
      .then((assignmentGroup) => {
        // Update the assignment group
        return api.course.assignmentgroup.update({
          courseId,
          assignmentGroupId: assignmentGroup.id,
          name: `updated-group-name-${stamp}`,
          weight: 2,
        });
      })
      .then((updatedAssignmentGroup) => {
        // Get the assignment group
        return api.course.assignmentgroup.get({
          courseId,
          assignmentGroupId: updatedAssignmentGroup.id,
        });
      })
      .then((updatedAssignmentGroup) => {
        // Check to make sure the assignment group is valid
        const comparison = utils.checkTemplate({
          name: `updated-group-name-${stamp}`,
          group_weight: 2,
        }, updatedAssignmentGroup);
        if (!comparison.isMatch) {
          throw new Error(`The updated assignment group didn't match what we expected:\n${comparison.description}`);
        }

        // Clean up: delete the assignment group
        return api.course.assignmentgroup.delete({
          courseId,
          assignmentGroupId: updatedAssignmentGroup.id,
        });
      });
  });

  it('Creates an assignment group', function () {
    return api.course.assignmentgroup.create(genTestAssignmentGroup())
      .then((assignmentGroup) => {
        // Get the assignment group to make sure it's created
        return api.course.assignmentgroup.get({
          courseId,
          assignmentGroupId: assignmentGroup.id,
        });
      })
      .then((assignmentGroup) => {
        // Delete the assignment group
        return api.course.assignmentgroup.delete({
          courseId,
          assignmentGroupId: assignmentGroup.id,
        });
      });
  });

  it('Deletes an assignment group', function () {
    return api.course.assignmentgroup.create(genTestAssignmentGroup())
      .then((assignmentGroup) => {
        // Delete the assignment group
        return api.course.assignmentgroup.delete({
          courseId,
          assignmentGroupId: assignmentGroup.id,
        });
      })
      .then(() => {
        // List the assignment groups
        return api.course.assignmentgroup.list({
          courseId,
        });
      })
      .then((assignmentGroups) => {
        // Check to make sure the assignment group was removed
        const found = utils.templateFound(
          genTestAssignmentGroup(),
          assignmentGroups
        );

        if (found) {
          // It's in the list! This is wrong.
          throw new Error('The assignment group wasn\'t deleted properly.');
        }
      });
  });
});
