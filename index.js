const Alexa = require("alexa-sdk");
const config = require('./config');

const log = (title, message) => {
  console.log(`${title}:`, JSON.stringify(message));
};

const handlers = {
  'DoorOpenIntent': function() {
    const parameters = this.event.request.intent.slots;
    const doorName = parameters.doorName.value;
    const pin = parameters.pin.value;
    this.emit(':tell', 'Opening ' + doorName + ' ' + pin);
  },
  'DoorCloseIntent': function() {
    const parameters = this.event.request.intent.slots;
    const doorName = parameters.doorName.value;
    const pin = parameters.pin.value;
    this.emit(':tell', 'Closing ' + doorName + ' ' + pin);
  },
  'LightOnIntent': function() {
    const parameters = this.event.request.intent.slots;
    const lightName = parameters.lightName.value;
    this.emit(':tell', 'Turning on ' + lightName);
  },
  'LightOffIntent': function() {
    const parameters = this.event.request.intent.slots;
    const lightName = parameters.lightName.value;
    this.emit(':tell', 'Turning off ' + lightName);
  },
  'DoorQueryIntent': function() {
    const parameters = this.event.request.intent.slots;
    const doorName = parameters.doorName.value;
    this.emit(':tell', 'Querying door');
  },
  'LightQueryIntent': function() {
    const parameters = this.event.request.intent.slots;
    const lightName = parameters.lightName.value;
    this.emit(':tell', 'Querying light');
  },
  'ListDevicesIntent': function() {
    this.emit(':tell', 'Listing devices');
  },
  'ListDoorsIntent': function() {
    this.emit(':tell', 'Listing doors');
  },
  'ListLightsIntent': function() {
    this.emit(':tell', 'Listing lights');
  },
  'DiscoverDevicesIntent': function() {
    this.emit(':tell', 'Discovering devices');
  }
};

exports.handler = (event, context, callback) => {
  const alexa = Alexa.handler(event, context);
  alexa.appId = config.appId;
  alexa.dynamoDBTableName = config.db.name;
  alexa.registerHandlers(handlers);
  alexa.execute();
};
