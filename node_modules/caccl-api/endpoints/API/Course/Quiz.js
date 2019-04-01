/**
 * Functions for interacting with quizzes within courses
 * @class api.course.quiz
 */

const axios = require('axios');
const parseCSV = require('csv-parse/lib/sync');

const CACCLError = require('caccl-error');

const errorCodes = require('../../../errorCodes');
const EndpointCategory = require('../../../classes/EndpointCategory');
const prefix = require('../../common/prefix');
const utils = require('../../common/utils');
const waitForCompletion = require('../../common/waitForCompletion');

class Quiz extends EndpointCategory {
  constructor(config) {
    super(config, Quiz);
  }
}

/*------------------------------------------------------------------------*/
/*                           Table of Contents:                           */
/*                           - Quizzes                                    */
/*                           - Quiz Questions                             */
/*                           - Quiz Submissions                           */
/*------------------------------------------------------------------------*/

/*------------------------------------------------------------------------*/
/*                             Quiz Endpoints                             */
/*------------------------------------------------------------------------*/

/**
 * Lists the quizzes in a course
 * @author Gabriel Abrams
 * @method list
 * @memberof api.course.quiz
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to query
 * @return {Promise.<Object[]>} list of Canvas Quizzes {@link https://canvas.instructure.com/doc/api/quizzes.html#Quiz}
 */
Quiz.list = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/quizzes`,
    method: 'GET',
  });
};
Quiz.list.action = 'get the list of quizzes in a course';

/**
 * Get info on a specific quiz in a course
 * @author Gabriel Abrams
 * @method get
 * @memberof api.course.quiz
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to query
 * @param {number} options.quizId - Canvas quiz Id (not the quiz's assignment
 *   Id)
 * @return {Promise.<Object>} Canvas Quiz {@link https://canvas.instructure.com/doc/api/quizzes.html#Quiz}
 */
Quiz.get = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/quizzes/${options.quizId}`,
    method: 'GET',
  });
};
Quiz.get.action = 'get info on a specific quiz in a course';

/**
 * Updates a specific quiz in a course
 * @author Gabriel Abrams
 * @method update
 * @memberof api.course.quiz
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to create the quiz in
 * @param {number} options.quizId - Canvas course Id to create the quiz in
 * @param {boolean} options.suppressNotification - If true, does not notify
 *   users that the quiz has been updated
 * @param {string} [options.title=current value] - New title of the quiz
 * @param {string} [options.description=current value] - New HTML description of
 *   the quiz
 * @param {string} [options.type=current value] - Quiz type. Allowed values: [
 *   'practice_quiz', 'assignment', 'graded_survey', 'survey']
 * @param {date} [options.dueAt=current value] - Date the quiz is due
 * @param {date} [options.lockAt=current value] - Date the quiz is lock
 * @param {date} [options.unlockAt=current value] - Date the quiz is unlock
 * @param {boolean} [options.published=current value] - If true, quiz is
 *   published
 * @param {number} [options.allowedAttempts=current value] - Number of times a
 *   student is allowed to take the quiz. Set to -1 for unlimited attempts
 * @param {string} [options.scoringPolicy=current value] - Only valid if
 *   allowedAttempts > 1. Allowed values: ['keep_highest', 'keep_latest']
 * @param {boolean} [options.oneQuestionAtATime=current value] - If true, shows
 *   quiz to student one question at a time. Must be a boolean
 * @param {boolean} [options.cantGoBack=current value] - If true, shows quiz to
 *   student one question at a time. Must be a boolean
 * @param {string} [options.accessCode=current value] - If defined, restricts
 *   access to the quiz only to those with this access code
 * @param {string} [options.ipFilter=current value] - If defined, restricts
 *   access to the quiz to computers in a specified IP range. Filters can be a
 *   comma-separated list of addresses, or an address followed by a mask
 * @param {number} [options.assignmentGroupId=current value] - The assignment
 *   group to put the quiz into. Only valid if type is "assignment" or
 *   "graded_survey"
 * @param {number} [options.timeLimitMins=current value] - Time limit for the
 *   quiz in minutes
 * @param {boolean} [options.shuffleAnswers=current value] - If true, quiz
 *   answers for multiple choice questions will be randomized for each student
 * @param {string} [options.hideResults=current value] - Allowed values:
 *   ['always', 'until_after_last_attempt'], determines whether the student can
 *   see their own submission and other results
 * @param {boolean} [options.hideCorrectAnswers=current value] - Only valid if
 *   hideResults is not defined. If true, hides correct answers from students
 *   when results are viewed
 * @param {boolean} [options.showCorrectAnswersAfterLastAttempt=current value] -
 *   Only valid if hideCorrectAnswers is not true and allowedAttemptes > 1. If
 *   true, hides correct answers from students when quiz results are viewed
 *   until they submit the last attempt for the quiz. Must be a boolean
 * @param {date} [options.showCorrectAnswersAt=current value] - Only valid if
 *   hideCorrectAnswers is not true. If set, correct answers will only be
 *   visible after this date
 * @param {date} [options.hideCorrectAnswersAt=current value] - Only valid if
 *   hideCorrectAnswers is not true. If set, correct answers will stop being
 *   visible after this date has passed
 * @param {boolean} [options.oneTimeResults=current value] - Whether students
 *   should be prevented from viewing their quiz results past the first time
 *   (right after they turn in the quiz)
 * @param {boolean} [options.onlyVisibleToOverrides=current value] - If true,
 *   the quiz is only visible to students with overrides
 * @return {Promise.<Object>} Canvas Quiz {@link https://canvas.instructure.com/doc/api/quizzes.html#Quiz}
 */
Quiz.update = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/quizzes/${options.quizId}`,
    method: 'PUT',
    params: {
      'quiz[title]': options.title,
      'quiz[description]': utils.includeIfTruthy(options.description),
      'quiz[quiz_type]': utils.includeIfTruthy(options.type),
      'quiz[assignment_group_id]':
        utils.includeIfNumber(options.assignmentGroupId),
      'quiz[time_limit]':
        utils.includeIfNumber(options.timeLimitMins),
      'quiz[shuffle_answers]':
        utils.includeIfBoolean(options.shuffleAnswers),
      'quiz[hide_results]':
        utils.includeIfTruthy(options.hideResults),
      'quiz[show_correct_answers]':
        !utils.includeIfBoolean(options.hideCorrectAnswers),
      'quiz[show_correct_answers_last_attempt]': utils.includeIfBoolean(
        options.showCorrectAnswersAfterLastAttempt
      ),
      'quiz[show_correct_answers_at]':
        utils.includeIfDate(options.showCorrectAnswersAt),
      'quiz[hide_correct_answers_at]':
        utils.includeIfDate(options.hideCorrectAnswersAt),
      'quiz[allowed_attempts]':
        utils.includeIfNumber(options.allowedAttempts),
      'quiz[scoring_policy]':
        utils.includeIfTruthy(options.scoringPolicy),
      'quiz[one_question_at_a_time]':
        utils.includeIfBoolean(options.oneQuestionAtATime),
      'quiz[cant_go_back]':
        utils.includeIfBoolean(options.cantGoBack),
      'quiz[access_code]':
        utils.includeIfTruthy(options.accessCode),
      'quiz[ip_filter]':
        utils.includeIfTruthy(options.ipFilter),
      'quiz[due_at]':
        utils.includeIfDate(options.dueAt),
      'quiz[lock_at]':
        utils.includeIfDate(options.lockAt),
      'quiz[unlock_at]':
        utils.includeIfDate(options.unlockAt),
      'quiz[published]':
        utils.includeIfBoolean(options.published),
      'quiz[one_time_results]':
        utils.includeIfBoolean(options.oneTimeResults),
      'quiz[only_visible_to_overrides]':
        utils.includeIfBoolean(options.onlyVisibleToOverrides),
      'quiz[notify_of_update]':
        !utils.isTruthy(options.suppressNotification),
    },
  })
    .then((response) => {
      if (response.assignment_id) {
        return this.uncache([
          // Uncache list of assignments
          `${prefix.v1}/courses/${options.courseId}/assignments`,
          // Uncache assignment (quiz is also an assignment)
          `${prefix.v1}/courses/${options.courseId}/assignments/${response.assignment_id}*`,
        ], response);
      }
      return Promise.resolve(response);
    });
};
Quiz.update.action = 'update a specific quiz in a course';

/**
 * Creates a new quiz in a course
 * @author Gabriel Abrams
 * @method create
 * @memberof api.course.quiz
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to create the quiz in
 * @param {string} options.title - Title of the new quiz
 * @param {string} [options.description=null] - HTML description of the quiz
 * @param {string} [options.type=null] - Quiz type. Allowed values: [
 *   'practice_quiz', 'assignment', 'graded_survey', 'survey']
 * @param {date} [options.dueAt=null] - Date the quiz is due
 * @param {date} [options.lockAt=null] - Date the quiz is lock
 * @param {date} [options.unlockAt=null] - Date the quiz is unlock
 * @param {boolean} [options.published=false] - If true, quiz is published
 * @param {number} [options.allowedAttempts=1] - Number of times a student is
 *   allowed to take the quiz. Set to -1 for unlimited attempts
 * @param {string} [options.scoringPolicy=keep_highest] - Only valid if
 *   allowedAttempts > 1. Allowed values: ['keep_highest', 'keep_latest']
 * @param {boolean} [options.oneQuestionAtATime=false] - If true, shows quiz to
 *   student one question at a time
 * @param {boolean} [options.cantGoBack=false] - If true, shows quiz to student
 *   one question at a time
 * @param {string} [options.accessCode=false] - If defined, restricts access to
 *   the quiz only to those with this access code
 * @param {string} [options.ipFilter=false] - If defined, restricts access to
 *   the quiz to computers in a specified IP range. Filters can be a
 *   comma-separated list of addresses, or an address followed by a mask
 * @param {number} [options.assignmentGroupId=top assignment group] - The
 *   assignment group to put the quiz into. Only valid if type is "assignment"
 *   or "graded_survey"
 * @param {number} [options.timeLimitMins=null] - Time limit for the quiz in
 *   minutes
 * @param {boolean} [options.shuffleAnswers=false] - If true, quiz answers for
 *   multiple choice questions will be randomized for each student
 * @param {string} [options.hideResults=not hidden] - Allowed values: ['always',
 *   'until_after_last_attempt'], determines whether the student can see their
 *   own submission and other results
 * @param {boolean} [options.hideCorrectAnswers=false] - Only valid if
 *   hideResults is not defined. If true, hides correct answers from students
 *   when results are viewed
 * @param {boolean} [options.showCorrectAnswersAfterLastAttempt=false] - Only
 *   valid if hideCorrectAnswers is not true and allowedAttemptes > 1. If true,
 *   hides correct answers from students when quiz results are viewed until
 *   they submit the last attempt for the quiz
 * @param {date} [options.showCorrectAnswersAt=null] - Only valid if
 *   hideCorrectAnswers is not true. If set, correct answers will only be
 *   visible after this date
 * @param {date} [options.hideCorrectAnswersAt=null] - Only valid if
 *   hideCorrectAnswers is not true. If set, correct answers will stop being
 *   visible after this date has passed
 * @param {boolean} [options.oneTimeResults=false] - Whether students should be
 *   prevented from viewing their quiz results past the first time (right
 *   after they turn in the quiz)
 * @param {boolean} [options.onlyVisibleToOverrides=false] - If true, the quiz
 *   is only visible to students with overrides
 * @return {Promise.<Object>} Canvas Quiz {@link https://canvas.instructure.com/doc/api/quizzes.html#Quiz}
 */
Quiz.create = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/quizzes`,
    method: 'POST',
    params: {
      'quiz[title]': options.title,
      'quiz[description]': utils.includeIfTruthy(options.description),
      'quiz[quiz_type]': utils.includeIfTruthy(options.type),
      'quiz[assignment_group_id]':
        utils.includeIfNumber(options.assignmentGroupId),
      'quiz[time_limit]':
        utils.includeIfNumber(options.timeLimitMins),
      'quiz[shuffle_answers]':
        utils.isTruthy(options.shuffleAnswers),
      'quiz[hide_results]':
        utils.includeIfTruthy(options.hideResults),
      'quiz[show_correct_answers]':
        !utils.isTruthy(options.hideCorrectAnswers),
      'quiz[show_correct_answers_last_attempt]':
        utils.isTruthy(options.showCorrectAnswersAfterLastAttempt),
      'quiz[show_correct_answers_at]':
        utils.includeIfDate(options.showCorrectAnswersAt),
      'quiz[hide_correct_answers_at]':
        utils.includeIfDate(options.hideCorrectAnswersAt),
      'quiz[allowed_attempts]':
        utils.includeIfNumber(options.allowedAttempts),
      'quiz[scoring_policy]':
        utils.includeIfTruthy(options.scoringPolicy),
      'quiz[one_question_at_a_time]':
        utils.isTruthy(options.oneQuestionAtATime),
      'quiz[cant_go_back]':
        utils.isTruthy(options.cantGoBack),
      'quiz[access_code]':
        utils.includeIfTruthy(options.accessCode),
      'quiz[ip_filter]':
        utils.includeIfTruthy(options.ipFilter),
      'quiz[due_at]':
        utils.includeIfDate(options.dueAt),
      'quiz[lock_at]':
        utils.includeIfDate(options.lockAt),
      'quiz[unlock_at]':
        utils.includeIfDate(options.unlockAt),
      'quiz[published]':
        utils.isTruthy(options.published),
      'quiz[one_time_results]':
        utils.isTruthy(options.oneTimeResults),
      'quiz[only_visible_to_overrides]':
        utils.isTruthy(options.onlyVisibleToOverrides),
    },
  })
    .then((response) => {
      if (response.assignment_id) {
        return this.uncache([
          // Uncache list of assignments
          `${prefix.v1}/courses/${options.courseId}/assignments`,
          // Uncache assignment (quiz is also an assignment)
          `${prefix.v1}/courses/${options.courseId}/assignments/${response.assignment_id}*`,
        ], response);
      }
      return Promise.resolve(response);
    });
};
Quiz.create.action = 'update a specific quiz in a course';

/**
 * Deletes a quiz from a course
 * @author Gabriel Abrams
 * @method delete
 * @memberof api.course.quiz
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to query
 * @param {number} options.quizId - Canvas quiz Id (not the quiz's assignment
 *   Id)
 * @return {Promise.<Object>} Canvas Quiz {@link https://canvas.instructure.com/doc/api/quizzes.html#Quiz}
 */
Quiz.delete = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/quizzes/${options.quizId}`,
    method: 'DELETE',
  })
    .then((response) => {
      if (response.assignment_id) {
        this.uncache([
          // Uncache list of assignments
          `${prefix.v1}/courses/${options.courseId}/assignments`,
          // Uncache assignment (quiz is also an assignment)
          `${prefix.v1}/courses/${options.courseId}/assignments/${response.assignment_id}*`,
        ], response);
      }
      return Promise.resolve(response);
    });
};
Quiz.delete.action = 'delete a specific quiz from a course';

/*------------------------------------------------------------------------*/
/*                         Quiz Question Endpoints                        */
/*------------------------------------------------------------------------*/

/**
 * Lists the questions in a specific quiz in a course
 * @author Gabriel Abrams
 * @method listQuestions
 * @memberof api.course.quiz
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to query
 * @param {number} options.quizId - Canvas quiz Id (not the quiz's assignment
 *   Id)
 * @return {Promise.<Object[]>} list of Canvas QuizSubmissions {@link https://canvas.instructure.com/doc/api/quiz_submissions.html}
 */
Quiz.listQuestions = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/quizzes/${options.quizId}/questions`,
    method: 'GET',
  });
};
Quiz.listQuestions.action = 'get the list of questions in a specific quiz in a course';

/**
 * Creates a new multiple choice question and adds it to a quiz in a course
 * @author Gabriel Abrams
 * @method createMultipleChoiceQuestion
 * @memberof api.course.quiz
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to query
 * @param {number} options.quizId - Canvas quiz Id (not the quiz's assignment
 *   Id)
 * @param {string} options.name - Name of the question
 * @param {string} options.text - The text of the question, as displayed to the
 *   quiz taker
 * @param {number} options.pointsPossible - Maximum number of points
 * @param {array} options.answers - Array of answers: [{ text, isCorrect,
 *   comment }]
 * @param {number} [options.position=last] - Optional. Position of the question
 *   with respect to the other questions in the quiz
 * @param {string} [options.correctComment=null] - Comment to display if the
 *   student answers correctly
 * @param {string} [options.incorrectComment=null] - Comment to display if the
 *   student answers incorrectly
 * @param {string} [options.neutralComment=null] - Comment to display regardless
 *   of how the student answers
 * @return {Promise.<Object>} Canvas QuizQuestion {@link https://canvas.instructure.com/doc/api/quiz_questions.html#QuizQuestion}
 */
Quiz.createMultipleChoiceQuestion = function (options) {
  const params = {
    'question[question_name]': options.name,
    'question[question_text]': options.text,
    'question[question_type]': 'multiple_choice_question',
    'question[position]': utils.includeIfNumber(options.position),
    'question[points_possible]': options.pointsPossible,
    'question[correct_comments]':
      utils.includeIfTruthy(options.correctComment),
    'question[incorrect_comments]':
      utils.includeIfTruthy(options.incorrectComment),
    'question[neutralComment]':
      utils.includeIfTruthy(options.neutralComment),
    'question[text_after_answers]':
      utils.includeIfTruthy(options.textAfterAnswers),
  };

  // Add answers
  (options.answers || []).forEach((answer, i) => {
    const answerPrefix = `question[answers][${i}]`;
    params[`${answerPrefix}[answer_precision]`] = 10;
    params[`${answerPrefix}[answer_weight]`] = (answer.isCorrect ? 100 : 0);
    params[`${answerPrefix}[numerical_answer_type]`] = 'exact_answer';
    params[`${answerPrefix}[answer_text]`] = answer.text;
    params[`${answerPrefix}[answer_comment]`] = answer.comment;
  });
  return this.visitEndpoint({
    params,
    path: `${prefix.v1}/courses/${options.courseId}/quizzes/${options.quizId}/questions`,
    method: 'POST',
  });
};
Quiz.createMultipleChoiceQuestion.action = 'create a new multiple choice question and add it to a quiz in a course';

/**
 * Creates a new essay question and adds it to a quiz in a course
 * @author Gabriel Abrams
 * @method createEssayQuestion
 * @memberof api.course.quiz
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to query
 * @param {number} options.quizId - Canvas quiz Id (not the quiz's assignment
 *   Id)
 * @param {string} options.name - Name of the question
 * @param {string} options.text - The text of the question, as displayed to the
 *   quiz taker
 * @param {number} options.pointsPossible - Maximum number of points
 * @param {number} [options.position=last] - Optional. Position of the question
 *   with respect to the other questions in the quiz
 * @param {string} [options.correctComment=null] - Comment to display if the
 *   student answers correctly
 * @param {string} [options.incorrectComment=null] - Comment to display if the
 *   student answers incorrectly
 * @param {string} [options.neutralComment=null] - Comment to display regardless
 *   of how the student answers
 * @return {Promise.<Object>} Canvas QuizQuestion {@link https://canvas.instructure.com/doc/api/quiz_questions.html#QuizQuestion}
 */
Quiz.createEssayQuestion = function (options) {
  const params = {
    'question[question_name]': options.name,
    'question[question_text]': options.text,
    'question[question_type]': 'essay_question',
    'question[position]': utils.includeIfNumber(options.position),
    'question[points_possible]': options.pointsPossible,
    'question[correct_comments]':
      utils.includeIfTruthy(options.correctComment),
    'question[incorrect_comments]':
      utils.includeIfTruthy(options.incorrectComment),
    'question[neutralComment]':
      utils.includeIfTruthy(options.neutralComment),
    'question[text_after_answers]':
      utils.includeIfTruthy(options.textAfterAnswers),
  };
  return this.visitEndpoint({
    params,
    path: `${prefix.v1}/courses/${options.courseId}/quizzes/${options.quizId}/questions`,
    method: 'POST',
  });
};
Quiz.createEssayQuestion.action = 'create a new essay question and add it to a quiz in a course';

/*------------------------------------------------------------------------*/
/*                        Quiz Submission Endpoints                       */
/*------------------------------------------------------------------------*/

/**
 * Lists the submissions to a quiz in a course
 * @author Gabriel Abrams
 * @method listSubmissions
 * @memberof api.course.quiz
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to query
 * @param {number} options.quizId - Canvas quiz Id (not the quiz's assignment
 *   Id)
 * @return {Promise.<Object[]>} list of Canvas QuizSubmissions {@link https://canvas.instructure.com/doc/api/quiz_submissions.html}
 */
Quiz.listSubmissions = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/quizzes/${options.quizId}/submissions`,
    method: 'GET',
  })
    .then((response) => {
      return Promise.resolve(response.quiz_submissions);
    });
};
Quiz.listSubmissions.action = 'get the list of submissions to a specific quiz in a course';

/**
 * Gets info on a specific submission to a quiz in a course
 * @author Gabriel Abrams
 * @method getSubmission
 * @memberof api.course.quiz
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to query
 * @param {number} options.quizId - Canvas quiz Id (not the quiz's assignment
 *   Id)
 * @param {number} options.submissionId - Canvas quiz submission Id
 * @return {Promise.<Object>} Canvas QuizSubmission {@link https://canvas.instructure.com/doc/api/quiz_submissions.html}
 */
Quiz.getSubmission = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/quizzes/${options.quizId}/submissions/${options.submissionId}`,
    method: 'GET',
  })
    .then((response) => {
      return Promise.resolve(response.quiz_submissions[0]);
    });
};
Quiz.getSubmission.action = 'get the list of submissions to a specific quiz in a course';

/**
 * Creates a new submission to a specific quiz in a course on behalf of the
 *   current user
 * @author Gabriel Abrams
 * @method createSubmission
 * @memberof api.course.quiz
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id
 * @param {number} options.quizId - Canvas quiz Id (not the quiz's assignment
 *   Id)
 * @param {object[]} options.answers - List of answers to quiz questions:
 *   [{id: <quiz_question_id>, answer: <answer_object>},...] where the answer
 *   object is explained here: {@link https://canvas.instructure.com/doc/api/quiz_submission_questions.html#Question+Answer+Formats-appendix}
 * @param {string} [options.accessCode] - Access code for the quiz if it is
 *   locked
 * @return {Promise.<Object>} Canvas QuizSubmission {@link https://canvas.instructure.com/doc/api/quiz_submissions.html}
 */
Quiz.createSubmission = function (options) {
  // Start a new quiz-taking session
  let submissionId;
  let validationToken;
  let attempt;
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/quizzes/${options.quizId}/submissions`,
    method: 'POST',
    params: {
      access_code: utils.includeIfTruthy(options.accessCode),
    },
  })
    .then((response) => {
      const openSubmission = response.quiz_submissions[0];
      submissionId = openSubmission.id;
      validationToken = openSubmission.validation_token;
      ({ attempt } = openSubmission);

      // Answer questions
      const params = {
        attempt,
        validation_token: validationToken,
        access_code: utils.includeIfTruthy(options.accessCode),
        quiz_questions: options.answers,
      };
      return this.visitEndpoint({
        params,
        path: `${prefix.v1}/quiz_submissions/${submissionId}/questions`,
        method: 'POST',
      });
    })
    .then(() => {
      // Complete the student's submission
      return this.visitEndpoint({
        path: `${prefix.v1}/courses/${options.courseId}/quizzes/${options.quizId}/submissions/${submissionId}/complete`,
        method: 'POST',
        params: {
          attempt,
          validation_token: validationToken,
          access_code: utils.includeIfTruthy(options.accessCode),
        },
      });
    })
    .then((response) => {
      return this.uncache([
        // Uncache submission
        `${prefix.v1}/courses/${options.courseId}/quizzes/${options.quizId}/submissions/${submissionId}`,
        // Uncache list of submissions
        `${prefix.v1}/courses/${options.courseId}/quizzes/${options.quizId}/submissions`,
      ], response.quiz_submissions[0]);
    });
};
Quiz.createSubmission.action = 'create a new submission to a specific quiz in a course on behalf of the current user';

/*------------------------------------------------------------------------*/
/*                         Quiz Grading Endpoints                         */
/*------------------------------------------------------------------------*/

// Constants for quiz report CSVs
// If positive, we're including the column index
// If negative, the column's index can be calculated using:
//   csvHeaderRow.length + offset
const reportColMap = {
  name: 0,
  id: 1,
  sisId: 2,
  section: 3,
  sectionIds: 4,
  sectionSISIds: 5,
  submittedAt: 6,
  numCorrectOffset: -3,
  numIncorrectOffset: -2,
  scoreOffset: -1,
  // Each question takes up two columns:
  firstQuestionCol: 7,
  lastQuestionColOffset: -4,
};

/**
 * Lists quiz question grades for a specific quiz in a course
 * @author Gabriel Abrams
 * @method listQuestionGrades
 * @memberof api.course.quiz
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to query
 * @param {number} options.quizId - Canvas quiz Id (not the quiz's assignment
 *   Id)
 * @return {Promise.<Object[]>} QuizSubmission {@link https://canvas.instructure.com/doc/api/quiz_submissions.html}
 */
Quiz.listQuestionGrades = function (options) {
  // Request a new quiz report
  let reportId;
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/quizzes/${options.quizId}/reports`,
    method: 'POST',
    params: {
      'quiz_report[report_type]': 'student_analysis',
    },
  })
    .then((pendingReport) => {
      reportId = pendingReport.id;
      // Get a new copy of the report and include the progress
      return waitForCompletion({
        progress: {
          url: pendingReport.progress_url,
        },
        visitEndpoint: this.visitEndpoint,
      });
    })
    .then(() => {
      // Quiz report has been generated! Now, let's fetch it
      return this.visitEndpoint({
        path: `${prefix.v1}/courses/${options.courseId}/quizzes/${options.quizId}/reports/${reportId}`,
        method: 'GET',
        params: {
          include: ['file'],
        },
      });
    })
    .then((report) => {
      // Get the csv file (the report)
      return axios.get(report.file.url);
    })
    .then((reportCSV) => {
      if (reportCSV.data) {
        // We already have the body
        return Promise.resolve(reportCSV.data);
      }

      // The body didn't come through the first request. Canvas must be
      // sending us through their 2 redirects process
      return axios.get(reportCSV.res.headers.location)
        .then((response) => {
          return axios.get(response.res.headers.location);
        })
        .then((response) => {
          return Promise.resolve(response.text);
        });
    })
    .then((csvBody) => {
      // Process the CSV file
      const parsedCSV = parseCSV(csvBody, {
        skip_empty_lines: true,
      });
      // Enforce that we have a header row
      if (parsedCSV.length < 1) {
        // Not enough rows
        throw new CACCLError({
          message: 'Canvas responded with a quiz report csv file that did not have any rows.',
          code: errorCodes.quizReportNoRows,
        });
      }

      // Generate a map of the quiz questions
      const questions = [];
      const header = parsedCSV[0];
      const { firstQuestionCol } = reportColMap;
      const lastQuestionCol = (
        header.length + reportColMap.lastQuestionColOffset
      );
      for (let i = firstQuestionCol; i < lastQuestionCol; i += 2) {
        const titleCol = header[i];
        const pointsCol = header[i + 1];
        // Parse title column (format: "questionId: quizTitle")
        const titleDividerIndex = titleCol.indexOf(':');
        const questionId = parseInt(titleCol.substring(0, titleDividerIndex));
        const questionTitle = titleCol.substring(titleDividerIndex).trim();
        // Parse points column
        const pointsPossible = parseFloat(pointsCol);

        questions.push({
          pointsPossible,
          title: questionTitle,
          id: questionId,
          answerColIndex: i,
          pointsColIndex: i + 1,
        });
      }

      // Go through each student row and extract responses
      const processedReport = [];
      for (let i = 1; i < parsedCSV.length; i++) {
        const studentRow = parsedCSV[i];
        const reportItem = {};

        // Extract student metadata
        reportItem.name = studentRow[reportColMap.name];
        reportItem.id = parseInt(studentRow[reportColMap.id]);
        reportItem.sisId = studentRow[reportColMap.sisId];
        // Split out sections
        reportItem.sections = studentRow[reportColMap.section]
          .split(',')
          .map((section) => {
            return section.trim();
          });
        // Split section ids and parse them as ints
        reportItem.sectionIds = [];
        if (studentRow[reportColMap.sectionIds]) {
          reportItem.sectionIds = studentRow[reportColMap.sectionIds]
            .split(',')
            .map((section) => {
              return parseInt(section.trim());
            });
        }
        // Split section sis ids
        reportItem.sectionSISIds = [];
        if (studentRow[reportColMap.sectionSISIds]) {
          reportId.sectionSISIds = studentRow[reportColMap.sectionSISIds]
            .split(',')
            .map((section) => {
              return section.trim();
            });
        }
        // Turn submission timestamp into date object if possible
        const submittedTimestamp = studentRow[reportColMap.submittedAt];
        reportItem.submittedAt = (
          submittedTimestamp ? new Date(submittedTimestamp) : null
        );

        // Extract student totals
        reportItem.numCorrect = parseInt(
          studentRow[header.length + reportColMap.numCorrectOffset]
        );
        reportItem.numIncorrect = parseInt(
          studentRow[header.length + reportColMap.numIncorrectOffset]
        );
        reportItem.totalScore = parseFloat(
          studentRow[header.length + reportColMap.scoreOffset]
        );

        // Extract question response/score info
        reportItem.questions = {};
        questions.forEach((question) => {
          // Check if the user didn't submit this question
          const response = studentRow[question.answerColIndex] || null;
          let points = studentRow[question.pointsColIndex] || null;
          // Parse points as float
          if (points) {
            points = parseFloat(points);
          }
          // Save report item
          reportItem.questions[question.id] = {
            response,
            points,
          };
        });

        // Save reportItem
        processedReport.push(reportItem);
      }

      return Promise.resolve(processedReport);
    });
};
Quiz.listQuestionGrades.action = 'list quiz question grades for a specific quiz in a course';

/**
 * Updates the question grades for a specific submission to a quiz in a course
 * @version unstable
 * @author Gabriel Abrams
 * @method updateQuestionGrades
 * @memberof api.course.quiz
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to query
 * @param {number} options.quizId - Canvas quiz Id (not the quiz's assignment
 *   Id)
 * @param {number} options.submissionId - Canvas submission Id for a quiz
 * @param {number} [options.fudgePoints=current value] - The amount of
 *   positive/negative fudge points to apply to this submission
 * @param {object} [options.questions] - A map questionId => { score, comment }
 *   of the question score/comment updates
 * @param {number} [options.attempt=most recent] - The attempt to update grades
 *   for. If excluded, we pull the user's submission to get the attempt number
 * @return {Promise.<Object[]>} QuizSubmission {@link https://canvas.instructure.com/doc/api/quiz_submissions.html}
 */
Quiz.updateQuestionGrades = function (options) {
  // Get the current submission (so we can identify the attempt)
  let getAttempt;
  if (options.attempt !== undefined) {
    // Attempt was included. Just use that number
    getAttempt = Promise.resolve(options.attempt);
  } else {
    // Attempt was not included. We have to look up their most recent attempt
    getAttempt = this.api.course.quiz.getSubmission({
      courseId: options.courseId,
      quizId: options.quizId,
      submissionId: options.submissionId,
    })
      .then((submission) => {
        return Promise.resolve(submission.attempt);
      });
  }

  // Update question grades
  return getAttempt.then((attempt) => {
    // Create params object
    const params = {
      'quiz_submissions[][attempt]': attempt,
      'quiz_submissions[][fudge_points]':
        utils.includeIfNumber(options.fudgePoints),
    };
    // Add question values
    Object.keys(options.questions || {}).forEach((questionId) => {
      const { score, comment } = options.questions[questionId];
      if (score !== undefined) {
        params[`quiz_submissions[][questions][${questionId}][score]`] = score;
      }
      if (comment !== undefined) {
        params[`quiz_submissions[][questions][${questionId}][comment]`] = (
          comment
        );
      }
    });

    return this.visitEndpoint({
      params,
      path: `${prefix.v1}/courses/${options.courseId}/quizzes/${options.quizId}/submissions/${options.submissionId}`,
      method: 'PUT',
    })
      .then((response) => {
        return Promise.resolve(response.quiz_submissions[0]);
      });
  });
};
Quiz.updateQuestionGrades.action = 'update the question grades for a specific submission to a quiz in a course';

/*------------------------------------------------------------------------*/
/*                                 Export                                 */
/*------------------------------------------------------------------------*/

module.exports = Quiz;
