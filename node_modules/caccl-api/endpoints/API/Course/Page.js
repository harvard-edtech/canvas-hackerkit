const EndpointCategory = require('../../../classes/EndpointCategory');
const prefix = require('../../common/prefix');
const utils = require('../../common/utils');

class Page extends EndpointCategory {
  constructor(config) {
    super(config, Page);
  }
}

/*------------------------------------------------------------------------*/
/*                             Page Endpoints                             */
/*------------------------------------------------------------------------*/

/**
 * Gets the list of pages in a course
 * @author Gabriel Abrams
 * @method list
 * @param {number} courseId - Canvas course Id to query
 * @return {Promise.<Object[]>} list of Canvas Pages {@link https://canvas.instructure.com/doc/api/pages.html#Page}
 */
Page.list = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/pages`,
    method: 'GET',
  });
};
Page.list.action = 'get the list of pages in a course';

/**
 * Get info on a specific page in a course
 * @author Gabriel Abrams
 * @method get
 * @param {number} courseId - Canvas course Id to query
 * @param {string} pageURL - Canvas page url (just the last part of path)
 * @return {Promise.<Object>} Canvas Page {@link https://canvas.instructure.com/doc/api/pages.html#Page}
 */
Page.get = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/pages/${options.pageURL}`,
    method: 'GET',
  });
};
Page.get.action = 'get info on a specific page in a course';

/**
 * Updates a Canvas page
 * @author Gabriel Abrams
 * @method update
 * @param {number} courseID - Canvas course ID holding the page to update
 * @param {string} pageURL - Canvas page url (just the last part of path)
 * @param {boolean} [notifyOfUpdate=false] - if true, send notification
 * @param {string} [title=current value] - New title of the page
 * @param {string} [body=current value] - New html body of the page
 * @param {string} [editingRoles=current value] - New usertype(s) who can edit
 * @param {boolean} [published=current value] - New publish status of page
 *   Must be a boolean
 * @param {boolean} [frontPage=current value] - New front page status of page.
 *   Must be a boolean
 * @return {Promise.<Object>} Canvas Page {@link https://canvas.instructure.com/doc/api/pages.html#Page}
 */
Page.update = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/pages/${options.pageURL}`,
    method: 'PUT',
    params: {
      'wiki_page[title]': utils.includeIfTruthy(options.title),
      'wiki_page[body]': utils.includeIfTruthy(options.body),
      'wiki_page[editing_roles]':
         utils.includeIfTruthy(options.editingRoles),
      'wiki_page[notify_of_update]':
         utils.includeIfTruthy(options.notify_of_update),
      'wiki_page[published]': utils.includeIfBoolean(options.published),
      'wiki_page[front_page]': utils.includeIfBoolean(options.frontPage),
    },
  });
};
Page.update.action = 'update a specific page in a course';

/**
 * Creates a new page in a course
 * @author Gabriel Abrams
 * @method create
 * @param {number} courseId - Canvas course Id to query
 * @param {string} [title=Untitled Page] - The title of the page
 * @param {string} [body=null] - html body of the page
 * @param {string} [editingRoles=teachers] - usertype(s) who can edit
 * @param {boolean} [notifyOfUpdate=false] - if true, sends notification
 * @param {boolean} [published=false] - if true, publishes page upon creation
 * @param {boolean} [frontPage=false] - if true, sets page as front page
 * @return {Promise.<Object>} Canvas Page {@link https://canvas.instructure.com/doc/api/pages.html#Page}
 */
Page.create = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/pages`,
    method: 'POST',
    params: {
      'wiki_page[title]': (options.title || 'Untitled Page'),
      'wiki_page[body]': (options.body || ''),
      'wiki_page[editing_roles]': (options.editingRoles || 'teachers'),
      'wiki_page[notify_of_update]':
        utils.isTruthy(options.notifyOfUpdate),
      'wiki_page[published]': utils.isTruthy(options.published),
      'wiki_page[front_page]': utils.isTruthy(options.frontPage),
    },
  });
};
Page.create.action = 'create a new page in a course';

/**
 * Deletes a page from a course
 * @author Gabriel Abrams
 * @method delete
 * @param {number} courseId - Canvas course Id to query
 * @param {string} pageURL - Page url to delete (just last part of path)
 * @return {Promise.<Object>} Canvas Page {@link https://canvas.instructure.com/doc/api/pages.html#Page}
 */
Page.delete = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/pages/${options.pageURL}`,
    method: 'DELETE',
  });
};
Page.delete.action = 'delete a page from a course';

/*------------------------------------------------------------------------*/
/*                                 Export                                 */
/*------------------------------------------------------------------------*/

module.exports = Page;
