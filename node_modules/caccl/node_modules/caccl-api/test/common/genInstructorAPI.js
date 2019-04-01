const API = require('../../index.js');
const environment = require('../environment.js');

module.exports = (config = {}) => {
  const newConfig = config;
  newConfig.accessToken = config.accessToken || environment.accessToken;
  newConfig.canvasHost = config.canvasHost || environment.canvasHost;
  return new API(newConfig);
};
