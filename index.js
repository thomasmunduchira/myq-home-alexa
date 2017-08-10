const Alexa = require('alexa-sdk');
const request = require('request-promise-native');
const config = require('./config');

const log = (title, message) => {
  console.log(`**** ${title}:`, JSON.stringify(message));
};

const handlers = {
  'NotLinked': function() {
    log('NotLinked', this.event);
    const speech = 'Please go to your Alexa app and link your account';
    this.emit(':askWithLinkAccountCard', speech, speech);
  },
  'IncorrectCredentials': function() {
    log('IncorrectCredentials', this.event);
    const speech = 'Your credentials have expired. Please go to your Alexa app and link your account again';
    this.emit(':askWithLinkAccountCard', speech, speech);
  },
  'DoorOpenIntent': function() {
    log('DoorOpenIntent', this.event);
    if (!this.event.session.user.accessToken) {
      this.emit('NotLinked');
    }
    const parameters = this.event.request.intent.slots;
    const doorName = parameters.doorName.value;
    const pin = parameters.pin.value;
    this.emit(':tell', 'Opening ' + doorName + ' ' + pin);
  },
  'DoorCloseIntent': function() {
    log('DoorCloseIntent', this.event);
    if (!this.event.session.user.accessToken) {
      this.emit('NotLinked');
    }
    const parameters = this.event.request.intent.slots;
    const doorName = parameters.doorName.value;
    this.emit(':tell', 'Closing ' + doorName);
  },
  'LightOnIntent': function() {
    log('LightOnIntent', this.event);
    if (!this.event.session.user.accessToken) {
      this.emit('NotLinked');
    }
    const parameters = this.event.request.intent.slots;
    const lightName = parameters.lightName.value;
    this.emit(':tell', 'Turning on ' + lightName);
  },
  'LightOffIntent': function() {
    log('LightOffIntent', this.event);
    if (!this.event.session.user.accessToken) {
      this.emit('NotLinked');
    }
    const parameters = this.event.request.intent.slots;
    const lightName = parameters.lightName.value;
    this.emit(':tell', 'Turning off ' + lightName);
  },
  'DoorQueryIntent': function() {
    log('DoorQueryIntent', this.event);
    if (!this.event.session.user.accessToken) {
      this.emit('NotLinked');
    }
    const parameters = this.event.request.intent.slots;
    const doorName = parameters.doorName.value;
    this.emit(':tell', 'Querying door');
  },
  'LightQueryIntent': function() {
    log('LightQueryIntent', this.event);
    if (!this.event.session.user.accessToken) {
      this.emit('NotLinked');
    }
    const parameters = this.event.request.intent.slots;
    const lightName = parameters.lightName.value;
    this.emit(':tell', 'Querying light');
  },
  'ListDevicesIntent': function() {
    log('ListDevicesIntent', this.event);
    if (!this.event.session.user.accessToken) {
      this.emit('NotLinked');
    }
    const parameters = this.event.request.intent.slots;
    this.emit(':tell', 'Listing devices');
  },
  'ListDoorsIntent': function() {
    log('ListDoorsIntent', this.event);
    if (!this.event.session.user.accessToken) {
      this.emit('NotLinked');
    }
    const parameters = this.event.request.intent.slots;
    this.emit(':tell', 'Listing doors');
  },
  'ListLightsIntent': function() {
    log('ListLightsIntent', this.event);
    if (!this.event.session.user.accessToken) {
      this.emit('NotLinked');
    }
    const parameters = this.event.request.intent.slots;
    this.emit(':tell', 'Listing lights');
  },
  'DiscoverDevicesIntent': function() {
    log('DiscoverDevicesIntent', this.event);
    if (!this.event.session.user.accessToken) {
      this.emit('NotLinked');
    }
    const parameters = this.event.request.intent.slots;
    this.emit(':tell', 'Discovering devices');
  },
  'AMAZON.HelpIntent': function() {
    log('AMAZON.HelpIntent', this.event);
    const speech = 'You can tell me to discover your devices, after which you can ask about and change the state of a device';
    this.emit(':ask', speech, speech);
  },
  'AMAZON.StopIntent': function() {
    log('AMAZON.StopIntent', this.event);
    this.emit('SessionEndedRequest');
  },
  'AMAZON.CancelIntent': function() {
    log('AMAZON.CancelIntent', this.event);
    this.emit('SessionEndedRequest');
  },
  'SessionEndedRequest':function() {
    log('SessionEndedRequest', this.event);
    this.attributes.endedSessionCount += 1;
    this.emit(':saveState', true);
    this.emit(':tell', 'Goodbye!');
  },
  'Unhandled': function() {
    log('Unhandled', this.event);
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
