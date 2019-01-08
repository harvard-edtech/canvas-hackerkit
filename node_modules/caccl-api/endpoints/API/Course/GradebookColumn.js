const CACCLError = require('caccl-error');

const EndpointCategory = require('../../../classes/EndpointCategory');
const errorCodes = require('../../../errorCodes');
const prefix = require('../../common/prefix');
const utils = require('../../common/utils');
const waitForCompletion = require('../../common/waitForCompletion');

class GradebookColumn extends EndpointCategory {
  constructor(config) {
    super(config, GradebookColumn);
  }
}

/*------------------------------------------------------------------------*/
/*                           Table of Contents:                           */
/*                           - Gradebook Column                           */
/*                           - Gradebook Column Data                      */
/*------------------------------------------------------------------------*/

/*------------------------------------------------------------------------*/
/*                       Gradebook Column Endpoints                       */
/*------------------------------------------------------------------------*/

/**
 * Gets the list of custom gradebook columns in a course
 * @author Gabriel Abrams
 * @method list
 * @param {number} courseId - Canvas course Id to query
 * @param {boolean} [includeHidden=false] - If truthy, includes hidden
 *   gradebook columns as well.
 * @return {Promise.<Object[]>} List of Canvas CustomColumns {@link https://canvas.instructure.com/doc/api/custom_gradebook_columns.html#CustomColumn}
 */
GradebookColumn.list = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/custom_gradebook_columns`,
    method: 'GET',
    params: {
      include_hidden: utils.isTruthy(options.includeHidden),
    },
  });
};
GradebookColumn.list.action = 'get the list of gradebook columns in a course';

/**
 * Gets info on a specific gradebook column in a course. This is a simulated
 *   endpoint: it does not exist. We are just pulling the list of columns and
 *   returning one element.
 * @author Gabriel Abrams
 * @method get
 * @param {number} courseId - Canvas course Id to query
 * @param {number} columnId - Canvas column Id to return
 * @param {boolean} [isHidden=false] - Must be set to true if the column
 *   you're retrieving is a hidden column.
 * @return {Promise.<Object>} Canvas CustomColumn {@link https://canvas.instructure.com/doc/api/custom_gradebook_columns.html#CustomColumn}
 */
GradebookColumn.get = function (options) {
  return this.api.course.gradebookcolumn.list({
    courseId: options.courseId,
    includeHidden: options.isHidden,
  })
    .then((columns) => {
      for (let i = 0; i < columns.length; i++) {
        if (columns[i].id === options.columnId) {
          // Found the column the caller was looking for
          return Promise.resolve(columns[i]);
        }
      }
      // Couldn't find the column
      let hiddenMessage = '';
      if (!options.isHidden) {
        hiddenMessage = 'We were only searching through non-hidden columns. If the column you were looking for is hidden, you need to specify that.';
      }
      throw new CACCLError({
        message: `We couldn't find the column you were looking for. ${hiddenMessage}`,
        code: errorCodes.columnNotFound,
      });
    });
};
GradebookColumn.get.action = 'get a specific gradebook column in a course';

/**
 * Updates a gradebook column's information
 * @author Gabriel Abrams
 * @method update
 * @param {number} courseId - Canvas course ID
 * @param {number} columnId - Canvas custom gradebook column ID to query
 * @param {string} [title=current value] - New title for the column
 * @param {number} [position=current value] - New position for the column in
 *   the list of custom gradebook columns
 * @param {boolean} [hidden=current value] - If set, updates whether the
 *   custom gradebook column is hidden from everyone. Must be a boolean
 * @return {Promise.<Object>} Canvas CustomColumn {@link https://canvas.instructure.com/doc/api/custom_gradebook_columns.html#CustomColumn}
 */
GradebookColumn.update = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/custom_gradebook_columns/${options.columnId}`,
    method: 'PUT',
    params: {
      'column[title]': utils.includeIfTruthy(options.title),
      'column[position]': utils.includeIfNumber(options.position),
      'column[hidden]': utils.includeIfBoolean(options.hidden),
    },
  });
};
GradebookColumn.update.action = 'update a gradebook column\'s information';

/**
 * Creates a new gradebook column in a course
 * @author Gabriel Abrams
 * @method create
 * @param {number} courseId - Canvas course Id to query
 * @param {string} [title=Untitled Column] - Title of new custom gradebook
 *   column
 * @param {number} [position=last] - Position of the gradebook column within
 *   the list of custom gradebook columns
 * @param {boolean} [hidden=false] - If truthy, hides the gradebook column
 *   from everyone, not just instructor as usual
 * @return {Promise.<Object>} Canvas CustomColumn {@link https://canvas.instructure.com/doc/api/custom_gradebook_columns.html#CustomColumn}
 */
GradebookColumn.create = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/custom_gradebook_columns`,
    method: 'POST',
    params: {
      'column[title]': options.title || 'Untitled Column',
      'column[hidden]': utils.isTruthy(options.hidden),
      'column[position]': utils.includeIfNumber(options.position),
    },
  });
};
GradebookColumn.create.action = 'create a new gradebook column in a course';

/**
 * Deletes a gradebook column from a course
 * @author Gabriel Abrams
 * @method delete
 * @param {number} courseId - Canvas course Id to query
 * @param {number} columnId - Gradebook column Id
 * @return {Promise.<Object>} Canvas CustomColumn {@link https://canvas.instructure.com/doc/api/custom_gradebook_columns.html#CustomColumn}
 */
GradebookColumn.delete = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/custom_gradebook_columns/${options.columnId}`,
    method: 'DELETE',
  });
};
GradebookColumn.delete.action = 'delete a gradebook column from a course';

/*------------------------------------------------------------------------*/
/*                     Gradebook Column Data Endpoints                    */
/*------------------------------------------------------------------------*/

/**
 * Gets the list of entries in a specific gradebook column in a course
 * @author Gabriel Abrams
 * @method listEntries
 * @param {number} courseId - Canvas course Id to query
 * @param {number} columnId - Gradebook column Id
 * @return {Promise.<Object[]>} list of Canvas ColumnDatum objects {@link https://canvas.instructure.com/doc/api/custom_gradebook_columns.html#ColumnDatum}
 */
GradebookColumn.listEntries = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/custom_gradebook_columns/${options.columnId}/data`,
    method: 'GET',
    params: {
      include_hidden: true,
    },
  });
};
GradebookColumn.listEntries.action = 'get the list of entries in a specific gradebook column in a course';

/**
 * Update the list of entries in a specific gradebook column in a course
 * @author Gabriel Abrams
 * @method updateEntries
 * @param {number} courseId - Canvas course Id to query
 * @param {number} columnId - Gradebook column Id
 * @param {array} entries - list of ColumnDatum objects:
 *   `[{user_id: <Canvas User Id>, text: <New Entry Text>}, ...]`
 * @param {boolean} [waitForCompletion=false] - If truthy, waits for
 *   completion of batch update request
 * @param {number} [waitForCompletionTimeout=2] - Number of minutes to wait
 *   for completion of batch upload
 * @return {Promise.<Object>} Canvas progress object {@link https://canvas.instructure.com/doc/api/progress.html#Progress}
 */
GradebookColumn.updateEntries = function (options) {
  // Pre-process column data, adding gradebook column Id to each entry
  const columnData = options.entries.map((entry) => {
    const newEntry = entry;
    newEntry.column_id = options.columnId;
    return newEntry;
  });
  // Send batch update request
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/custom_gradebook_column_data`,
    method: 'PUT',
    params: {
      column_data: columnData,
    },
  })
    .then((progress) => {
      return this.uncache([
        // Uncache column data
        `${prefix.v1}/courses/${options.courseId}/custom_gradebook_columns/${options.columnId}/data`,
      ])
        .then(() => {
          if (options.waitForCompletion) {
            return waitForCompletion({
              visitEndpoint: this.visitEndpoint,
              progress,
              timeout: options.waitForCompletionTimeout,
            });
          }
        });
    });
};
GradebookColumn.updateEntries.action = 'batch update entries in a gradebook column';

/*------------------------------------------------------------------------*/
/*                                 Export                                 */
/*------------------------------------------------------------------------*/

module.exports = GradebookColumn;
