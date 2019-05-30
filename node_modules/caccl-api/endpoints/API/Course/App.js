/**
 * Functions for interacting with external LTI apps within courses
 * @class api.course.app
 */

const CACCLError = require('caccl-error');

const EndpointCategory = require('../../../classes/EndpointCategory');
const prefix = require('../../common/prefix');
const utils = require('../../common/utils');
const errorCodes = require('../../../errorCodes');


class App extends EndpointCategory {
  constructor(config) {
    super(config, App);
  }
}

/*------------------------------------------------------------------------*/
/*                           Table of Contents:                           */
/*                           - Apps                                       */
/*                           - Metadata                                   */
/*------------------------------------------------------------------------*/

/*------------------------------------------------------------------------*/
/*                               Endpoints:                               */
/*------------------------------------------------------------------------*/

/**
 * Gets the list of apps installed into a course
 * @author Gabriel Abrams
 * @memberof api.course.app
 * @instance
 * @method list
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to query
 * @param {boolean} [options.excludeParents] - If true, excludes tools
 *   installed in all accounts above the current context
 * @return {Promise.<Object[]>} list of external tools {@link https://canvas.instructure.com/doc/api/external_tools.html}
 */
App.list = function (options) {
  const params = (
    !options.excludeParents
      ? { include_parents: false }
      : {}
  );
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/external_tools`,
    method: 'GET',
    params,
  });
};
App.list.action = 'get the list of apps installed into a course';
App.list.requiredParams = ['courseId'];

/**
 * Gets info on a single LTI tool
 * @author Gabriel Abrams
 * @memberof api.course.app
 * @instance
 * @method get
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id
 * @param {number} options.appId - The LTI app Id to get
 * @return {Promise.<Object>} Canvas external tool {@link https://canvas.instructure.com/doc/api/external_tools.html#method.external_tools.show}
 */
App.get = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/external_tools/${options.appId}`,
    method: 'GET',
  });
};
App.get.action = 'get info on a specific LTI app in a course';
App.get.requiredParams = ['courseId', 'appId'];

/**
 * Adds an LTI app to a Canvas course
 * @author Gabriel Abrams
 * @memberof api.course.app
 * @instance
 * @method add
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to install into
 * @param {string} options.name - The app name (for settings app list)
 * @param {string} options.key - Installation consumer key
 * @param {string} options.secret - Installation consumer secret
 * @param {string} options.xml - XML configuration file, standard LTI format
 * @param {string} [options.description] - A human-readable description of the
 *   app
 * @param {string} [options.launchPrivacy] - 'public' by default
 * @return {Promise.<Object>} Canvas external tool {@link https://canvas.instructure.com/doc/api/external_tools.html#method.external_tools.show}
 */
App.add = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/external_tools`,
    method: 'POST',
    params: {
      name: options.name,
      privacy_level: options.launchPrivacy || 'public',
      consumer_key: options.key,
      consumer_secret: options.secret,
      config_type: 'by_xml',
      config_xml: options.xml,
      description: utils.includeIfTruthy(options.description),
      icon_url: utils.includeIfTruthy(options.icon),
    },
  });
};
App.add.action = 'add an LTI app to a course';
App.add.requiredParams = [
  'courseId',
  'name',
  'key',
  'secret',
  'xml',
];

/**
 * Removes an LTI app from a Canvas course
 * @author Gabriel Abrams
 * @memberof api.course.app
 * @instance
 * @method remove
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to remove app from
 * @param {number} options.appId - The LTI app Id to remove
 * @return {Promise.<Object>} Canvas external tool {@link https://canvas.instructure.com/doc/api/external_tools.html#method.external_tools.show}
 */
App.remove = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/external_tools/${options.appId}`,
    method: 'DELETE',
  });
};
App.remove.action = 'remove an LTI app from a course';
App.remove.requiredParams = ['courseId', 'appId'];

/*------------------------------------------------------------------------*/
/*                                Metadata                                */
/*------------------------------------------------------------------------*/

/**
 * Gets the metadata for an LTI app in a course. Note: this endpoint requires
 *   that the app have a custom parameter called 'metadataId' with an identifier
 *   that we will use to refer to the metadata. If each installation of an app
 *   will have its own metadata, each installation should have a different
 *   metadataId. If all installations share the same metadata, they should all
 *   have the same metadataId. When getting metadata, we return the metadata
 *   for the first app we find that has this metadataId
 * @author Gabriel Abrams
 * @memberof api.course.app
 * @instance
 * @method getMetadata
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id that holds the app
 * @param {number} options.metadataId - metadata identifier (see endpoint
 *   description)
 * @return {Promise.<Object>} Canvas external tool {@link https://canvas.instructure.com/doc/api/external_tools.html#method.external_tools.show}
 */
App.getMetadata = function (options) {
  // Get the list of apps
  return this.api.course.app.list({
    courseId: options.courseId,
  })
    .then((apps) => {
      // Find the first app that has this metadataId
      let firstAppWithMetadataId;
      for (let i = 0; i < apps.length; i++) {
        if (
          apps[i].custom_fields
          && apps[i].custom_fields.metadataId
          && apps[i].custom_fields.metadataId === options.metadataId
        ) {
          // Found an app with this metadata id!
          firstAppWithMetadataId = apps[i];
          break;
        }
      }
      if (!firstAppWithMetadataId) {
        // No apps with this metadataId could be found! Throw arror
        throw new CACCLError({
          message: 'We could not find any apps with the given metadata id.',
          code: errorCodes.noAppWithMetadataFound,
        });
      }

      // Check if metadata is empty
      if (
        !firstAppWithMetadataId.custom_fields.metadata
        || firstAppWithMetadataId.custom_fields.metadata === ''
        || firstAppWithMetadataId.custom_fields.metadata.trim().length === 0
      ) {
        // Metadata empty
        return Promise.resolve({});
      }

      // Parse metadata
      try {
        const metadata = JSON.parse(
          firstAppWithMetadataId.custom_fields.metadata
        );
        return Promise.resolve(metadata);
      } catch (err) {
        // Metadata malformed
        throw new CACCLError({
          message: 'Metadata was malformed.',
          code: errorCodes.metadataMalformed,
        });
      }
    });
};
App.getMetadata.action = 'get metadata for an LTI app in a course';
App.getMetadata.requiredParams = ['courseId', 'metadataId'];

/**
 * Updates the metadata for an LTI app in a course. Note: this endpoint requires
 *   that the app have a custom parameter called 'metadataId' with an identifier
 *   that we will use to refer to the metadata. If each installation of an app
 *   will have its own metadata, each installation should have a different
 *   metadataId. If all installations share the same metadata, they should all
 *   have the same metadataId. When updating metadata, we update the metadata
 *   for all apps with the given metadataId
 * @author Gabriel Abrams
 * @memberof api.course.app
 * @instance
 * @method updateMetadata
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id that holds the app
 * @param {number} options.metadataId - metadata identifier (see endpoint
 *   description)
 * @param {object} [options.metadata={}] - json metadata object
 * @return {Promise.<Object[]>} Array of external tools (the apps that were updated) {@link https://canvas.instructure.com/doc/api/external_tools.html#method.external_tools.show}
 */
App.updateMetadata = function (options) {
  // Pre-process metadata
  const metadata = JSON.stringify(options.metadata || {});

  // Get the list of apps
  let appsToUpdate;
  return this.api.course.app.list({
    courseId: options.courseId,
  })
    .then((apps) => {
      // Find all apps with this metadataId
      appsToUpdate = apps.filter((app) => {
        return (
          app.custom_fields
          && app.custom_fields.metadataId
          && app.custom_fields.metadataId === options.metadataId
        );
      });
      if (appsToUpdate.length === 0) {
        // No apps with this metadataId could be found! Throw arror
        throw new CACCLError({
          message: 'We could not find any apps with the given metadata id.',
          code: errorCodes.noAppsToUpdateMetadata,
        });
      }

      // Update all app metadata objects in parallel
      return Promise.all(
        appsToUpdate.map((app) => {
          // Perform merge for custom fields so we don't lose other custom vals
          const params = {
            'custom_fields[metadata]': metadata,
          };
          Object.keys(app.custom_fields).forEach((customPropName) => {
            // Don't let old metadata overwrite new metadata
            if (customPropName === 'metadata') {
              return;
            }
            const customVal = app.custom_fields[customPropName];
            params[`custom_fields[${customPropName}]`] = customVal;
          });
          // Update custom params
          return this.visitEndpoint({
            params,
            path: `${prefix.v1}/courses/${options.courseId}/external_tools/${app.id}`,
            method: 'PUT',
          });
        })
      );
    });
};
App.updateMetadata.action = 'get metadata for an LTI app in a course';
App.updateMetadata.requiredParams = ['courseId', 'metadataId'];

/*------------------------------------------------------------------------*/
/*                                 Export                                 */
/*------------------------------------------------------------------------*/

module.exports = App;
