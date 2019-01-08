const EndpointCategory = require('../../../classes/EndpointCategory');
const prefix = require('../../common/prefix');
const utils = require('../../common/utils');

class AssignmentGroup extends EndpointCategory {
  constructor(config) {
    super(config, AssignmentGroup);
  }
}

/*------------------------------------------------------------------------*/
/*                          Assignment Endpoints                          */
/*------------------------------------------------------------------------*/

/**
 * Lists assignment groups in a course
 * @author Gabriel Abrams
 * @method listAssignmentGroups
 * @param {number} courseId - Canvas course Id to query
 * @return {Promise.<Object[]>} list of Canvas AssignmentGroups {@link https://canvas.instructure.com/doc/api/assignment_groups.html#AssignmentGroup}
 */
AssignmentGroup.list = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/assignment_groups`,
    method: 'GET',
  });
};
AssignmentGroup.list.action = 'list the assignment groups in a course';

/**
 * Gets info on a specific assignment group in a course
 * @author Gabriel Abrams
 * @method getAssignmentGroup
 * @param {number} courseId - Canvas course Id to query
 * @param {number} assignmentGroupId - Assignment group to get
 * @param {number} courseId - Canvas course Id to query
 * @return {Promise.<Object>} Canvas AssignmentGroup {@link https://canvas.instructure.com/doc/api/assignment_groups.html#AssignmentGroup}
 */
AssignmentGroup.get = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/assignment_groups/${options.assignmentGroupId}`,
    method: 'GET',
  });
};
AssignmentGroup.get.action = 'get info on a specific assignment group in a course';

/**
 * Updates an assignment group in a course
 * @author Gabriel Abrams
 * @method update
 * @param {number} courseId - Canvas course Id to query
 * @param {number} assignmentGroupId - Assignment group to update
 * @param {string} [name=current value] - New assignment group name
 * @param {number} [weight=current value] - New weight
 * @return {Promise.<Object>} Canvas AssignmentGroup {@link https://canvas.instructure.com/doc/api/assignment_groups.html#AssignmentGroup}
 */
AssignmentGroup.update = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/assignment_groups/${options.assignmentGroupId}`,
    method: 'PUT',
    params: {
      name: utils.includeIfTruthy(options.name),
      group_weight: utils.includeIfNumber(options.weight),
    },
  });
};
AssignmentGroup.update.action = 'update an assignment group in a course';

/**
 * Create a new assignment group in a course
 * @author Gabriel Abrams
 * @method create
 * @param {number} courseId - Canvas course Id to query
 * @param {string} name - New assignment group name
 * @param {number} [weight=0] - Assignment group weight
 * @return {Promise.<Object>} Canvas AssignmentGroup {@link https://canvas.instructure.com/doc/api/assignment_groups.html#AssignmentGroup}
 */
AssignmentGroup.create = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/assignment_groups`,
    method: 'POST',
    params: {
      name: utils.includeIfTruthy(options.name),
      group_weight: utils.includeIfNumber(options.weight),
    },
  });
};
AssignmentGroup.create.action = 'create a new assignment group in a course';

/**
 * Deletes an assignment group from a course
 * @author Gabriel Abrams
 * @method delete
 * @param {number} courseId - Canvas course Id to query
 * @param {number} assignmentGroupId - Assignment group to delete
 * @param {number} [moveAssignmentsTo] - Assignment group to move
 *   assignments to. If this parameter isn't included, assignments in the
 *   assignment group will be deleted.
 * @return {Promise.<Object>} Canvas AssignmentGroup {@link https://canvas.instructure.com/doc/api/assignment_groups.html#AssignmentGroup}
 */
AssignmentGroup.delete = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/assignment_groups/${options.assignmentGroupId}`,
    method: 'DELETE',
    params: {
      move_assignments_to:
        utils.includeIfNumber(options.moveAssignmentsTo),
    },
  })
    .then((response) => {
      // Uncache destination assignment group if applicable
      if (options.moveAssignmentsTo) {
        // Uncache the destination assignment group
        return this.uncache(
          [`${prefix.v1}/courses/${options.courseId}/assignment_groups/${options.moveAssignmentsTo}*`],
          response
        );
      }
      return Promise.resolve(response);
    });
};
AssignmentGroup.delete.action = 'delete an assignment group from a course';

/*------------------------------------------------------------------------*/
/*                                 Export                                 */
/*------------------------------------------------------------------------*/

module.exports = AssignmentGroup;
