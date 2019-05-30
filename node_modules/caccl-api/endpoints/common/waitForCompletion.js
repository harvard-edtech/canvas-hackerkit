/**
 * Functionality to wait for Canvas progress object to complete
 * @author Gabriel Abrams
 * @module endpoints/helpers/waitForCompletion
 * @see module: endpoints/helpers/waitForCompletion
 */

const urlLib = require('url');
const CACCLError = require('caccl-error');

const errorCodes = require('../../errorCodes');

/**
 * Creates a new promise that resolves when the task has been completed. The
 *   process pings Canvas every refreshMs milliseconds.
 * @author Gabriel Abrams
 * @param {object} progress - a Canvas Progress object {@link https://canvas.instructure.com/doc/api/progress.html#Progress}
 *   that was returned from a request for a large change in Canvas (e.g., batch
 *   grade upload, batch gradebook column data change)
 * @param {function} visitEndpoint - the visitEndpoint function included in the
 *   endpoint's config object
 * @param {number} [timeout=2] - Number of minutes to wait before timing out
 * @param {number} [refreshMs=250] - Number of milliseconds to wait between
 *   progress checks
 * @return promise that either resolves with a Progress object {@link https://canvas.instructure.com/doc/api/progress.html#Progress}
 *   upon successful completion, or rejects with a CACCLError
 */
module.exports = (options) => {
  return new Promise((resolve, reject) => {
    // Prep for timeout
    const timeout = (60000 * (options.timeout || 2));
    const stopTime = Date.now() + timeout;
    // Prep to check
    const checkPath = urlLib.parse(options.progress.url).path;

    // Create check status function
    const checkStatus = () => {
      options.visitEndpoint({
        path: checkPath,
        params: {
          ignoreCache: true,
          dontCache: true,
        },
      })
        .then((statusResponse) => {
          // Detect issues
          if (statusResponse.workflow_state === 'failed') {
            return reject(new CACCLError({
              message: statusResponse.message,
              code: errorCodes.waitForCompletionFailure,
            }));
          }

          // If no success, keep trying
          if (statusResponse.workflow_state !== 'completed') {
            // Not yet completed
            if (Date.now() > stopTime) {
              // Timeout!
              return reject(new CACCLError({
                message: 'A queued job reached its timeout. This does not mean that the job did not complete (it might have). It just means that we reached a timeout while checking on the progress of the job. It may complete in the future.',
                code: errorCodes.waitForCompletionTimeout,
              }));
            }

            // We have more time to try again
            return setTimeout(checkStatus, options.refreshMs || 250);
          }

          // Completed! Success
          return resolve(statusResponse);
        })
        .catch((err) => {
          // Error occurred while checking status
          return reject(new CACCLError({
            message: `We encountered an error while checking the status of a queued project: "${err.message}"`,
            code: errorCodes.waitForCompletionCheckError,
          }));
        });
    };
    checkStatus();
  });
};
