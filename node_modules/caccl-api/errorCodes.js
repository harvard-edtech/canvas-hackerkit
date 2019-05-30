/**
 * List of error codes
 * @module errorCodes
 * @see module: errorCodes
 */

// Highest errors:
// > CAPI24
// > CANV14 (exclude 404, 500)

module.exports = {
  invalid_cache: 'CAPI1',
  unnamedEndpointError: 'CAPI2',
  endpointDidntReturnPromise: 'CAPI3',
  endpointCallExcludedRequiredParam: 'CAP24',

  // Errors for visitEndpoint/request sender
  // > /classes/instantiateEndpoint/genVisitEndpoint.js
  notFound: 'CAPI15',
  invalidSyntax: 'CAPI16',
  malformed: 'CAPI17',
  // > /classes/instantiateEndpoint/index.js
  couldNotBindEndpoint: 'CAPI22',
  // Canvas Errors:
  // > /classes/request/helpers/interpretCanvasError.js
  frontPageCannotBeUnpublished: 'CANV2',
  invalidAccessToken: 'CANV3',
  userNotAuthorized: 'CANV4',
  unauthenticated: 'CANV5',
  accessDenied: 'CANV6',
  throttled: 'CANV7',
  assignmentMissing: 'CANV8',
  studentMissing: 'CANV9',
  noValidFileIDs: 'CANV10',
  invalidSubmissionTypeFromCanvas: 'CANV11',
  unknown: 'CANV12',
  noSubmissionFiles: 'CANV13',
  quizSubmissionAlreadyExists: 'CANV14',
  endpointNotFound: 'CANV404',
  canvasInternalError: 'CANV500',

  // Errors for caches
  sessionCacheNoSession: 'CAPI13',

  // Errors for helpers
  // > endpoints/waitForCompletion.js
  waitForCompletionTimeout: 'CAPI11',
  waitForCompletionCheckError: 'CAPI12',
  waitForCompletionFailure: 'CAPI23',

  // Errors for specific endpoints

  // course.assignment
  // > createSubmission
  submissionFileUploadFailed: 'CAPI4',
  submissionFileActivateFailed: 'CAPI5',
  submissionFileCheckFailed: 'CAPI6',
  submissionFileCheckParseFailed: 'CAPI7',
  submissionFilePrepFailed: 'CAPI8',
  invalidSubmissionType: 'CAPI9',
  // > updateGrades
  noRubricOnBatchGradeUpload: 'CAPI10',

  // course.gradebookcolumns.js
  // > get
  columnNotFound: 'CAPI11',

  // course.app
  // > getMetadata
  noAppWithMetadataFound: 'CAPI18',
  metadataMalformed: 'CAPI19',
  noAppsToUpdateMetadata: 'CAPI20',

  // course.quiz
  // > listQuestionGrades
  quizReportNoRows: 'CAPI21',
};
