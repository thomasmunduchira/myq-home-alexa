const Alexa = require("alexa-sdk");
const config = require('./config');

const log = (title, message) => {
  console.log(`${title}:`, JSON.stringify(message));
};

const handlers = {
  'OpenIntent': function() {
    const parameters = this.event.request.intent.slots;
    const deviceName = parameters.deviceName.value;
    const pin = parameters.pin.value;
    log('opening', this.event);
    this.emit(':tell', 'Opening ' + deviceName + ' ' + pin);
  },
  'CloseIntent': function() {
    const parameters = this.event.request.intent.slots;
    const deviceName = parameters.deviceName.value;
    const pin = parameters.pin.value;
    log('closing', this.event);
    this.emit(':tell', 'Closing ' + deviceName + ' ' + pin);
  }
};

exports.handler = (event, context, callback) => {
  const alexa = Alexa.handler(event, context);
  alexa.appId = config.appId;
  alexa.registerHandlers(handlers);
  alexa.execute();
};
