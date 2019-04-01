const utils = require('../../../common/utils.js');
const api = require('../../../common/genInstructorAPI.js')();
const environment = require('../../../environment.js');

const courseId = environment.testCourseId;

/*------------------------------------------------------------------------*/
/*                                 Helpers                                */
/*------------------------------------------------------------------------*/

// Create current time (rounded to nearest minute) for due/lock/unlockat times
const now = new Date(Math.round(Date.now() / 60000) * 60000);
const nowISO = now.toISOString().split('.')[0] + 'Z';
const stamp = Date.now();

// Generate the parameters for a test quiz
function genTestQuiz(index = 0) {
  return {
    courseId,
    title: `temporary_test_${index}_${stamp}`,
    description: 'this is a test quiz that was auto-generated and can be deleted if it is not deleted automatically',
    type: 'assignment',
    published: true,
    dueAt: now,
    allowedAttempts: 2,
    scoringPolicy: 'keep_highest',
    oneQuestionAtATime: true,
    cantGoBack: true,
    accessCode: '123',
    timeLimitMins: 5,
    shuffleAnswers: true,
    hideResults: 'until_after_last_attempt',
    showCorrectAnswersAfterLastAttempt: true,
  };
}

// Generate the parameters for a test quiz template
function genTestQuizTemplate(index = 0) {
  return {
    title: `temporary_test_${index}_${stamp}`,
    description: 'this is a test quiz that was auto-generated and can be deleted if it is not deleted automatically',
    quiz_type: 'assignment',
    published: true,
    due_at: nowISO,
    allowed_attempts: 2,
    scoring_policy: 'keep_highest',
    one_question_at_a_time: true,
    cant_go_back: true,
    access_code: '123',
    time_limit: 5,
    shuffle_answers: true,
  };
}

// Generate the parameters for a test quiz question
function genTestQuizQuestion(quizId, index = 0) {
  return {
    courseId,
    quizId,
    name: `multiple_choice_question_${index}`,
    text: `What are the units of g? ${index}`,
    pointsPossible: 10,
    answers: [
      {
        text: 'm/s',
        isCorrect: false,
        comment: 'wrong',
      },
      {
        text: 'm^2/s',
        isCorrect: false,
        comment: 'wrong',
      },
      {
        text: 'm/s^2',
        isCorrect: true,
        comment: 'wrong',
      },
    ],
  };
}

// Generate the parameters for a test quiz question template
function genTestQuizQuestionTemplate(index = 0) {
  return {
    question_name: `multiple_choice_question_${index}`,
    question_text: `What are the units of g? ${index}`,
    points_possible: 10,
  };
}

/*------------------------------------------------------------------------*/
/*                                  Tests                                 */
/*------------------------------------------------------------------------*/


describe('Endpoints > Course > Quizzes', function () {
  describe('Quizzes', function () {
    it('Lists quizzes', function () {
      // Create two quizzes so we can check if they show up in the list
      let quizzesToDelete;
      return Promise.all([
        api.course.quiz.create(genTestQuiz(0)),
        api.course.quiz.create(genTestQuiz(1)),
      ])
        .then((quizzes) => {
          quizzesToDelete = quizzes;
          // List the quizzes
          return api.course.quiz.list({
            courseId,
          });
        })
        .then((quizzes) => {
          // Make sure our test quizzes show up in the list
          const notFound = utils.missingTemplatesToString([
            genTestQuizTemplate(0),
            genTestQuizTemplate(1),
          ], quizzes);

          if (notFound) {
            throw new Error(`We could not find the following quizzes: ${notFound}`);
          }
          // Clean up: delete the gradebook columns
          return Promise.all(
            quizzesToDelete.map((quiz) => {
              return api.course.quiz.delete({
                courseId,
                quizId: quiz.id,
              })
                .catch((err) => {
                  throw new Error(`We finished the test successfully but couldn't clean up (delete gradebook column(s)). We ran into this error: ${err.message}`);
                });
            })
          );
        });
    });

    it('Gets a quiz', function () {
      // Create a quiz so we can get it
      let testQuizId;
      return api.course.quiz.create(genTestQuiz())
        .then((quiz) => {
          testQuizId = quiz.id;
          // Get the quiz
          return api.course.quiz.get({
            courseId,
            quizId: testQuizId,
          });
        })
        .then((quiz) => {
          const comparison = utils.checkTemplate(genTestQuizTemplate(), quiz);

          if (!comparison.isMatch) {
            throw new Error(`The quiz we got doesn't match what we expected:\n${comparison.description}`);
          }
          // Clean up: delete the quiz
          return api.course.quiz.delete({
            courseId,
            quizId: testQuizId,
          })
            .catch((err) => {
              throw new Error(`We completed the test successfully but ran into an error when cleaning up (deleting the test quiz(zes)): ${err.message}`);
            });
        });
    });

    it('Updates a quiz', function () {
      // Create a quiz so we can update it
      let testQuizId;
      return api.course.quiz.create(genTestQuiz())
        .then((quiz) => {
          testQuizId = quiz.id;
          // Update the quiz
          return api.course.quiz.update({
            courseId,
            quizId: testQuizId,
            suppressNotification: true,
            title: `new_title_${stamp}`,
            description: 'new_description',
            allowedAttempts: 10,
            scoringPolicy: 'keep_latest',
            accessCode: '321',
          });
        })
        .then(() => {
          // Get the quiz to make sure it was updated properly
          return api.course.quiz.get({
            courseId,
            quizId: testQuizId,
          });
        })
        .then((updatedQuiz) => {
          const comparison = utils.checkTemplate({
            title: `new_title_${stamp}`,
            description: 'new_description',
            quiz_type: 'assignment',
            published: true,
            due_at: nowISO,
            allowed_attempts: 10,
            scoring_policy: 'keep_latest',
            one_question_at_a_time: true,
            cant_go_back: true,
            access_code: '321',
            time_limit: 5,
            shuffle_answers: true,
          }, updatedQuiz);

          if (!comparison.isMatch) {
            throw new Error(`Updated quiz doesn't match what we expected:\n${comparison.description}`);
          }
          // Clean up: delete the quiz
          return api.course.quiz.delete({
            courseId,
            quizId: testQuizId,
          })
            .catch((err) => {
              throw new Error(`We completed the test successfully but ran into an error when cleaning up (deleting the test quiz(zes)): ${err.message}`);
            });
        });
    });

    it('Creates a quiz', function () {
      // Create a quiz
      let testQuizId;
      return api.course.quiz.create(genTestQuiz())
        .then((quiz) => {
          testQuizId = quiz.id;
          // Get the quiz to make sure it was created properly
          return api.course.quiz.get({
            courseId,
            quizId: testQuizId,
          });
        })
        .then((quiz) => {
          const comparison = utils.checkTemplate(genTestQuizTemplate(), quiz);

          if (!comparison.isMatch) {
            throw new Error(`Created quiz doesn't match what we expected:\n${comparison.description}`);
          }
          // Clean up: delete the quiz
          return api.course.quiz.delete({
            courseId,
            quizId: testQuizId,
          })
            .catch((err) => {
              throw new Error(`We completed the test successfully but ran into an error when cleaning up (deleting the test quiz(zes)): ${err.message}`);
            });
        });
    });

    it('Deletes a quiz', function () {
      // Create a quiz so we can delete it
      let testQuizId;
      return api.course.quiz.create(genTestQuiz())
        .then((quiz) => {
          testQuizId = quiz.id;
          // Delete the quiz
          return api.course.quiz.delete({
            courseId,
            quizId: testQuizId,
          });
        })
        .then(() => {
          // List the quizzes so we can make sure the quiz was deleted
          return api.course.quiz.list({
            courseId,
          });
        })
        .then((quizzes) => {
          if (utils.templateFound(genTestQuizTemplate(), quizzes)) {
            throw new Error('The quiz wasn\'t delete properly: it was still found in the list');
          }
        });
    });
  });

  describe('Submissions', function () {
    it('Lists quiz submissions', function () {
      // TODO: create submissions and check if they're in the list
      // (we can't do this until Canvas adds an enpoint that creates a sub)

      // Create a quiz so we can list its submissions
      let testQuizId;
      return api.course.quiz.create(genTestQuiz())
        .then((quiz) => {
          testQuizId = quiz.id;
          // List submissions
          return api.course.quiz.listSubmissions({
            courseId,
            quizId: testQuizId,
          });
        })
        .then((submissions) => {
          if (!submissions || submissions.length !== 0) {
            // Expected [] but got either no list or a list with submissions
            throw new Error(`We expected an empty list but got the following: ${JSON.stringify(submissions)}`);
          }
          // Clean up: delete the quiz
          return api.course.quiz.delete({
            courseId,
            quizId: testQuizId,
          });
        });
    });
  });

  describe('Questions', function () {
    it('Creates a multiple choice question', function () {
      // Create a quiz so we can add a question
      let testQuizId;
      return api.course.quiz.create(genTestQuiz())
        .then((quiz) => {
          testQuizId = quiz.id;
          // Create a new question
          return api.course.quiz.createMultipleChoiceQuestion(
            genTestQuizQuestion(testQuizId)
          );
        })
        .then(() => {
          // Get list of questions so we can make sure the question is there
          return api.course.quiz.listQuestions({
            courseId,
            quizId: testQuizId,
          });
        })
        .then((questions) => {
          // Make sure the question is in the list
          if (!utils.templateFound(genTestQuizQuestionTemplate(), questions)) {
            // Question not found
            throw new Error('Did not find the multiple question in the list.');
          }
          // Clean up: delete the quiz
          return api.course.quiz.delete({
            courseId,
            quizId: testQuizId,
          });
        });
    });

    it('Lists quiz questions', function () {
      // Create a quiz so we can add questions
      let testQuizId;
      return api.course.quiz.create(genTestQuiz())
        .then((quiz) => {
          testQuizId = quiz.id;
          // Create new questions so we can list them
          return Promise.all([
            api.course.quiz.createMultipleChoiceQuestion(
              genTestQuizQuestion(testQuizId, 0)
            ),
            api.course.quiz.createMultipleChoiceQuestion(
              genTestQuizQuestion(testQuizId, 1)
            ),
          ]);
        })
        .then(() => {
          // Get list of questions
          return api.course.quiz.listQuestions({
            courseId,
            quizId: testQuizId,
          });
        })
        .then((questions) => {
          // Make sure the list of questions includes both questions
          const notFound = utils.missingTemplatesToString([
            genTestQuizQuestionTemplate(0),
            genTestQuizQuestionTemplate(1),
          ], questions);

          if (notFound) {
            throw new Error(`We could not find the following quiz questions: \n${notFound}`);
          }
          // Clean up: delete the quiz
          return api.course.quiz.delete({
            courseId,
            quizId: testQuizId,
          });
        });
    });
  });

  // TODO: add test for quiz.getSubmission
  // (we can't do this until Canvas adds an enpoint that creates a sub)

  // TODO: add test for quiz.updateQuestionGrades
  // (we can't do this until Canvas adds an enpoint that creates a sub)
});
