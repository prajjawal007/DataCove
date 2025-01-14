const app = require('..');
const serverless = require('serverless-http');

module.exports = serverless(app);
