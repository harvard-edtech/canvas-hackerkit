const fs = require('fs');
const path = require('path');
const CSVParser = require('papaparse');

const TYPES = {
  SHORT_RESPONSE: 'short-response',
  ESSAY_RESPONSE: 'essay_question',
  MULTIPLE_CHOICE: 'multiple-choice',
};

module.exports = {
  script: async (config) => {
    const {
      api,
      accessToken,
      canvasHost,
      enterToContinue,
      clearScreen,
      prompt,
      courseId,
      quit,
    } = config;

    console.log('To continue, please create/update the /data/quizToCreate.csv file:');
    console.log('- Add quiz title + description on the first row. Row: [title|description]');
    console.log('- Put each quiz question on its own row. Row: [points|question text]');
    console.log('- For multiple choice questions, add each answer below the question');
    console.log('   - Mark correct answer with ">". Row: [>|correct answer text]');
    console.log('   - Incorrect answers need no mark. Row: [ |incorrect answer text]');
    console.log('- For short response questions, just don\'t add any answers');
    console.log('\n');
    console.log('Example quizToCreate.csv file:');
    console.log('The first question is short response, the second is multiple choice');
    console.log('');
    console.log('|"""""|"""""""""""""""""""""""""""""""""""""|');
    console.log('| HW1 | Complete this in pairs during lab 1 |');
    console.log('|"""""|"""""""""""""""""""""""""""""""""""""|');
    console.log('|  3  | What did you learn in today\'s lab?  |');
    console.log('|"""""|"""""""""""""""""""""""""""""""""""""|');
    console.log('|  7  | What is the square root of 16?      |');
    console.log('|"""""|"""""""""""""""""""""""""""""""""""""|');
    console.log('|     | The sqrt is 5                       |');
    console.log('|"""""|"""""""""""""""""""""""""""""""""""""|');
    console.log('|  >  | The sqrt is 4                       |');
    console.log('|"""""|"""""""""""""""""""""""""""""""""""""|');
    console.log('|     | The sqrt is undefined               |');
    console.log('"""""""""""""""""""""""""""""""""""""""""""""');

    enterToContinue();

    // Read the file
    let quizToCreateTxt;
    try {
      const filename = path.join(__dirname, '../../data/quizToCreate.csv');
      quizToCreateTxt = fs.readFileSync(filename, 'utf-8');
    } catch (err) {
      console.log('We couldn\'t find the data/quizToCreate.csv file. Now quitting.');
      quit();
    }

    // Parse the CSV file
    let data;
    try {
      ({ data } = CSVParser.parse(quizToCreateTxt));
    } catch (err) {
      console.log('We couldn\'t parse your CSV. Please make sure it\'s formatted correctly. Now quitting.');
      quit();
    }

    // Make sure we have at least two rows
    if (data.length < 2) {
      console.log('Your csv must have at least 2 rows: one with [title,description] and at least one question row. Now quitting.');
      quit();
    }

    // Process the csv
    // First row
    const title = data[0][0];
    const description = data[0][1] || 'No description';
    // Process rest of rows
    const questions = [];
    let currentQuestion;
    for (let i = 1; i < data.length; i++) {
      const currRow = data[i];

      // Skip empty rows
      if (currRow.length < 2) {
        continue;
      }

      // Start new question if we found one
      if (!isNaN(currRow[0]) && currRow[0].trim().length > 0) {
        // Save previous question
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        // Start new question
        currentQuestion = {
          points: parseFloat(currRow[0]),
          text: currRow[1],
          type: TYPES.ESSAY_RESPONSE,
        };
      } else {
        if (!currentQuestion) {
          console.log('Oops! It looks like you forgot to add points to one of your questions. Now quitting.');
          quit();
        }
        // Continuing previous question (adding an answer)
        if (currentQuestion.type !== TYPES.MULTIPLE_CHOICE) {
          currentQuestion.type = TYPES.MULTIPLE_CHOICE;
          currentQuestion.answers = [];
        }

        currentQuestion.answers.push({
          isCorrect: currRow[0].trim() === '>',
          text: currRow[1],
        });
      }
    }

    if (!currentQuestion) {
      // No questions in csv
      console.log('We couldn\'t find any questions in your csv. Now quitting.');
      quit();
    } else {
      // Add the last question
      questions.push(currentQuestion);
    }

    // Create quiz in Canvas
    let quiz;
    api.course.quiz.create({
      courseId,
      title,
      description,
      published: false,
    })
      .then((quizObj) => {
        quiz = quizObj;
        // Add questions to quiz
        let quizQueue = Promise.resolve();
        questions.forEach((question) => {
          quizQueue = quizQueue.then(() => {
            if (question.type === TYPES.MULTIPLE_CHOICE) {
              return api.course.quiz.createMultipleChoiceQuestion({
                courseId,
                quizId: quiz.id,
                name: question.text,
                text: question.text,
                pointsPossible: question.points,
                answers: question.answers,
              });
            } else {
              return api.course.quiz.createEssayQuestion({
                courseId,
                quizId: quiz.id,
                name: question.text,
                text: question.text,
                pointsPossible: question.points,
              });
            }
          });
        });
        return quizQueue;
      })
      .then(() => {
        console.log(`\n\nDone! See the quiz here:\nhttps://${canvasHost}/courses/${courseId}/quizzes/${quiz.id}`);
      });

  },
  requiresCourse: true,
};
