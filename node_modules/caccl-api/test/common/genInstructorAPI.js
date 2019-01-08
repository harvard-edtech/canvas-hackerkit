const API = require('../../index.js');
const environment = require('../environment.js');

module.exports = (config = {}) => {
  const newConfig = config;
  newConfig.accessToken = environment.accessToken;
  newConfig.canvasHost = environment.canvasHost;
  return new API(newConfig);
};
