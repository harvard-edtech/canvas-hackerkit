const api = require('../../../common/genInstructorAPI.js')();
const utils = require('../../../common/utils.js');
const environment = require('../../../environment.js');

const courseId = environment.testCourseId;

/*------------------------------------------------------------------------*/
/*                     Helpers and Content Definitions                    */
/*------------------------------------------------------------------------*/

const stamp = new Date().getTime();

// Generate the parameters for a test group set
function genTestGroupSet(index = 0) {
  return {
    courseId,
    name: `test_group_set_${index}_${stamp}`,
  };
}
// Generate the template of a test group set's canvas response
function genTestGroupSetTemplate(index = 0) {
  return {
    name: `test_group_set_${index}_${stamp}`,
  };
}

// Generate the parameters for a test group in a group set
function genTestGroupInGroupSet(groupSetId, index = 0) {
  return {
    courseId,
    groupSetId,
    name: `test_group_${index}_${stamp}`,
    description: 'this test group can be deleted',
    isPublic: false,
  };
}

// Generate the template of a test group in a group set's canvas response
function genTestGroupInGroupSetTemplate(index = 0) {
  return {
    name: `test_group_${index}_${stamp}`,
    description: 'this test group can be deleted',
  };
}

/*------------------------------------------------------------------------*/
/*                                  Tests                                 */
/*------------------------------------------------------------------------*/

describe('Endpoints > Course > Group Sets', function () {
  describe('Group Sets', function () {
    it('Lists group sets', function () {
      let groupSetsToDelete;
      // Create group sets so we can check for them in the list
      return Promise.all([
        api.course.groupset.create(genTestGroupSet(0)),
        api.course.groupset.create(genTestGroupSet(1)),
      ])
        .then((groupSets) => {
          groupSetsToDelete = groupSets;
          // List the assignments
          return api.course.groupset.list({
            courseId,
          });
        })
        .then((groupSets) => {
          // Check if the two generated group sets are there
          const notFound = utils.missingTemplatesToString([
            genTestGroupSetTemplate(0),
            genTestGroupSetTemplate(1),
          ], groupSets);

          if (notFound) {
            throw new Error(`We could not find the following group sets:\n${notFound}`);
          }

          // Clean up: delete the group sets
          return Promise.all(groupSetsToDelete.map((groupSet) => {
            return api.course.groupset.delete({
              courseId,
              groupSetId: groupSet.id,
            })
              .catch((err) => {
                throw new Error(`We finished the test successfully but couldn't delete one of the test group sets due to an error: ${err.message}`);
              });
          }));
        });
    });

    it('Gets a group set', function () {
      let testGroupSetId;
      // Create a group sets so we can get it
      return api.course.groupset.create(genTestGroupSet())
        .then((groupSet) => {
          testGroupSetId = groupSet.id;
          // Get the group set
          return api.course.groupset.get({
            courseId,
            groupSetId: testGroupSetId,
          });
        })
        .then((groupSet) => {
          // Check if the group set matches what we expect
          const comparison = utils.checkTemplate(
            genTestGroupSetTemplate(),
            groupSet
          );

          if (!comparison.isMatch) {
            throw new Error(`The group set we got didn't match what we expected:\n${comparison.description}`);
          }

          // Clean up: delete the group set
          return api.course.groupset.delete({
            courseId,
            groupSetId: testGroupSetId,
          })
            .catch((err) => {
              throw new Error(`We finished the test successfully but couldn't delete the test group set due to an error: ${err.message}`);
            });
        });
    });

    it('Creates a group set', function () {
      let testGroupSetId;
      // Create a group sets so we can get it
      return api.course.groupset.create(genTestGroupSet())
        .then((groupSet) => {
          testGroupSetId = groupSet.id;
          // Get the group set
          return api.course.groupset.get({
            courseId,
            groupSetId: testGroupSetId,
          });
        })
        .then((groupSet) => {
          // Check if the group set matches what we expect
          const comparison = utils.checkTemplate(
            genTestGroupSetTemplate(),
            groupSet
          );

          if (!comparison.isMatch) {
            throw new Error(`The group set we created didn't match what we expected:\n${comparison.description}`);
          }

          // Clean up: delete the group set
          return api.course.groupset.delete({
            courseId,
            groupSetId: testGroupSetId,
          })
            .catch((err) => {
              throw new Error(`We finished the test successfully but couldn't delete the test group set due to an error: ${err.message}`);
            });
        });
    });

    it('Deletes a group set', function () {
      let testGroupSetId;
      // Create a group sets so we can get it
      return api.course.groupset.create(genTestGroupSet())
        .then((groupSet) => {
          testGroupSetId = groupSet.id;
          // Delete the group set
          return api.course.groupset.delete({
            courseId,
            groupSetId: testGroupSetId,
          });
        })
        .then(() => {
          // List the group sets so we can check if the group set was deleted
          return api.course.groupset.list({
            courseId,
          });
        })
        .then((groupSets) => {
          // Make sure the group set isn't in the list anymore
          const found = utils.templateFound(
            genTestGroupSetTemplate(),
            groupSets
          );

          if (found) {
            // It's in the list! This is wrong.
            throw new Error('The group set wasn\'t deleted properly.');
          }
        });
    });
  });

  describe('Groups in Group Sets', function () {
    it('Lists groups in a group set', function () {
      let testGroupSetId;
      // Create a group sets so we can create groups in it and list those groups
      return api.course.groupset.create(genTestGroupSet())
        .then((groupSet) => {
          testGroupSetId = groupSet.id;
          // Create test groups in the group sets
          return Promise.all([
            api.course.groupset.createGroup(
              genTestGroupInGroupSet(testGroupSetId, 0)
            ),
            api.course.groupset.createGroup(
              genTestGroupInGroupSet(testGroupSetId, 1)
            ),
          ]);
        })
        .then(() => {
          // List groups in the group set
          return api.course.groupset.listGroups({
            groupSetId: testGroupSetId,
          });
        })
        .then((groups) => {
          // Check if the two generated groups are in the list
          const notFound = utils.missingTemplatesToString([
            genTestGroupInGroupSetTemplate(0),
            genTestGroupInGroupSetTemplate(1),
          ], groups);

          if (notFound) {
            throw new Error(`We could not find the following groups in the group set group list:\n${notFound}`);
          }

          // Clean up: delete the group set
          return api.course.groupset.delete({
            courseId,
            groupSetId: testGroupSetId,
          })
            .catch((err) => {
              throw new Error(`We finished the test successfully but couldn't delete the test group set due to an error: ${err.message}`);
            });
        });
    });

    it('Gets a group in a group set', function () {
      let testGroupSetId;
      // Create a group sets so we can add a group to it and then get that group
      return api.course.groupset.create(genTestGroupSet())
        .then((groupSet) => {
          testGroupSetId = groupSet.id;
          // Create test group in the group sets
          return api.course.groupset.createGroup(
            genTestGroupInGroupSet(testGroupSetId, 0)
          );
        })
        .then((group) => {
          // Get the group in the group set
          return api.course.groupset.getGroup({
            groupId: group.id,
          });
        })
        .then((group) => {
          // Check if the group matches what we expect
          const comparison = utils.checkTemplate(
            genTestGroupInGroupSetTemplate(),
            group
          );

          if (!comparison.isMatch) {
            throw new Error(`The group we got didn't match what we expected:\n${comparison.description}`);
          }

          // Clean up: delete the group set
          return api.course.groupset.delete({
            courseId,
            groupSetId: testGroupSetId,
          })
            .catch((err) => {
              throw new Error(`We finished the test successfully but couldn't delete the test group set due to an error: ${err.message}`);
            });
        });
    });

    it('Creates a group in a group set', function () {
      let testGroupSetId;
      // Create a group sets so we can create a group in it
      return api.course.groupset.create(genTestGroupSet())
        .then((groupSet) => {
          testGroupSetId = groupSet.id;
          // Create test group in the group sets
          return api.course.groupset.createGroup(
            genTestGroupInGroupSet(testGroupSetId, 0)
          );
        })
        .then((group) => {
          // Get the group in the group set
          return api.course.groupset.getGroup({
            groupId: group.id,
          });
        })
        .then((group) => {
          // Check if the group matches what we expect
          const comparison = utils.checkTemplate(
            genTestGroupInGroupSetTemplate(),
            group
          );

          if (!comparison.isMatch) {
            throw new Error(`The group we created didn't match what we expected:\n${comparison.description}`);
          }

          // Clean up: delete the group set
          return api.course.groupset.delete({
            courseId,
            groupSetId: testGroupSetId,
          })
            .catch((err) => {
              throw new Error(`We finished the test successfully but couldn't delete the test group set due to an error: ${err.message}`);
            });
        });
    });

    it('Deletes a group from a group set', function () {
      let testGroupSetId;
      // Create a group sets so we can create a group in it and delete the group
      return api.course.groupset.create(genTestGroupSet())
        .then((groupSet) => {
          testGroupSetId = groupSet.id;
          // Create test group in the group sets
          return api.course.groupset.createGroup(
            genTestGroupInGroupSet(testGroupSetId, 0)
          );
        })
        .then((group) => {
          // Delete the group from the group set
          return api.course.groupset.deleteGroup({
            groupSetId: testGroupSetId,
            groupId: group.id,
          });
        })
        .then(() => {
          // Pull the list of groups in the group set so we can make sure we
          // deleted the group
          return api.course.groupset.listGroups({
            groupSetId: testGroupSetId,
          });
        })
        .then((groups) => {
          // Check if the deleted group is still in the list
          if (utils.templateFound(genTestGroupInGroupSetTemplate(), groups)) {
            // The group was found!
            throw new Error('The group was still in the list after we attempted to delete it.');
          }

          // Clean up: delete the group set
          return api.course.groupset.delete({
            courseId,
            groupSetId: testGroupSetId,
          })
            .catch((err) => {
              throw new Error(`We finished the test successfully but couldn't delete the test group set due to an error: ${err.message}`);
            });
        });
    });
  });
});
