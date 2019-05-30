class CACCLError extends Error {
  constructor(options = {}) {
    super();

    this.message = options.message || 'An unknown error occurred.';
    this.name = options.name || 'CACCLError';
    this.code = String(options.code || 'NOCODE1').toUpperCase();
    this.stack = options.stack || new Error().stack;

    this.isCACCLError = true;
  }
}

module.exports = CACCLError;
