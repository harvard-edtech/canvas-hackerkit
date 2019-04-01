/**
 * Functions for interacting with rubrics within courses
 * @class api.course.rubric
 */

const EndpointCategory = require('../../../classes/EndpointCategory');
const prefix = require('../../common/prefix');
const utils = require('../../common/utils');

class Rubric extends EndpointCategory {
  constructor(config) {
    super(config, Rubric);
  }
}

/*------------------------------------------------------------------------*/
/*                            Rubric Endpoints                            */
/*------------------------------------------------------------------------*/

/**
 * Lists the set of rubrics in a course
 * @author Gabriel Abrams
 * @method list
 * @memberof api.course.rubric
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to add the rubric to
 * @return {Promise.<Object[]>} list of Canvas Rubrics {@link https://canvas.instructure.com/doc/api/rubrics.html#Rubric}
 */
Rubric.list = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/rubrics`,
    method: 'GET',
  });
};
Rubric.list.action = 'list all the rubrics in a course';

/**
 * Gets info on a specific rubric in a course
 * @author Gabriel Abrams
 * @method get
 * @memberof api.course.rubric
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to add the rubric to
 * @param {number} options.rubricId - Canvas course Id to add the rubric to
 * @param {boolean} [options.include=null] - Allowed values: ['assessments',
 *   'graded_assessments', 'peer_assessments']. If excluded, no assessments
 *   will be included (default: none)
 * @param {string} [options.assessmentStyle=both omitted] - Allowed values:
 *   ['full','comments_only']
 *   (full = entire assessment, comments_only = only comment part of
 *   assessment). Only valid if including assessments
 * @return {Promise.<Object>} Canvas Rubric {@link https://canvas.instructure.com/doc/api/rubrics.html#Rubric}
 */
Rubric.get = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/rubrics/${options.rubricId}`,
    method: 'GET',
    params: {
      include: utils.includeIfTruthy(options.include),
      style: utils.includeIfTruthy(options.assessmentStyle),
    },
  });
};
Rubric.get.action = 'get info on a specific rubric in a course';

/**
 * Creates a new rubric for grading with free form comments enabled and add it
 *   to an assignment in a course.
 * @version unlisted
 * @author Gabriel Abrams
 * @method createFreeFormGradingRubricInAssignment
 * @memberof api.course.rubric
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to add the rubric to
 * @param {number} options.assignmentId - Canvas course Id to add the rubric to
 * @param {array} options.rubricItems - List of rubric item objects:
 *   [{description, points, [longDescription]}, ...]
 * @param {string} [options.title=generated title] - Title of the new rubric
 * @return {Promise.<Object>} Canvas Rubric {@link https://canvas.instructure.com/doc/api/rubrics.html#Rubric}
 */
Rubric.createFreeFormGradingRubricInAssignment = function (options) {
  // Infer points possible based on the rubric items
  let pointsPossible = 0;
  options.rubricItems.forEach((rubricItem) => {
    pointsPossible += rubricItem.points;
  });
  // Set title
  const title = (
    options.title
    || 'Unnamed-rubric-' + Date.now()
  );
  const params = {
    title,
    'rubric[title]': title,
    'rubric[points_possible]': pointsPossible,
    'rubric_association[use_for_grading]': 1,
    'rubric_association[hide_score_total]': 0,
    'rubric_association[hide_points]': 0,
    'rubric_association[hide_outcome_results]': 0,
    'rubric[free_form_criterion_comments]': 1,
    points_possible: pointsPossible,
    rubric_id: 'new',
    'rubric_association[association_type]': 'Assignment',
    'rubric_association[association_id]': options.assignmentId,
    'rubric_association[purpose]': 'grading',
    skip_updating_points_possible: false,
  };
  options.rubricItems.forEach((rubricItem, i) => {
    params[`rubric[criteria][${i}][description]`] = (
      rubricItem.description
    );
    params[`rubric[criteria][${i}][points]`] = (
      rubricItem.points
    );
    params[`rubric[criteria][${i}][long_description]`] = (
      rubricItem.longDescription
    );
    params[`rubric[criteria][${i}][criterion_use_range]`] = false;
    params[`rubric[criteria][${i}][ratings][0][description]`] = (
      'Full Marks'
    );
    params[`rubric[criteria][${i}][ratings][0][points]`] = (
      rubricItem.points
    );
    params[`rubric[criteria][${i}][ratings][0][id]`] = 'blank';
    params[`rubric[criteria][${i}][ratings][1][description]`] = (
      'No Marks'
    );
    params[`rubric[criteria][${i}][ratings][1][points]`] = 0;
    params[`rubric[criteria][${i}][ratings][1][id]`] = 'blank_2';
  });
  return this.visitEndpoint({
    params,
    path: `${prefix.v1}/courses/${options.courseId}/rubrics`,
    method: 'POST',
  })
    .then((response) => {
      // Response is of form { rubric: <rubric object> } for no reason
      // We just extract that rubric object
      const { rubric } = response;
      return Promise.resolve(rubric);
    });
};
Rubric.createFreeFormGradingRubricInAssignment.action = 'create a new free form grading rubric and add it to a specific assignment in a course';

/*------------------------------------------------------------------------*/
/*                                 Export                                 */
/*------------------------------------------------------------------------*/

module.exports = Rubric;
