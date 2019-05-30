/**
 * Session cache class
 * @author Gabriel Abrams
 * @module classes/caches/SessionCache
 * @see module: classes/caches/SessionCache
 */

const CACCLError = require('caccl-error');
const errorCodes = require('../../errorCodes.js');
const hashParams = require('./helpers/hashParams.js');

/** Class that stores cache in session */
class SessionCache {
  /**
   * Creates a SessionCache
   * @author Gabriel Abrams
   * @param {object} params - Object containing get parameters
   * @return {string} hashed cache key
   */
  constructor(req) {
    // Save request object
    this._req = req;

    // Check if no cache
    if (!this._req || !this._req.session) {
      throw new CACCLError({
        message: 'We could not create a new session cache because we didn\'t have a valid request and/or session object. Please contact an admin.',
        code: errorCodes.sessionCacheNoSession,
      });
    }

    // Initialize session (if not already done)
    if (!this._req.session.cache) {
      this._req.session.cache = {};
    }
  }

  /**
   * Gets a value given the key pair (path, param)
   * @author Gabriel Abrams
   * @param {string} path - The url path that is cached
   * @param {object} params - The get parameters for the cached request
   * @return {Promise.<object>} Promise that resolves with cached value
   */
  get(path, params) {
    if (
      path
      && params
      && this._req.session.cache[path]
    ) {
      // This path has some cached values. Look up based on params
      const paramsKey = hashParams(params);
      return Promise.resolve(this._req.session.cache[path][paramsKey]);
    }
    return Promise.resolve();
  }

  /**
   * Saves a value to the key pair (path, param), fetchable using get function
   * @author Gabriel Abrams
   * @param {string} path - The url path to cache
   * @param {object} params - The get parameters to cache
   * @param {string} value - The value to cache
   * @return {Promise} Promise that resolves when set and save are complete
   */
  set(path, params, value) {
    if (
      !path
      || !params
      || !value
    ) {
      // Nothing to store. Skip this
      return;
    }

    // Initialize submap if needed
    if (!this._req.session.cache[path]) {
      this._req.session.cache[path] = {};
    }

    // Store new triplet
    const paramsKey = hashParams(params);
    this._req.session.cache[path][paramsKey] = value;

    // Save
    return this._save();
  }

  /**
   * Deletes a specific path (and all associated params) from the cache
   * @author Gabriel Abrams
   * @return {Promise} Promise that resolves when the path is deleted
   */
  deletePaths(paths) {
    if (!paths) {
      // Nothing to delete (no paths)
      return Promise.resolve();
    }

    paths.forEach((path) => {
      delete this._req.session.cache[path];
    });

    // Save
    return this._save();
  }

  /**
   * Gets the list of all cached paths
   * @author Gabriel Abrams
   * @return {Promise.<string[]>} Promise that resolves with the list of cached
   *   paths
   */
  getAllPaths() {
    return Promise.resolve(Object.keys(this._req.session.cache));
  }

  /**
   * Deletes the entire cache
   * @author Gabriel Abrams
   * @return Promise that resolves when delete is complete
   */
  deleteAllPaths() {
    this._req.session.cache = {};
    return this._save();
  }

  /**
   * Saves the current state of the session via express session
   * @author Gabriel Abrams
   * @return {Promise} Promise that resolves when save is complete
   */
  _save() {
    return new Promise((resolve, reject) => {
      this._req.session.save((err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  }
}

module.exports = SessionCache;
