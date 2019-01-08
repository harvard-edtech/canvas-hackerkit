const EndpointCategory = require('../../../classes/EndpointCategory');
const prefix = require('../../common/prefix');

class Section extends EndpointCategory {
  constructor(config) {
    super(config, Section);
  }
}

/*------------------------------------------------------------------------*/
/*                            Section Endpoints                           */
/*------------------------------------------------------------------------*/

/**
 * Gets the list of sections in a course
 * @author Gabriel Abrams
 * @method list
 * @param {number} courseId - Canvas course Id to query
 * @return {Promise.<Object[]>} list of Canvas Sections {@link https://canvas.instructure.com/doc/api/sections.html#Section}
 */
Section.list = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/sections`,
    method: 'GET',
  });
};
Section.list = 'get the list of sections in a course';

/**
 * Gets info on a specific section
 * @author Gabriel Abrams
 * @method get
 * @param {number} courseId - Canvas course Id to query
 * @param {number} sectionId - Section Id to retrieve
 * @return {Promise.<Object>} Canvas Section {@link https://canvas.instructure.com/doc/api/sections.html#Section}
 */
Section.get = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/sections/${options.sectionId}`,
    method: 'GET',
  });
};
Section.get.action = 'get info on a specific section in a course';

/*------------------------------------------------------------------------*/
/*                                 Export                                 */
/*------------------------------------------------------------------------*/

module.exports = Section;
