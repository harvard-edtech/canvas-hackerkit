const EndpointCategory = require('../../../classes/EndpointCategory');
const prefix = require('../../common/prefix');
const utils = require('../../common/utils');

class GroupSet extends EndpointCategory {
  constructor(config) {
    super(config, GroupSet);
  }
}

/*------------------------------------------------------------------------*/
/*                           Table of Contents:                           */
/*                           - Group Sets                                 */
/*                           - Groups in Group Sets                       */
/*------------------------------------------------------------------------*/

// NOTE: Canvas uses inconsistent language. What are referred to as
// "group sets" in the front-end are called "group categories" in the API.

/*------------------------------------------------------------------------*/
/*                           Group Set Endpoints                          */
/*------------------------------------------------------------------------*/

/**
 * Lists the group sets in the course
 * @author Gabriel Abrams
 * @method list
 * @param {number} courseId - Canvas course Id
 * @return {Promise.<Object[]>} list of Canvas GroupCategories {@link https://canvas.instructure.com/doc/api/group_categories.html#GroupCategory}
 */
GroupSet.list = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/group_categories`,
    method: 'GET',
  });
};
GroupSet.list.action = 'get the list of group sets in a course';

/**
 * Gets info on a specific group set
 * @author Gabriel Abrams
 * @method get
 * @param {number} groupSetId - Canvas group set Id
 * @return {Promise.<Object>} Canvas GroupCategory {@link https://canvas.instructure.com/doc/api/group_categories.html#GroupCategory}
 */
GroupSet.get = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/group_categories/${options.groupSetId}`,
    method: 'GET',
  });
};
GroupSet.get.action = 'get info on a specific group set in a course';

/**
 * Create a group set in a course
 * @author Gabriel Abrams
 * @method create
 * @param {number} courseId - Canvas course Id to create a group set in
 * @param {string} name - The name of the new group set
 * @return {Promise.<Object>} Canvas GroupCategory {@link https://canvas.instructure.com/doc/api/group_categories.html#GroupCategory}
 */
GroupSet.create = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/group_categories`,
    method: 'POST',
    params: {
      name: options.name || 'Unnamed Group Set',
    },
  })
    .then((response) => {
      return this.uncache([
        // Uncache specific group set (in case it was already hit)
        `${prefix.v1}/group_categories/${response.id}`,
      ], response);
    });
};
GroupSet.create.action = 'create a new group set in a course';

/**
 * Deletes a group set
 * @author Gabriel Abrams
 * @method delete
 * @param {number} courseId - Canvas course Id
 * @param {number} groupSetId - Canvas group set Id
 * @return {Promise.<Object>} Canvas GroupCategory {@link https://canvas.instructure.com/doc/api/group_categories.html#GroupCategory}
 */
GroupSet.delete = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/group_categories/${options.groupSetId}`,
    method: 'DELETE',
  })
    .then((response) => {
      return this.uncache([
        // Uncache list of group sets
        `${prefix.v1}/courses/${options.courseId}/group_categories`,
      ], response);
    });
};
GroupSet.delete.action = 'delete a specific group set from a course';

/*------------------------------------------------------------------------*/
/*                   Endpoints for Groups in Group Sets                   */
/*------------------------------------------------------------------------*/

/**
 * Gets the list of groups in a group set
 * @author Gabriel Abrams
 * @method listGroups
 * @param {number} groupSetId - Canvas group set Id to query
 * @return {Promise.<Object[]>} list of Canvas Groups {@link https://canvas.instructure.com/doc/api/groups.html#Group}
 */
GroupSet.listGroups = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/group_categories/${options.groupSetId}/groups`,
    method: 'GET',
  });
};
GroupSet.listGroups.action = 'get the list of groups in a group set';

/**
 * Gets info on a specific group in a group set (alias to
 *   groups.js/getGroup)
 * @author Gabriel Abrams
 * @method getGroup
 * @param {number} groupId - Canvas group Id
 * @return {Promise.<Object>} Canvas Group {@link https://canvas.instructure.com/doc/api/groups.html#Group}
 */
GroupSet.getGroup = function (options) {
  return this.api.course.group.get(options);
};
GroupSet.getGroup.action = 'get info on a specific group in a group set';

/**
 * Creates a new group in a group set
 * @author Gabriel Abrams
 * @method createGroup
 * @param {number} courseId - Canvas course Id
 * @param {number} groupSetId - Canvas group set Id to query
 * @param {string} [name=Unnamed Group] - Name of the new group
 * @param {string} [description=null] - Description of the new group
 * @param {boolean} [isPublic=false] - If truthy, group is public
 * @return {Promise.<Object>} Canvas Group {@link https://canvas.instructure.com/doc/api/groups.html#Group}
 */
GroupSet.createGroup = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/group_categories/${options.groupSetId}/groups`,
    method: 'POST',
    params: {
      name: options.name || 'Unnamed Group',
      description: options.description || '',
      is_public: utils.isTruthy(options.isPublic),
    },
  })
    .then((response) => {
      return this.uncache([
        // Uncache group set list
        `${prefix.v1}/courses/${options.courseId}/group_categories`,
        // Uncache group set
        `${prefix.v1}/group_categories/${options.groupSetId}`,
      ], response);
    });
};
GroupSet.createGroup.action = 'create a new group in a group set';


/**
 * Deletes a specific group from a group set
 * @author Gabriel Abrams
 * @method deleteGroup
 * @param {number} groupSetId - Canvas group set Id
 * @param {number} groupId - Canvas group Id to delete
 * @return {Promise.<Object>} Canvas Group {@link https://canvas.instructure.com/doc/api/groups.html#Group}
 */
GroupSet.deleteGroup = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/groups/${options.groupId}`,
    method: 'DELETE',
  })
    .then((response) => {
      return this.uncache([
        // Uncache group set list of group
        `${prefix.v1}/group_categories/${options.groupSetId}/groups`,
      ], response);
    });
};
GroupSet.deleteGroup.action = 'delete a specific group from a group set';

/*------------------------------------------------------------------------*/
/*                                 Export                                 */
/*------------------------------------------------------------------------*/

module.exports = GroupSet;
