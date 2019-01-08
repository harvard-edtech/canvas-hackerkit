/**
 * Creates an endpoint function given the endpointCoreFunction (function),
 *   defaults, and settings
 * @author Gabriel Abrams
 * @module classes/endpoint/genEndpointFunction
 * @see module: classes/endpoint/genEndpointFunction
 */

const CACCLError = require('caccl-error');

const errorCodes = require('../../errorCodes');
const genVisitEndpoint = require('./genVisitEndpoint');

/**
 * Creates an endpoint function given the endpointCoreFunction (function),
 *   defaults, and settings
 * @author Gabriel Abrams
 * @param {function} endpointCoreFunction - the core endpoint functionality
 *   as defined as a static function in an EndpointCategory subclass
 * @param {string} action - an english representation of the action
 *   that the endpoint is completing. Should fit into the blank in: "While
 *   attempting to ___, we encountered an error". Example: "get the list of
 *   quizzes in a course"
 * * @param {object} [cache] - The cache instance. Does not cache if
 *   no cache is included
 * @param {function} uncache - a function that uncaches a list of paths and
 *   passes through a response, or just passes through a response if not caching
 * @param {object} api - Top level instance of endpoints/Endpoints.js that
 *   the EndpointCategory we're adding an endpoint to is an ancestor of
 * @param {string} [defaults.accessToken] - a default access token to apply to
 *   all requests
 * @param {number} [defaults.itemsPerPage=100] - the default number of pages to
 *   request in each page
 * @param {string} [defaults.apiPathPrefix=''] - a prefix to prepend to all
 *   request paths
 * @param {number} [defaults.numRetries=3] - the default number of times to
 *   retry failed requests
 * @param {function} [defaults.sendRequest=caccl-send-request instance] - a
 *   custom function that sends https requests (we recommend not including this)
 * @return {function} endpoint function that the library-user will call
 */
module.exports = (config = {}) => {
  // Destructure config
  const {
    api,
    cache,
    uncache,
  } = config;
  const defaults = (config.defaults || {});

  // Return a new fully-functional endpoint function
  return (options = {}) => {
    // Generate a new visitEndpoint function
    const defaultNumRetries = (
      defaults.numRetries !== undefined
        ? defaults.numRetries
        : 3
    );
    let { canvasHost } = options;
    if (options.canvasHost === undefined) {
      canvasHost = (
        defaults.canvasHost === undefined
          ? 'canvas.instructure.com'
          : defaults.canvasHost
      );
    }
    const visitEndpoint = genVisitEndpoint({
      cache,
      uncache,
      canvasHost,
      accessToken: (
        options.accessToken
        || defaults.accessToken
      ),
      itemsPerPage: (
        options.itemsPerPage
        || defaults.itemsPerPage
        || 100
      ),
      maxPages: (
        options.maxPages
        || defaults.maxPages
      ),
      apiPathPrefix: (
        options.apiPathPrefix
        || defaults.apiPathPrefix
        || ''
      ),
      numRetries: (
        options.numRetries !== undefined
          ? options.numRetries
          : defaultNumRetries
      ),
      dontCache: options.dontCache,
      ignoreCache: options.ignoreCache,
      sendRequest: options.sendRequest, // TODO: also allow default sendRequest
      startPage: options.startPage,
    });

    // Run the endpoint
    // > Make sure the endpointCoreFunction can be bound
    if (!config.endpointCoreFunction.prototype) {
      // Cannot be bound!
      return Promise.reject(
        new CACCLError({
          message: 'We ran into an internal error while attempting to bind the context of an endpoint function.',
          code: errorCodes.couldNotBindEndpoint,
        })
      );
    }
    // > Create context for core function
    const ctx = {
      visitEndpoint,
      uncache,
      api,
    };
    // > Run the core endpoint function with ctx as this
    const runPromise = config.endpointCoreFunction.bind(ctx)(options);

    // Check to make sure the endpointCoreFunction returned a promise
    if (
      !runPromise
      || !runPromise.then
      || !runPromise.catch
    ) {
      // Endpoint didn't return promise
      return Promise.reject(new CACCLError({
        message: `The "${config.action}" endpoint malfunctioned: it didn't return a promise. Please contact an admin.`,
        code: errorCodes.endpointDidntReturnPromise,
      }));
    }

    // Post-process errors to make them human-readable
    return runPromise.catch((err) => {
      // Turn into CACCLError if not already
      let newError = err;
      if (!err.isCACCLError) {
        newError = new CACCLError(err);
        newError.code = errorCodes.unnamedEndpointError;
      }

      // Add on action to the error
      if (newError.message.startsWith('While attempting to ')) {
        // There's already an action. Add an umbrella action
        const newUmbrella = ` (in order to ${config.action})`;

        // Check to see if an umbrella action has already been added
        const currUmbrella = newError.message.match(/\(in order to .*\)/g);
        if (currUmbrella && currUmbrella.length > 0) {
          // Another umbrella action already exists. Replace it
          newError.message = newError.message.replace(
            currUmbrella[0],
            newUmbrella
          );
        } else {
          const parts = newError.message.split(',');
          parts[0] += newUmbrella;
          newError.message = parts.join(',');
        }
      } else {
        newError.message = `While attempting to ${config.action}, we ran into an error: ${(err.message || 'unknown')}`;
      }

      throw newError;
    });
  };
};
