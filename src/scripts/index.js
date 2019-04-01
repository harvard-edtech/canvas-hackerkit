const videoPageCreator = require('./video-page-creator');
const quizCreator = require('./quiz-creator.js');

// Map of scripts: title of script => script
module.exports = {
  'Batch Video Page Creator': videoPageCreator,
  'Quiz Creator': quizCreator,
};
