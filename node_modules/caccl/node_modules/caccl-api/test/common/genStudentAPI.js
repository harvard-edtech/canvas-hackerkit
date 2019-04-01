const API = require('../../index.js');
const environment = require('../environment.js');

module.exports = (index) => {
  return new API({
    accessToken: environment.students[index || 0].accessToken,
    canvasHost: environment.canvasHost,
  });
};
