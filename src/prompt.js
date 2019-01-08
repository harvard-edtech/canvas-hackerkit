const prompt = require('prompt-sync')();

const promptWithQuit = (config) => {
  let { title, optional } = config;

  if (typeof config === 'string') {
    title = config;
  }

  const val = prompt(title, config.default);
  if (!config.optional && val === null) {
    process.exit(0);
  }
  return val;
}

// Asks for input and quits if config.optional is not true and nothing is
// returned
module.exports = promptWithQuit;
