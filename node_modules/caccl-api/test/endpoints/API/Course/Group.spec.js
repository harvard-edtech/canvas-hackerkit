const api = require('../../../common/genInstructorAPI.js')();
const utils = require('../../../common/utils.js');
const environment = require('../../../environment.js');

const courseId = environment.testCourseId;
const allStudentIds = environment.students.map((x) => {
  return x.canvasId;
});

/*------------------------------------------------------------------------*/
/*                     Helpers and Content Definitions                    */
/*------------------------------------------------------------------------*/

const testGroupMembers = [allStudentIds[0], allStudentIds[1]];
const testGroupMemberTemplates = (
  [environment.students[0], environment.students[1]]
    .map((s) => {
      return {
        id: s.canvasId,
        name: `${s.first} ${s.last}`,
        sortable_name: `${s.last}, ${s.first}`,
        login_id: s.sis_user_id,
        sis_user_id: s.sis_user_id,
      };
    })
);

const stamp = new Date().getTime();

// Generate the parameters for a test group set
function genTestGroupSet(index = 0) {
  return {
    courseId,
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

describe('Endpoints > Course > Group', function () {
  describe('Groups', function () {
    it('Gets a group', function () {
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
          return api.course.group.get({
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
  });

  describe('Members', function () {
    it('Lists group members', function () {
      let testGroupSetId;
      let testGroupId;
      // Create a group sets so we can add a group to it and add members to it
      return api.course.groupset.create(genTestGroupSet())
        .then((groupSet) => {
          testGroupSetId = groupSet.id;
          // Create test group in the group sets
          return api.course.groupset.createGroup(
            genTestGroupInGroupSet(testGroupSetId, 0)
          );
        })
        .then((group) => {
          testGroupId = group.id;
          // Add members to the group
          return api.course.group.updateMembers({
            groupId: testGroupId,
            members: testGroupMembers,
          });
        })
        .then(() => {
          // List the group members
          return api.course.group.listMembers({
            groupId: testGroupId,
          });
        })
        .then((members) => {
          // Check for all members
          const notFound = utils.missingTemplatesToString(
            testGroupMemberTemplates,
            members
          );

          if (notFound) {
            throw new Error(`We could not find the following members:${notFound}`);
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

    it('Updates group members', function () {
      let testGroupSetId;
      let testGroupId;
      // Create a group sets so we can add a group to it and add members to it
      return api.course.groupset.create(genTestGroupSet())
        .then((groupSet) => {
          testGroupSetId = groupSet.id;
          // Create test group in the group sets
          return api.course.groupset.createGroup(
            genTestGroupInGroupSet(testGroupSetId, 0)
          );
        })
        .then((group) => {
          testGroupId = group.id;
          // Add members to the group
          return api.course.group.updateMembers({
            groupId: testGroupId,
            members: testGroupMembers,
          });
        })
        .then(() => {
          // List the group members
          return api.course.group.listMembers({
            groupId: testGroupId,
          });
        })
        .then((members) => {
          // Check for all members
          const notFound = utils.missingTemplatesToString(
            testGroupMemberTemplates,
            members
          );

          if (notFound) {
            throw new Error(`We could not find the following members:\n${notFound}`);
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
