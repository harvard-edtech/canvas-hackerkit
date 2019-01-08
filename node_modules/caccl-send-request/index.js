const axios = require('axios');
const qs = require('qs');
const CACCLError = require('caccl-error');
const https = require('https');

const errorCodes = require('./errorCodes');

// Create an agent to ignore unauthorize ssl issues
const ignoreSSLIssuesAgent = new https.Agent({ rejectUnauthorized: false });

/**
 * Sends and retries an http request
 * @author Gabriel Abrams
 * @param {string} host - host to send request to
 * @param {string} path - path to send request to
 * @param {string} [method=GET] - http method to use
 * @param {object} [params] - body/data to include in the request
 * @param {number} [numRetries=0] - number of times to retry the request if it
 *   fails
 * @param {boolean} [ignoreSSLIssues=false] - if true, ignores SSL certificate
 *   issues
 * @return {Promise.<CACCLErrror|object>} Returns { body, status, headers } on
 *   success, CACCLError on failure
 */
const sendRequest = (options) => {
  // Set max number of retries if not defined
  const numRetries = (options.numRetries ? options.numRetries : 0);

  // Use default method if applicable
  const method = options.method || 'GET';

  // Stringify parameters
  const stringifiedParams = qs.stringify(options.params || {}, {
    encodeValuesOnly: true,
    arrayFormat: 'brackets',
  });

  // Create url (include query if GET)
  const query = (method === 'GET' ? `?${stringifiedParams}` : '');
  let url;
  if (!options.host) {
    // No host included at all. Just send to a path
    url = `${options.path}${query}`;
  } else {
    url = `https://${options.host}${options.path}${query}`;
  }

  // Create data (only if not GET)
  const data = (method !== 'GET' ? stringifiedParams : null);

  // Prep to ignore ssl issues
  const httpsAgent = (
    options.ignoreSSLIssues
      ? ignoreSSLIssuesAgent
      : undefined
  );

  // Send request
  return axios({
    method,
    url,
    data,
    httpsAgent,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
    .catch((err) => {
      // Axios throws an error if the request status indicates an error
      // sendRequest is supposed to resolve if the request went through, whether
      // the status indicates an error or not.
      if (err.response) {
        // Resolve with response
        return Promise.resolve(err.response);
      }
      // Request failed! Check if we have more attempts
      if (numRetries > 0) {
        // Update options with one less retry
        const newOptions = options;
        newOptions.numRetries -= 1;
        return sendRequest(newOptions);
      }

      // Self-signed certificate error:
      if (err.message.includes('self signed certificate')) {
        throw new CACCLError({
          message: 'We refused to send a request because the receiver has self-signed certificates.',
          code: errorCodes.selfSigned,
        });
      }

      // No tries left
      throw new CACCLError({
        message: 'We encountered an error when trying to send a network request. If this issue persists, contact an admin.',
        code: errorCodes.notConnected,
      });
    })
    .then((response) => {
      return {
        body: response.data,
        status: response.status,
        headers: response.headers,
      };
    });
};
module.exports = sendRequest;
