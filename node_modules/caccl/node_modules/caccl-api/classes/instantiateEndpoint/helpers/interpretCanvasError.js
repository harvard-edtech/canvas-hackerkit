/**
 * Function that interprets a Canvas response and detects errors and turns them
 *   into human-readable errors
 * @author Gabriel Abrams
 * @module classes/request/helpers/interpretCanvasError
 * @see module: classes/request/helpers/interpretCanvasError
 */

const CACCLError = require('caccl-error');

const errorCodes = require('../../../errorCodes');

/**
 * Detects errors and turns them into human-readable errors
 * @author Gabriel Abrams
 * @param {object} body - The JSON body of the Canvas response
 * @param {number} status - The https status of the response
 * @return {CACCLError|null} error if one was detected, null if no error
 */
module.exports = (body, status) => {
  try {
    if (status > 300 || status < 200) {
      // Status indicates that an error occurred. Try to detect the error type

      // Do some pre-processing to help with detection
      let firstErrorMessage;
      let firstErrorCode;
      try {
        firstErrorMessage = body.errors[0].message;
        firstErrorCode = body.errors[0].error_code;
      } catch (err) {
        firstErrorMessage = '';
        firstErrorCode = '';
      }

      // 404
      if (
        body.status === '404 Not Found'
        || firstErrorMessage === 'The specified resource does not exist.'
      ) {
        return new CACCLError({
          message: 'We could not find the Canvas resource we were looking for.',
          code: errorCodes.endpointNotFound,
        });
      }

      // Front page error
      if (
        body.errors
        && body.errors.front_page
        && body.errors.front_page[0]
        && body.errors.front_page[0].type
        && body.errors.front_page[0].type === 'The front page cannot be unpublished'
      ) {
        return new CACCLError({
          message: 'The front page cannot be unpublished',
          code: errorCodes.frontPageCannotBeUnpublished,
        });
      }

      // Canvas internal error
      if (firstErrorCode === 'internal_server_error') {
        return new CACCLError({
          message: 'Canvas experienced an internal error. If this continues to occur, contact academic technologies and/or an admin.',
          code: errorCodes.canvasInternalError,
        });
      }

      // Unauthenticated
      if (body.status === 'unauthenticated') {
        return new CACCLError({
          message: 'Unfortunately, we cannot access Canvas because we don\'t have an access token. If this error persists, please contact an admin.',
          code: errorCodes.unauthenticated,
        });
      }

      // Unauthorized
      if (
        status === 401
        || body.status === 'unauthorized'
        || firstErrorCode === 'unauthorized'
      ) {
        // Check for invalid access token
        if (body.message === 'Invalid access token.') {
          return new CACCLError({
            message: 'Unfortunately, Canvas revoked our access to the API. This can happen if our authorization expires. Please re-launch the app.',
            code: errorCodes.invalidAccessToken,
          });
        }

        // Check if the user is not authorized
        if (firstErrorMessage.startsWith('user not authorized')) {
          return new CACCLError({
            message: 'Unfortunately, we couldn\'t complete a task because the current user does not have the correct permissions. If you think this is an error, please try again.',
            code: errorCodes.userNotAuthorized,
          });
        }

        // User doesn't have the proper privileges. We don't know why.
        return new CACCLError({
          message: 'Canvas denied us access to a resource because you do not have the proper privileges.',
          code: errorCodes.unauthorized,
        });
      }

      // Access Denied
      if (body.error && body.error === 'access_denied') {
        return new CACCLError({
          message: 'Canvas denied our access. Please try again or re-install the tool. If this issue persists, please contact an admin.',
          code: errorCodes.accessDenied,
        });
      }

      // Throttling
      if (body.status && body.status === 'throttled') {
        return new CACCLError({
          message: 'Canvas is receiving high traffic and has throttled our access. Please wait a few minutes and try again.',
          code: errorCodes.throttled,
        });
      }

      // Missing assignment
      if (firstErrorMessage.startsWith('assignment is missing')) {
        return new CACCLError({
          message: 'We couldn\'t find the assignment we were looking for.',
          code: errorCodes.assignmentMissing,
        });
      }

      // Unknown student IDs
      if (firstErrorMessage.startsWith('unknown student ids')) {
        return new CACCLError({
          message: 'We couldn\'t find the student we were looking for.',
          code: errorCodes.studentMissing,
        });
      }

      // Invalid file IDs
      if (body.message === 'No valid file ids given') {
        return new CACCLError({
          message: 'We couldn\'t upload files because no valid file IDs were given',
          code: errorCodes.noValidFileIDs,
        });
      }

      // Invalid submission type
      if (body.message === 'Invalid submission[submission_type] given') {
        return new CACCLError({
          message: 'Invalid submission type given',
          code: errorCodes.invalidSubmissionTypeFromCanvas,
        });
      }

      // Conflicting quiz submission
      if (body.message === 'a quiz submission already exists') {
        return new CACCLError({
          message: 'A quiz submission already exists or a submission is already currently in progress. If a submission is open and in progress, please end it before trying to start another.',
          code: errorCodes.quizSubmissionAlreadyExists,
        });
      }

      // We couldn't identify this error. Report this as "unknown"
      return new CACCLError({
        message: 'Canvas responded with an unknown error.',
        code: errorCodes.unknown,
      });
    }
  } catch (err) {
    // Encountered error while trying to find an error
    return new CACCLError({
      message: 'We ran into an issue while trying to interpret the Canvas response and detect Canvas errors.',
      code: errorCodes.couldNotProcessForErrors,
    });
  }

  // No error found
  return null;
};
