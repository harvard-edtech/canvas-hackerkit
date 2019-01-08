const EndpointCategory = require('../../../classes/EndpointCategory');
const prefix = require('../../common/prefix');
const utils = require('../../common/utils');

class Self extends EndpointCategory {
  constructor(config) {
    super(config, Self);
  }
}

/*------------------------------------------------------------------------*/
/*                             Self Endpoints                             */
/*------------------------------------------------------------------------*/

/**
 * Gets info on the current user
 * @author Gabriel Abrams
 * @method getProfile
 * @return {Promise.<Object>} Canvas user object {@link https://canvas.instructure.com/doc/api/users.html#User}
 */
Self.getProfile = function () {
  return this.visitEndpoint({
    path: `${prefix.v1}/users/self/profile`,
    method: 'GET',
  });
};
Self.getProfile.action = 'get info on the current user';

/**
 * Gets the list of courses associated with the current user
 * @author Gabriel Abrams
 * @method listCourses
 * @param {boolean} [includeTerm] - if truthy, term is included
 * @return {Promise.<Object>} Canvas course object {@link https://canvas.instructure.com/doc/api/courses.html#Course}
 */
Self.listCourses = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses`,
    method: 'GET',
    params: {
      include: utils.genIncludesList({
        term: options.includeTerm,
      }),
    },
  });
};
Self.listCourses.action = 'get the list of courses associated with the current user';

/*------------------------------------------------------------------------*/
/*                                 Export                                 */
/*------------------------------------------------------------------------*/

module.exports = Self;
