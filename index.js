const Alexa = require("alexa-sdk");
const config = require('./config');

const log = (title, message) => {
  console.log(`${title}:`, JSON.stringify(message));
};

const handlers = {
  'HelloIntent': function() {
    this.emit(':tell', 'Hello World!');
  },
  'OpenIntent': function() {
    log('printing', this.event);
    this.emit(':tell', 'Hello ' + this.event.request.intent.slots.deviceName.value);
  },
  'CloseIntent': function() {
    this.emit(':tell', 'Hello World!');
  }
};

exports.handler = (event, context, callback) => {
  const alexa = Alexa.handler(event, context);
  alexa.appId = config.appId;
  alexa.registerHandlers(handlers);
  alexa.execute();
};
