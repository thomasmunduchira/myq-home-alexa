const Alexa = require('alexa-sdk');
const fs = require('fs');
const path = require('path');

const config = require('./config/config');

// loads all modules in handlers folder
const allHandlers = [];
fs.readdirSync(path.join(__dirname, 'handlers')).forEach(file => {
  const handler = require(path.join(__dirname, 'handlers', file));
  allHandlers.push(handler);
});

// concats all handlers into one object
const handlers = Object.assign({}, ...allHandlers);

// entry
exports.handler = (event, context, callback) => {
  // initializes application
  const alexa = Alexa.handler(event, context, callback);
  alexa.appId = config.appId;
  alexa.dynamoDBTableName = config.db.name;
  alexa.registerHandlers(handlers);
  alexa.execute();
};
