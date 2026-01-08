const serverless = require('serverless-http');
const app = require('../../src/server');

// Wrap Express app with serverless-http
const handler = serverless(app);

module.exports.handler = async (event, context) => {
  // Keep connection alive for MongoDB
  context.callbackWaitsForEmptyEventLoop = false;
  
  // Log for debugging
  console.log('Netlify Function invoked:', event.path);
  
  return await handler(event, context);
};
