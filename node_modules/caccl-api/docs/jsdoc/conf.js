const path = require('path');

module.exports = {
  recurseDepth: 10,
  plugins: ['plugins/markdown'],
  source: {
    include: [
      path.join(__dirname, '../..'),
    ],
    exclude: [
      path.join(__dirname, '../../node_modules'),
    ],
  },
};
