const Alexa = require('alexa-sdk');
const request = require('request-promise-native');
const levenshtein = require('fast-levenshtein');

const config = require('./config');

const log = (title, message) => {
  console.log(`**** ${title}:`, JSON.stringify(message));
};

const getClosestDevice = (name, devices) => {
  let minimumDistance = Number.MAX_VALUE;
  let closestDevice = null;
  name = name.replace(/\s/g, '').toLowerCase();
  for (let i = 0; i < devices.length; i++) {
    const device = devices[i];
    const deviceName = device.name.replace(/\s/g, '').toLowerCase();
    const distance = levenshtein.get(name, deviceName);
    if (distance < minimumDistance) {
      minimumDistance = distance;
      closestDevice = device;
    }
  }
  console.log(name, minimumDistance, closestDevice.name, devices);
  return closestDevice;
}

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
  for (let i = 1; i < devices.length; i++) {
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

const getState = (accessToken, device) => {
  let type;
  if (device.typeId === 3) {
    type = 'light';
  } else {
    type = 'door';
  }

  return request({
    method: 'GET',
    uri: `${config.endpoint}/${type}/state`,
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    qs: {
      id: device.id
    },
    json: true
  }).then((result) => {
    log('getState result', result);
    return result;
  }).catch((err) => {
    log('getState - Error', err);
  });
};

const setState = (accessToken, device, state, pin) => {
  let type;
  if (device.typeId === 3) {
    type = 'light';
  } else {
    type = 'door';
  }

  return request({
    method: 'PUT',
    uri: `${config.endpoint}/${type}/state`,
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: {
      id: device.id,
      state,
      pin
    },
    json: true
  }).then((result) => {
    log('setState result', result);
    return result;
  }).catch((err) => {
    log('setState - Error', err);
  });
};

const discoverDevices = (accessToken) => {
  return request({
    method: 'GET',
    uri: `${config.endpoint}/devices`,
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    json: true
  }).then((result) => {
    log('discoverDevices result', result);
    return result;
  }).catch((err) => {
    log('discoverDevices - Error', err);
  });
};

const handlers = {
  'emit': function(parameters) {
    const { type, message1, message2 } = parameters;
    if (message2) {
      log(`Emitting ${type}: ${message1}, ${message2}`, {});
      return this.emit(`${type}`, message1, message2);
    }
    log(`Emitting ${type}: ${message1}`, {});
    return this.emit(`${type}`, message1);
  },
  'LaunchRequest': function() {
    log('LaunchRequest', this.event);
    const devices = this.attributes.devices;
    const hasDevices = devices && devices.length > 0;
    let speech = 'Welcome to MyQ Home. ';
    if (hasDevices) {
      speech += 'Ask about or change the state of a device.';
    } else {
      speech += 'Ask me to discover your devices, after which you can ask about or change the state of a device.';
    }
    return this.emit('emit', {
      type: ':ask',
      message1: speech,
      message2: speech
    });
  },
  'NotLinked': function() {
    log('NotLinked', this.event);
    return this.emit('emit', {
      type: ':tellWithLinkAccountCard',
      message1: 'Your MyQ account is not linked. Please go to your Alexa app and link your account'
    });
  },
  'IncorrectCredentials': function() {
    log('IncorrectCredentials', this.event);
    return this.emit('emit', {
      type: ':tellWithLinkAccountCard',
      message1: 'Your MyQ account credentials have changed. Please go to your Alexa app and link your account again'
    });
  },
  'NoPinEstablished': function() {
    log('NoPinEstablished', this.event);
    return this.emit('emit', {
      type: ':tellWithLinkAccountCard',
      message1: 'You do not have a pin established. Please go to your Alexa app and relink your MyQ account with a pin'
    });
  },
  'NoPinProvided': function() {
    log('NoPinProvided', this.event);
    return this.emit('emit', {
      type: ':ask',
      message1: 'You did not provide a pin'
    });
  },
  'IncorrectPin': function() {
    log('IncorrectPin', this.event);
    return this.emit('emit', {
      type: ':ask',
      message1: 'You have provided an incorrect pin. If you forgot your pin, please go to your Alexa app and relink your MyQ account'
    });
  },
  'NoDiscoveredDevices': function(type) {
    log('NoDiscoveredDevices', this.event);
    return this.emit('emit', {
      type: ':ask',
      message1: `You do not have any ${type} discovered. Ask me to discover devices and try again`
    });
  },
  'NoDeviceNameProvided': function() {
    log('NoDeviceNameProvided', this.event);
    return this.emit('emit', {
      type: ':ask',
      message1: 'You did not provide a device name'
    });
  },
  'IncorrectDeviceName': function() {
    log('IncorrectDeviceName', this.event);
    return this.emit('emit', {
      type: ':ask',
      message1: 'A device by that name was not found'
    });
  },
  'MyQServiceDown': function() {
    log('MyQServiceDown', this.event);
    return this.emit('emit', {
      type: ':tell',
      message1: 'The MyQ service is currently down. Please wait for a bit and try again.'
    });
  },
  'ErrorHandler': function(result) {
    if (result.returnCode === 14) {
      return this.emit('IncorrectCredentials');
    } else if (result.returnCode === 20) {
      return this.emit('NoPinEstablished');
    } else if (result.returnCode === 21) {
      return this.emit('NoPinProvided');
    } else if (result.returnCode === 22) {
      return this.emit('IncorrectPin');
    }

    return this.emit('MyQServiceDown');
  },
  'DoorOpenIntent': function() {
    log('DoorOpenIntent', this.event);
    const accessToken = this.event.session.user.accessToken;
    if (!accessToken) {
      return this.emit('NotLinked');
    }
    const parameters = this.event.request.intent.slots;
    const doorName = parameters.doorName.value;
    if (!doorName) {
      return this.emit('NoDeviceNameProvided');
    }
    let pin = parameters.pin.value;
    if (!pin || pin === '?') {
      return this.emit('NoPinProvided');
    }
    pin = parseFloat(pin);
    const doors = getDoors(this.attributes.devices);
    if (!doors || doors.length === 0) {
      return this.emit('NoDiscoveredDevices', 'doors');
    }
    const door = getClosestDevice(doorName, doors);
    if (!door) {
      return this.emit('IncorrectDeviceName');
    }
    return setState(accessToken, door, 1, pin)
      .then((result) => {
        log('setStateResult', result);
        if (result.returnCode !== 0) {
          return this.emit('ErrorHandler', result);
        }
        return this.emit('emit', {
          type: ':tell',
          message1: `Opening ${door.name}`
        });
      }).catch((err) => {
        log('DoorOpenIntent - Error', err);
      });
  },
  'DoorCloseIntent': function() {
    log('DoorCloseIntent', this.event);
    const accessToken = this.event.session.user.accessToken;
    if (!accessToken) {
      return this.emit('NotLinked');
    }
    const parameters = this.event.request.intent.slots;
    const doorName = parameters.doorName.value;
    if (!doorName) {
      return this.emit('NoDeviceNameProvided');
    }
    const doors = getDoors(this.attributes.devices);
    if (!doors || doors.length === 0) {
      return this.emit('NoDiscoveredDevices', 'doors');
    }
    const door = getClosestDevice(doorName, doors);
    if (!door) {
      return this.emit('IncorrectDeviceName');
    }
    return setState(accessToken, door, 0)
      .then((result) => {
        log('setStateResult', result);
        if (result.returnCode !== 0) {
          return this.emit('ErrorHandler', result);
        }
        return this.emit('emit', {
          type: ':tell',
          message1: `Closing ${door.name}`
        });
      }).catch((err) => {
        log('DoorCloseIntent - Error', err);
      });
  },
  'LightOnIntent': function() {
    log('LightOnIntent', this.event);
    const accessToken = this.event.session.user.accessToken;
    if (!accessToken) {
      return this.emit('NotLinked');
    }
    const parameters = this.event.request.intent.slots;
    const lightName = parameters.lightName.value;
    if (!lightName) {
      return this.emit('NoDeviceNameProvided');
    }
    const lights = getLights(this.attributes.devices);
    if (!lights || lights.length === 0) {
      return this.emit('NoDiscoveredDevices', 'lights');
    }
    const light = getClosestDevice(lightName, lights);
    if (!light) {
      return this.emit('IncorrectDeviceName');
    }
    return setState(accessToken, light, 1)
      .then((result) => {
        log('setStateResult', result);
        if (result.returnCode !== 0) {
          return this.emit('ErrorHandler', result);
        }
        return this.emit('emit', {
          type: ':tell',
          message1: 'Okay'
        });
      }).catch((err) => {
        log('LightOnIntent - Error', err);
      });
  },
  'LightOffIntent': function() {
    log('LightOffIntent', this.event);
    const accessToken = this.event.session.user.accessToken;
    if (!accessToken) {
      return this.emit('NotLinked');
    }
    const parameters = this.event.request.intent.slots;
    const lightName = parameters.lightName.value;
    if (!lightName) {
      return this.emit('NoDeviceNameProvided');
    }
    const lights = getLights(this.attributes.devices);
    if (!lights || lights.length === 0) {
      return this.emit('NoDiscoveredDevices', 'lights');
    }
    const light = getClosestDevice(lightName, lights);
    if (!light) {
      return this.emit('IncorrectDeviceName');
    }
    return setState(accessToken, light, 0)
      .then((result) => {
        log('setStateResult', result);
        if (result.returnCode !== 0) {
          return this.emit('ErrorHandler', result);
        }
        return this.emit('emit', {
          type: ':tell',
          message1: 'Okay'
        });
      }).catch((err) => {
        log('LightOffIntent - Error', err);
      });
  },
  'DoorQueryIntent': function() {
    log('DoorQueryIntent', this.event);
    const accessToken = this.event.session.user.accessToken;
    if (!accessToken) {
      return this.emit('NotLinked');
    }
    const parameters = this.event.request.intent.slots;
    const doorName = parameters.doorName.value;
    if (!doorName) {
      return this.emit('NoDeviceNameProvided');
    }
    const doors = getDoors(this.attributes.devices);
    if (!doors || doors.length === 0) {
      return this.emit('NoDiscoveredDevices', 'doors');
    }
    const door = getClosestDevice(doorName, doors);
    if (!door) {
      return this.emit('IncorrectDeviceName');
    }
    return getState(accessToken, door)
      .then((result) => {
        if (result.returnCode !== 0) {
          return this.emit('ErrorHandler', result);
        }
        return this.emit('emit', {
          type: ':tell',
          message1: `${door.name} is ${result.doorStateDescription}`
        });
      }).catch((err) => {
        log('DoorQueryIntent - Error', err);
      });
  },
  'LightQueryIntent': function() {
    log('LightQueryIntent', this.event);
    const accessToken = this.event.session.user.accessToken;
    if (!accessToken) {
      return this.emit('NotLinked');
    }
    const parameters = this.event.request.intent.slots;
    const lightName = parameters.lightName.value;
    if (!lightName) {
      return this.emit('NoDeviceNameProvided');
    }
    const lights = getLights(this.attributes.devices);
    if (!lights || lights.length === 0) {
      return this.emit('NoDiscoveredDevices', 'lights');
    }
    const light = getClosestDevice(lightName, lights);
    if (!light) {
      return this.emit('IncorrectDeviceName');
    }
    return getState(accessToken, light)
      .then((result) => {
        if (result.returnCode !== 0) {
          return this.emit('ErrorHandler', result);
        }
        return this.emit('emit', {
          type: ':tell',
          message1: `${light.name} is ${result.lightStateDescription}`
        });
      }).catch((err) => {
        log('LightQueryIntent - Error', err);
      });
  },
  'ListDevicesIntent': function() {
    log('ListDevicesIntent', this.event);
    const devices = this.attributes.devices;
    if (!devices || devices.length === 0) {
      return this.emit('NoDiscoveredDevices', 'devices');
    }
    return this.emit('emit', {
      type: ':tell',
      message1: listDevices(devices)
    });
  },
  'ListDoorsIntent': function() {
    log('ListDoorsIntent', this.event);
    const doors = getDoors(this.attributes.devices);
    if (!doors || doors.length === 0) {
      return this.emit('NoDiscoveredDevices', 'doors');
    }
    return this.emit('emit', {
      type: ':tell',
      message1: listDoors(doors)
    });
  },
  'ListLightsIntent': function() {
    log('ListLightsIntent', this.event);
    const lights = getLights(this.attributes.devices);
    if (!lights || lights.length === 0) {
      return this.emit('NoDiscoveredDevices', 'lights');
    }
    return this.emit('emit', {
      type: ':tell',
      message1: listLights(lights)
    });
  },
  'DiscoverDevicesIntent': function() {
    log('DiscoverDevicesIntent', this.event);
    const accessToken = this.event.session.user.accessToken;
    if (!accessToken) {
      return this.emit('NotLinked');
    }
    return discoverDevices(accessToken)
      .then((result) => {
        const { returnCode, devices, error } = result;
        if (returnCode !== 0) {
          return this.emit('ErrorHandler', result);
        }
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
          return this.emit('emit', {
            type: ':tell',
            message1: `Discovery is complete. ${listDevices(devices)}`
          });
        }
      }).catch((err) => {
        log('DiscoverDevicesIntent - Error', err);
      });
  },
  'AMAZON.HelpIntent': function() {
    log('AMAZON.HelpIntent', this.event);
    const speech = 'You can ask me to discover your devices, after which you can ask about or change the state of a device.';
    return this.emit('emit', {
      type: ':ask',
      message1: speech
    });
  },
  'AMAZON.StopIntent': function() {
    log('AMAZON.StopIntent', this.event);
    return this.emit('SessionEndedRequest');
  },
  'AMAZON.CancelIntent': function() {
    log('AMAZON.CancelIntent', this.event);
    return this.emit('SessionEndedRequest');
  },
  'SessionEndedRequest':function() {
    log('SessionEndedRequest', this.event);
    this.emit(':saveState', true);
    return this.emit('emit', {
      type: ':tell',
      message1: 'Goodbye!'
    });
  },
  'Unhandled': function() {
    log('Unhandled', this.event);
    this.emit('emit', {
      type: ':tell',
      message1: 'Sorry, I was unable to understand your request. Please try again.'
    });
    return this.emit('SessionEndedRequest');
  }
};

exports.handler = (event, context, callback) => {
  const alexa = Alexa.handler(event, context);
  alexa.appId = config.appId;
  alexa.dynamoDBTableName = config.db.name;
  alexa.registerHandlers(handlers);
  alexa.execute();
};
