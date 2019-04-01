/**
 * Functions for interacting with student groups within courses
 * @class api.course.group
 */

const EndpointCategory = require('../../../classes/EndpointCategory');
const prefix = require('../../common/prefix');
const utils = require('../../common/utils');

class Group extends EndpointCategory {
  constructor(config) {
    super(config, Group);
  }
}

/*------------------------------------------------------------------------*/
/*                           Table of Contents:                           */
/*                           - Group                                      */
/*                           - Group Members                              */
/*------------------------------------------------------------------------*/

/*------------------------------------------------------------------------*/
/*                             Group Endpoints                            */
/*------------------------------------------------------------------------*/

/**
 * Gets info on a specific group in a course
 * @author Gabriel Abrams
 * @method get
 * @memberof api.course.group
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.groupId - Canvas group Id
 * @return Group {@link https://canvas.instructure.com/doc/api/groups.html#Group}
 */
Group.get = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/groups/${options.groupId}`,
    method: 'GET',
  });
};
Group.get.action = 'get info on a specific group in a course';

// NOTE: to create or delete a group, see endpoints in groupSets

/*------------------------------------------------------------------------*/
/*                         Group Member Endpoints                         */
/*------------------------------------------------------------------------*/

/**
 * Gets the list of members in a group
 * @author Gabriel Abrams
 * @method listMembers
 * @memberof api.course.group
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.groupId - Canvas group Id
 * @return {Promise.<Object[]>} list of Canvas Users {@link https://canvas.instructure.com/doc/api/users.html#User}
 */
Group.listMembers = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/groups/${options.groupId}/users`,
    method: 'GET',
  });
};
Group.listMembers.action = 'get the list of members in a specific group';

/**
 * Gets the list of members in a group
 * @author Gabriel Abrams
 * @method updateMembers
 * @memberof api.course.group
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.groupId - Canvas group Id
 * @param {array} [options.members=[]] - The list of user objects/user Ids that
 *   should be in the group
 * @return {Promise.<Object>} Canvas Group {@link https://canvas.instructure.com/doc/api/groups.html#Group}
 */
Group.updateMembers = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/groups/${options.groupId}`,
    method: 'PUT',
    params: {
      members: utils.extractIdsIfApplicable(options.members),
    },
  })
    .then((response) => {
      return this.uncache([
        // Uncache the list of group members
        `${prefix.v1}/groups/${options.groupId}/users`,
      ], response);
    });
};
Group.updateMembers.action = 'update the list of members in a group';

/*------------------------------------------------------------------------*/
/*                                 Export                                 */
/*------------------------------------------------------------------------*/

module.exports = Group;
