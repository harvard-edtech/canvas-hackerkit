const EndpointCategory = require('../../classes/EndpointCategory');

// Import subcategories
const Course = require('./Course');
const User = require('./User');

class API extends EndpointCategory {
  constructor(config) {
    super(config, API);
  }
}

/*------------------------------------------------------------------------*/
/*                             Subcategories:                             */
/*------------------------------------------------------------------------*/

API.course = Course;
API.user = User;

/*------------------------------------------------------------------------*/
/*                                 Export                                 */
/*------------------------------------------------------------------------*/

module.exports = API;
