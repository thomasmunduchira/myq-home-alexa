const Alexa = require('alexa-sdk');
const request = require('request-promise-native');
const config = require('./config');

const log = (title, message) => {
  console.log(`**** ${title}:`, JSON.stringify(message));
};

const getDoors = (devices) => {
  if (!devices) {
    return false;
  }
  const doors = [];
  for (let i = 0; i < devices.length; i++) {
    const device = devices[i];
    if (device.typeId !== 3) {
      doors.push(device);
    }
  }
  return doors;
};

const getLights = (devices) => {
  if (!devices) {
    return false;
  }
  const lights = [];
  for (let i = 0; i < devices.length; i++) {
    const device = devices[i];
    if (device.typeId === 3) {
      lights.push(device);
    }
  }
  return lights;
};

const describeDevices = (devices, singularName, pluralName) => {
  let speech = "";
  if (devices.length === 0) {
    return speech;
  } else if (devices.length === 1) {
    speech += `Your ${singularName} is called ${devices[0].name}.`;
    return speech;
  }
  speech += `Your ${pluralName} are called ${devices[0].name}`;
  for (var i = 1; i < devices.length; i++) {
    const device = devices[i];
    speech += `, ${device.name}`
  }
  speech += '.';
  return speech;
};

const listDevices = (devices) => {
  const doors = getDoors(devices);
  const descriptionDoors = describeDevices(doors, 'door', 'doors');
  const lights = getLights(devices);
  const descriptionLights = describeDevices(lights, 'light', 'lights');
  const speech = `You have ${devices.length} ${devices.length === 1 ? 'device' : 'devices'}, ${doors.length} ${doors.length === 1 ? 'door' : 'doors'} and ${lights.length} ${lights.length === 1 ? 'light' : 'lights'}. ${descriptionDoors} ${descriptionLights}`;
  return speech;
};

const listDoors = (doors) => {
  const descriptionDoors = describeDevices(doors, 'door', 'doors');
  const speech = `You have ${doors.length} ${doors.length === 1 ? 'door' : 'doors'}. ${descriptionDoors}`;
  return speech;
};

const listLights = (lights) => {
  const descriptionLights = describeDevices(lights, 'light', 'lights');
  const speech = `You have ${lights.length} ${lights.length === 1 ? 'light' : 'lights'}. ${descriptionLights}`;
  return speech;
};

const handlers = {
  'LaunchRequest': function() {
    const devices = this.attributes.devices;
    const hasDevices = devices && devices.length > 0;
    let speech = 'Welcome to MyQ Home. ';
    if (hasDevices) {
      speech += 'Ask about or change the state of a device.';
    } else {
      speech += 'Ask me to discover your devices, after which you can ask about or change the state of a device.'
    }
    this.emit(':ask', speech, speech);
  },
  'NotLinked': function() {
    log('NotLinked', this.event);
    this.emit(':tellWithLinkAccountCard', 'Please go to your Alexa app and link your account');
  },
  'IncorrectCredentials': function() {
    log('IncorrectCredentials', this.event);
    this.emit(':tellWithLinkAccountCard', 'Your credentials have expired. Please go to your Alexa app and link your account again');
  },
  'NoDiscoveredDevices': function() {
    log('NoDiscoveredDevices', this.event);
    this.emit(':ask', 'Please discover devices first and try again');
  },
  'DoorOpenIntent': function() {
    log('DoorOpenIntent', this.event);
    const accessToken = this.event.session.user.accessToken;
    if (!accessToken) {
      this.emit('NotLinked');
    }
    const parameters = this.event.request.intent.slots;
    const doorName = parameters.doorName.value;
    const pin = parameters.pin.value;
    if (!pin) {
      this.emit(':ask', 'You did not provide a pin.');
    }
    const doors = getDoors(this.attributes.devices);
    if (!doors || doors.length === 0) {
      this.emit('NoDiscoveredDevices');
    }
    this.emit(':tell', 'Opening ' + doorName + ' ' + pin);
  },
  'DoorCloseIntent': function() {
    log('DoorCloseIntent', this.event);
    const accessToken = this.event.session.user.accessToken;
    if (!accessToken) {
      this.emit('NotLinked');
    }
    const parameters = this.event.request.intent.slots;
    const doorName = parameters.doorName.value;
    const doors = getDoors(this.attributes.devices);
    if (!doors || doors.length === 0) {
      this.emit('NoDiscoveredDevices');
    }
    this.emit(':tell', 'Closing ' + doorName);
  },
  'LightOnIntent': function() {
    log('LightOnIntent', this.event);
    const accessToken = this.event.session.user.accessToken;
    if (!accessToken) {
      this.emit('NotLinked');
    }
    const parameters = this.event.request.intent.slots;
    const lightName = parameters.lightName.value;
    const lights = getLights(this.attributes.devices);
    if (!lights || lights.length === 0) {
      this.emit('NoDiscoveredDevices');
    }
    this.emit(':tell', 'Turning on ' + lightName);
  },
  'LightOffIntent': function() {
    log('LightOffIntent', this.event);
    const accessToken = this.event.session.user.accessToken;
    if (!accessToken) {
      this.emit('NotLinked');
    }
    const parameters = this.event.request.intent.slots;
    const lightName = parameters.lightName.value;
    const lights = getLights(this.attributes.devices);
    if (!lights || lights.length === 0) {
      this.emit('NoDiscoveredDevices');
    }
    this.emit(':tell', 'Turning off ' + lightName);
  },
  'DoorQueryIntent': function() {
    log('DoorQueryIntent', this.event);
    const accessToken = this.event.session.user.accessToken;
    if (!accessToken) {
      this.emit('NotLinked');
    }
    const parameters = this.event.request.intent.slots;
    const doorName = parameters.doorName.value;
    const doors = getDoors(this.attributes.devices);
    if (!doors || doors.length === 0) {
      this.emit('NoDiscoveredDevices');
    }
    this.emit(':tell', 'Querying door');
  },
  'LightQueryIntent': function() {
    log('LightQueryIntent', this.event);
    const accessToken = this.event.session.user.accessToken;
    if (!accessToken) {
      this.emit('NotLinked');
    }
    const parameters = this.event.request.intent.slots;
    const lightName = parameters.lightName.value;
    const lights = getLights(this.attributes.devices);
    if (!lights || lights.length === 0) {
      this.emit('NoDiscoveredDevices');
    }
    this.emit(':tell', 'Querying light');
  },
  'ListDevicesIntent': function() {
    log('ListDevicesIntent', this.event);
    const devices = this.attributes.devices;
    if (!devices) {
      this.emit('NoDiscoveredDevices');
    }
    this.emit(':tell', listDevices(devices));
  },
  'ListDoorsIntent': function() {
    log('ListDoorsIntent', this.event);
    const doors = getDoors(this.attributes.devices);
    if (!doors) {
      this.emit('NoDiscoveredDevices');
    }
    this.emit(':tell', listDoors(doors));
  },
  'ListLightsIntent': function() {
    log('ListLightsIntent', this.event);
    const lights = getLights(this.attributes.devices);
    if (!lights) {
      this.emit('NoDiscoveredDevices');
    }
    this.emit(':tell', listLights(lights));
  },
  'DiscoverDevicesIntent': function() {
    log('DiscoverDevicesIntent', this.event);
    const accessToken = this.event.session.user.accessToken;
    if (!accessToken) {
      this.emit('NotLinked');
    }
    const parameters = this.event.request.intent.slots;
    return request({
      method: 'GET',
      uri: `${config.endpoint}/devices`,
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      json: true
    }).then((result) => {
      const { returnCode, devices, error } = result;
      let index = 1;
      if (returnCode === 0) {
        for (let i = devices.length - 1; i >= 0; i--) {
          const device = devices[i];
          if (!device.id) {
            devices.splice(i, 1);
          } else if (!device.name) {
            device.name = `Device ${index}`;
            index++;
          }
        }
        this.attributes.devices = devices;
        this.emit(':tell', `Discovery is complete. ${listDevices(devices)}`);
      }
    });
  },
  'AMAZON.HelpIntent': function() {
    log('AMAZON.HelpIntent', this.event);
    const speech = 'You can ask me to discover your devices, after which you can ask about or change the state of a device.';
    this.emit(':ask', speech);
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
