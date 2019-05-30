/**
 * Functions for calling other endpoints not added to our support list of APIs
 * @class api.other
 */

const EndpointCategory = require('../../../classes/EndpointCategory');

class Other extends EndpointCategory {
  constructor(config) {
    super(config, Other);
  }
}

/*------------------------------------------------------------------------*/
/*                             Self Endpoints                             */
/*------------------------------------------------------------------------*/

/**
 * Gets info on the current user
 * @author Gabriel Abrams
 * @method endpoint
 * @memberof api.other
 * @instance
 * @param {string} path - the path of the endpoint to call
 *   (e.g. /api/v1/courses), just the path: not the host or protocol
 * @param {string} [method=GET] - the http method to use
 * @param {object} [params={}] - the get query params or the post/put/delete
 *   body params
 * @return {Promise.<Object>} Canvas object
 */
Other.endpoint = function (options) {
  return this.visitEndpoint({
    path: options.path,
    method: options.method || 'GET',
    params: options.params,
  })
    .then((response) => {
      return this.uncache([
        // Uncache all paths (we have no idea what the programmer is calling)
        '*',
      ], response);
    });
};
Other.endpoint.action = 'call an endpoint';
Other.endpoint.requiredParams = ['path'];

module.exports = Other;
