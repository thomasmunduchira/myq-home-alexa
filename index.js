const Alexa = require('alexa-sdk');
const config = require('./config');

const log = (title, message) => {
  console.log(`${title}:`, JSON.stringify(message));
};

const handlers = {
  'DoorOpenIntent': function() {
    const parameters = this.event.request.intent.slots;
    const doorName = parameters.doorName.value;
    const pin = parameters.pin.value;
    log('DoorOpenIntent', parameters);
    this.emit(':tell', 'Opening ' + doorName + ' ' + pin);
  },
  'DoorCloseIntent': function() {
    const parameters = this.event.request.intent.slots;
    const doorName = parameters.doorName.value;
    const pin = parameters.pin.value;
    log('DoorCloseIntent', parameters);
    this.emit(':tell', 'Closing ' + doorName + ' ' + pin);
  },
  'LightOnIntent': function() {
    const parameters = this.event.request.intent.slots;
    const lightName = parameters.lightName.value;
    log('LightOnIntent', parameters);
    this.emit(':tell', 'Turning on ' + lightName);
  },
  'LightOffIntent': function() {
    const parameters = this.event.request.intent.slots;
    const lightName = parameters.lightName.value;
    log('LightOffIntent', parameters);
    this.emit(':tell', 'Turning off ' + lightName);
  },
  'DoorQueryIntent': function() {
    const parameters = this.event.request.intent.slots;
    const doorName = parameters.doorName.value;
    log('DoorQueryIntent', parameters);
    this.emit(':tell', 'Querying door');
  },
  'LightQueryIntent': function() {
    const parameters = this.event.request.intent.slots;
    const lightName = parameters.lightName.value;
    log('LightQueryIntent', parameters);
    this.emit(':tell', 'Querying light');
  },
  'ListDevicesIntent': function() {
    const parameters = this.event.request.intent.slots;
    log('ListDevicesIntent', parameters);
    this.emit(':tell', 'Listing devices');
  },
  'ListDoorsIntent': function() {
    const parameters = this.event.request.intent.slots;
    log('ListDoorsIntent', parameters);
    this.emit(':tell', 'Listing doors');
  },
  'ListLightsIntent': function() {
    const parameters = this.event.request.intent.slots;
    log('ListLightsIntent', parameters);
    this.emit(':tell', 'Listing lights');
  },
  'DiscoverDevicesIntent': function() {
    const parameters = this.event.request.intent.slots;
    log('DiscoverDevicesIntent', parameters);
    this.emit(':tell', 'Discovering devices');
  },
  'AMAZON.HelpIntent': function() {
    log('AMAZON.HelpIntent', {});
    const speech = 'You can tell me to discover your devices, after which you can ask about and change the state of a device';
    this.emit(':ask', speech, speech);
  },
  'AMAZON.StopIntent': function() {
    log('AMAZON.StopIntent', {});
    this.emit('SessionEndedRequest');
  },
  'AMAZON.CancelIntent': function() {
    log('AMAZON.CancelIntent', {});
    this.emit('SessionEndedRequest');
  },
  'SessionEndedRequest':function() {
    log('SessionEndedRequest', {});
    this.attributes.endedSessionCount += 1;
    this.emit(':saveState', true);
    this.emit(':tell', 'Goodbye!');
  },
  'Unhandled': function() {
    log('Unhandled', {});
    this.emit(':tell', 'Sorry, I was unable to understand your request. Please try again.');
    this.emit('SessionEndedRequest');
  }
};

exports.handler = (event, context, callback) => {
  const alexa = Alexa.handler(event, context);
  alexa.appId = config.appId;
  alexa.dynamoDBTableName = config.db.name;
  alexa.registerHandlers(handlers);
  alexa.execute();
};
