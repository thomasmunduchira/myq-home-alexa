const Alexa = require('alexa-sdk');
const request = require('request-promise-native');
const levenshtein = require('fast-levenshtein');

const config = require('./config');

const log = (title, message) => {
  // title: string, message: object
  console.log(`**** ${title}:`, JSON.stringify(message));
};

const getClosestDevice = (name, devices) => {
  // finds closest device by comparing device names to name provided. Uses https://en.wikipedia.org/wiki/Levenshtein_distance
  let minimumDistance = Number.MAX_VALUE;
  let closestDevice = null;
  const cleanName = name.replace(/\s/g, '')
    .toLowerCase(); // standardize format of name
  for (let i = 0; i < devices.length; i += 1) {
    const device = devices[i];
    const cleanDeviceName = device.name.replace(/\s/g, '')
      .toLowerCase(); // standardize format of device name
    const distance = levenshtein.get(cleanName, cleanDeviceName);
    if (distance < minimumDistance) {
      // make this device the closestDevice if it has the shortest distance
      minimumDistance = distance;
      closestDevice = device;
    }
  }
  console.log(name, minimumDistance, closestDevice.name, devices);
  return closestDevice;
};

const getDoors = (devices) => {
  // finds all doors in a list of devices
  if (!devices) {
    return false;
  }
  const doors = [];
  for (let i = 0; i < devices.length; i += 1) {
    const device = devices[i];
    if (device.typeId !== 3) {
      doors.push(device);
    }
  }
  return doors;
};

const getLights = (devices) => {
  // finds all lights in a list of devices
  if (!devices) {
    return false;
  }
  const lights = [];
  for (let i = 0; i < devices.length; i += 1) {
    const device = devices[i];
    if (device.typeId === 3) {
      lights.push(device);
    }
  }
  return lights;
};

const describeDevices = (devices, singularName, pluralName) => {
  // generates a description of devices
  let description = '';
  if (devices.length === 0) {
    return description;
  } else if (devices.length === 1) {
    description += `Your ${singularName} is called ${devices[0].name}.`;
    return description;
  }
  description += `Your ${pluralName} are called ${devices[0].name}`;
  for (let i = 1; i < devices.length; i += 1) {
    const device = devices[i];
    description += `, ${device.name}`;
  }
  description += '.';
  return description;
};

const describeDevicesCard = (devices) => {
  // generates a description of devices for Alexa card responses
  let description = '';
  if (devices.length === 0) {
    description += 'You do not have devices!';
    return description;
  }

  for (let i = 0; i < devices.length; i += 1) {
    const device = devices[i];
    if (i !== 0) {
      description += '\n';
    }
    description += `${device.name}: ${device.typeName}`;
  }
  return description;
};

const listDevices = (devices) => {
  // generates a description of devices
  const doors = getDoors(devices);
  const descriptionDoors = describeDevices(doors, 'door', 'doors');
  const lights = getLights(devices);
  const descriptionLights = describeDevices(lights, 'light', 'lights');
  const description = `You have ${devices.length} ${devices.length === 1 ? 'device' : 'devices'}, ${doors.length} ${doors.length === 1 ? 'door' : 'doors'} and ${lights.length} ${lights.length === 1 ? 'light' : 'lights'}. ${descriptionDoors} ${descriptionLights}`;
  return description;
};

const listDoors = (doors) => {
  // generates a description of doors
  const descriptionDoors = describeDevices(doors, 'door', 'doors');
  const description = `You have ${doors.length} ${doors.length === 1 ? 'door' : 'doors'}. ${descriptionDoors}`;
  return description;
};

const listLights = (lights) => {
  // generates a description of lights
  const descriptionLights = describeDevices(lights, 'light', 'lights');
  const description = `You have ${lights.length} ${lights.length === 1 ? 'light' : 'lights'}. ${descriptionLights}`;
  return description;
};

const getState = (accessToken, device) => {
  // gets the state of a device

  // find type of device
  let type;
  if (device.typeId === 3) {
    type = 'light';
  } else {
    type = 'door';
  }

  const requestOptions = {
    method: 'GET',
    uri: `${config.endpoint}/${type}/state`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    qs: {
      id: device.id,
    },
    json: true,
    timeout: config.requestTimeout,
  };
  return request(requestOptions)
    .then((result) => {
      log('getState result', result);
      return result;
    })
    .catch((err) => {
      log('getState - Error', err);
      return null;
    });
};

const setState = (accessToken, device, state, pin) => {
  // sets the state of a device

  // find type of device
  let type;
  if (device.typeId === 3) {
    type = 'light';
  } else {
    type = 'door';
  }

  const requestOptions = {
    method: 'PUT',
    uri: `${config.endpoint}/${type}/state`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: {
      id: device.id,
      state,
      pin,
    },
    json: true,
    timeout: config.requestTimeout,
  };
  return request(requestOptions)
    .then((result) => {
      log('setState result', result);
      return result;
    })
    .catch((err) => {
      log('setState - Error', err);
      return null;
    });
};

const discoverDevices = (accessToken) => {
  // discovers all garages and lights on a user's account
  const requestOptions = {
    method: 'GET',
    uri: `${config.endpoint}/devices`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    json: true,
    timeout: config.requestTimeout,
  };
  return request(requestOptions)
    .then((result) => {
      log('discoverDevices result', result);
      return result;
    })
    .catch((err) => {
      log('discoverDevices - Error', err);
      return null;
    });
};

const resetPin = (accessToken) => {
  // resets a user's pin
  const requestOptions = {
    method: 'POST',
    uri: `${config.endpoint}/resetPin`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    json: true,
    timeout: config.requestTimeout,
  };
  return request(requestOptions)
    .then((result) => {
      log('resetPin result', result);
      return result;
    })
    .catch((err) => {
      log('resetPin - Error', err);
      return null;
    });
};

const handlers = {
  emit(parameters) {
    // handles all responses to user requests
    const {
      type,
      speechOutput,
      repromptSpeech,
      cardTitle,
      cardContent,
      imageObj,
    } = parameters;
    log(`Response ${type}`, parameters);
    if (['ask'].includes(type)) {
      return this.emit(`:${type}`, speechOutput, repromptSpeech);
    } else if (['tellWithCard'].includes(type)) {
      return this.emit(`:${type}`, speechOutput, cardTitle, cardContent, imageObj);
    } else if (['askWithCard'].includes(type)) {
      return this.emit(`:${type}`, speechOutput, repromptSpeech, cardTitle, cardContent, imageObj);
    }

    return this.emit(`:${type}`, speechOutput);
  },
  LaunchRequest() {
    // user enters skill
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
      type: 'ask',
      speechOutput: speech,
      repromptSpeech: speech,
    });
  },
  NotLinked() {
    // user has not linked their MyQ account
    log('NotLinked', this.event);
    return this.emit('emit', {
      type: 'tellWithLinkAccountCard',
      speechOutput: 'Your MyQ account is not linked. Please go to your Alexa app and link your account',
    });
  },
  IncorrectCredentials() {
    // user has changed MyQ credentials
    log('IncorrectCredentials', this.event);
    return this.emit('emit', {
      type: 'tellWithLinkAccountCard',
      speechOutput: 'Your MyQ account credentials have changed. Please go to your Alexa app and link your account again',
    });
  },
  NoPinEstablished() {
    // user does not have a pin established
    log('NoPinEstablished', this.event);
    return this.emit('emit', {
      type: 'tellWithLinkAccountCard',
      speechOutput: 'You do not have a pin established. Please go to your Alexa app and relink your MyQ account with a pin',
    });
  },
  NoPinProvided() {
    // user did not provide a pin
    log('NoPinProvided', this.event);
    return this.emit('emit', {
      type: 'ask',
      speechOutput: 'You did not provide a pin',
    });
  },
  FirstIncorrectPin() {
    // user provided an incorrect pin
    log('FirstIncorrectPin', this.event);
    return this.emit('emit', {
      type: 'ask',
      speechOutput: 'You have provided an incorrect pin.',
    });
  },
  SecondIncorrectPin() {
    // user provided the second consecutive incorrect pin
    log('SecondIncorrectPin', this.event);
    return this.emit('emit', {
      type: 'ask',
      speechOutput: 'You have provided an incorrect pin. If you forgot your pin, please go to your Alexa app and relink your MyQ account',
    });
  },
  PinReset() {
    // user provided the third consecutive incorrect pin
    log('PinReset', this.event);
    return this.emit('emit', {
      type: 'tell',
      speechOutput: 'Your pin has been reset due to too many incorrect attempts. Please go to your Alexa app and relink your MyQ account',
    });
  },
  NoDiscoveredDevices(type) {
    // user does not have any devices of this type
    log('NoDiscoveredDevices', this.event);
    return this.emit('emit', {
      type: 'ask',
      speechOutput: `You do not have any ${type} discovered. Ask me to discover devices and try again`,
    });
  },
  NoDeviceNameProvided() {
    // user did not provide a device name
    log('NoDeviceNameProvided', this.event);
    return this.emit('emit', {
      type: 'ask',
      speechOutput: 'You did not provide a device name',
    });
  },
  IncorrectDeviceName() {
    // user did not provide a valid device name
    log('IncorrectDeviceName', this.event);
    return this.emit('emit', {
      type: 'ask',
      speechOutput: 'A device by that name was not found. Try again',
    });
  },
  MyQServiceDown() {
    // MyQ service is down
    log('MyQServiceDown', this.event);
    return this.emit('emit', {
      type: 'tell',
      speechOutput: 'The MyQ service is currently down. Please wait for a bit and try again.',
    });
  },
  ErrorHandler(parameters) {
    // error handler for all requests going to endpoint
    const {
      accessToken,
      result,
    } = parameters;
    const {
      returnCode,
    } = result;

    if ([14, 16, 17].includes(returnCode)) {
      // invalid access token
      return this.emit('IncorrectCredentials');
    } else if ([20].includes(returnCode)) {
      // no pin established
      return this.emit('NoPinEstablished');
    } else if ([21].includes(returnCode)) {
      // no pin provided. This error should be caught before the request is made but just in case
      return this.emit('NoPinProvided');
    } else if ([22].includes(returnCode)) {
      // incorrect pin. Increases pinAttempts by one
      let pinAttempts = this.attributes.pinAttempts;
      pinAttempts = pinAttempts ? pinAttempts + 1 : 1;
      this.attributes.pinAttempts = pinAttempts;
      if (pinAttempts === 1) {
        return this.emit('FirstIncorrectPin');
      } else if (pinAttempts === 2) {
        return this.emit('SecondIncorrectPin');
      }

      // resets pin if third consecutive incorrect attempt
      return resetPin(accessToken)
        .then((output) => {
          log('pinReset', output);
          if (!output || !output.success) {
            // MyQ service down
            return this.emit('MyQServiceDown');
          }

          // resets pinAttempts to 0
          this.attributes.pinAttempts = 0;
          return this.emit('PinReset');
        })
        .catch((err) => {
          log('pinReset - Error', err);
        });
    } else if ([23].includes(returnCode)) {
      // pin has been reset
      return this.emit('PinReset');
    }

    // default error
    return this.emit('MyQServiceDown');
  },
  DoorOpenIntent() {
    // user asks to open door
    log('DoorOpenIntent', this.event);
    const accessToken = this.event.session.user.accessToken;
    if (!accessToken) {
      // access token needed for this operation
      return this.emit('NotLinked');
    }
    const doors = getDoors(this.attributes.devices);
    if (!doors || doors.length === 0) {
      // no doors found
      return this.emit('NoDiscoveredDevices', 'doors');
    }
    const parameters = this.event.request.intent.slots;
    const doorName = parameters.doorName.value;
    if (!doorName) {
      // no name provided
      return this.emit('NoDeviceNameProvided');
    }
    let pin = parameters.pin.value;
    if (!pin || pin === '?') {
      // no pin provided
      return this.emit('NoPinProvided');
    }
    pin = parseFloat(pin);
    const door = getClosestDevice(doorName, doors);
    if (!door) {
      // no door found with that name
      return this.emit('IncorrectDeviceName');
    }

    return setState(accessToken, door, 1, pin)
      .then((result) => {
        log('setStateResult', result);
        if (!result) {
          // MyQ service down
          return this.emit('MyQServiceDown');
        }

        const {
          returnCode,
        } = result;

        if (returnCode !== 0) {
          // catch error
          return this.emit('ErrorHandler', {
            accessToken,
            result,
          });
        }

        return this.emit('emit', {
          type: 'tell',
          speechOutput: `Opening ${door.name}`,
        });
      })
      .catch((err) => {
        log('DoorOpenIntent - Error', err);
      });
  },
  DoorCloseIntent() {
    // user asks to close door
    log('DoorCloseIntent', this.event);
    const accessToken = this.event.session.user.accessToken;
    if (!accessToken) {
      // access token needed for this operation
      return this.emit('NotLinked');
    }
    const doors = getDoors(this.attributes.devices);
    if (!doors || doors.length === 0) {
      // no doors found
      return this.emit('NoDiscoveredDevices', 'doors');
    }
    const parameters = this.event.request.intent.slots;
    const doorName = parameters.doorName.value;
    if (!doorName) {
      // no name provided
      return this.emit('NoDeviceNameProvided');
    }
    const door = getClosestDevice(doorName, doors);
    if (!door) {
      // no door found with that name
      return this.emit('IncorrectDeviceName');
    }

    return setState(accessToken, door, 0)
      .then((result) => {
        log('setStateResult', result);
        if (!result) {
          // MyQ service down
          return this.emit('MyQServiceDown');
        }

        const {
          returnCode,
        } = result;

        if (returnCode !== 0) {
          // catch error
          return this.emit('ErrorHandler', {
            accessToken,
            result,
          });
        }

        return this.emit('emit', {
          type: 'tell',
          speechOutput: `Closing ${door.name}`,
        });
      })
      .catch((err) => {
        log('DoorCloseIntent - Error', err);
      });
  },
  LightOnIntent() {
    // user asks to turn on light
    log('LightOnIntent', this.event);
    const accessToken = this.event.session.user.accessToken;
    if (!accessToken) {
      // access token needed for this operation
      return this.emit('NotLinked');
    }
    const lights = getLights(this.attributes.devices);
    if (!lights || lights.length === 0) {
      // no lights found
      return this.emit('NoDiscoveredDevices', 'lights');
    }
    const parameters = this.event.request.intent.slots;
    const lightName = parameters.lightName.value;
    if (!lightName) {
      // no name provided
      return this.emit('NoDeviceNameProvided');
    }
    const light = getClosestDevice(lightName, lights);
    if (!light) {
      // no light found with that name
      return this.emit('IncorrectDeviceName');
    }

    return setState(accessToken, light, 1)
      .then((result) => {
        log('setStateResult', result);
        if (!result) {
          // MyQ service down
          return this.emit('MyQServiceDown');
        }

        const {
          returnCode,
        } = result;

        if (returnCode !== 0) {
          // catch error
          return this.emit('ErrorHandler', {
            accessToken,
            result,
          });
        }

        return this.emit('emit', {
          type: 'tell',
          speechOutput: 'Okay',
        });
      })
      .catch((err) => {
        log('LightOnIntent - Error', err);
      });
  },
  LightOffIntent() {
    // user asks to turn off light
    log('LightOffIntent', this.event);
    const accessToken = this.event.session.user.accessToken;
    if (!accessToken) {
      // access token needed for this operation
      return this.emit('NotLinked');
    }
    const lights = getLights(this.attributes.devices);
    if (!lights || lights.length === 0) {
      // no lights found
      return this.emit('NoDiscoveredDevices', 'lights');
    }
    const parameters = this.event.request.intent.slots;
    const lightName = parameters.lightName.value;
    if (!lightName) {
      // no name provided
      return this.emit('NoDeviceNameProvided');
    }
    const light = getClosestDevice(lightName, lights);
    if (!light) {
      // no light found with that name
      return this.emit('IncorrectDeviceName');
    }

    return setState(accessToken, light, 0)
      .then((result) => {
        log('setStateResult', result);
        if (!result) {
          // MyQ service down
          return this.emit('MyQServiceDown');
        }

        const {
          returnCode,
        } = result;

        if (returnCode !== 0) {
          // catch error
          return this.emit('ErrorHandler', {
            accessToken,
            result,
          });
        }

        return this.emit('emit', {
          type: 'tell',
          speechOutput: 'Okay',
        });
      })
      .catch((err) => {
        log('LightOffIntent - Error', err);
      });
  },
  DoorQueryIntent() {
    // user asks about the state of a door
    log('DoorQueryIntent', this.event);
    const accessToken = this.event.session.user.accessToken;
    if (!accessToken) {
      // access token needed for this operation
      return this.emit('NotLinked');
    }
    const doors = getDoors(this.attributes.devices);
    if (!doors || doors.length === 0) {
      // no doors found
      return this.emit('NoDiscoveredDevices', 'doors');
    }
    const parameters = this.event.request.intent.slots;
    const doorName = parameters.doorName.value;
    if (!doorName) {
      // no name provided
      return this.emit('NoDeviceNameProvided');
    }
    const door = getClosestDevice(doorName, doors);
    if (!door) {
      // no door found with that name
      return this.emit('IncorrectDeviceName');
    }

    return getState(accessToken, door)
      .then((result) => {
        log('getStateResult', result);
        if (!result) {
          // MyQ service down
          return this.emit('MyQServiceDown');
        }

        const {
          returnCode,
        } = result;

        if (returnCode !== 0) {
          // catch error
          return this.emit('ErrorHandler', {
            accessToken,
            result,
          });
        }

        return this.emit('emit', {
          type: 'tell',
          speechOutput: `${door.name} is ${result.doorStateDescription}`,
        });
      })
      .catch((err) => {
        log('DoorQueryIntent - Error', err);
      });
  },
  LightQueryIntent() {
    // user asks about the state of a light
    log('LightQueryIntent', this.event);
    const accessToken = this.event.session.user.accessToken;
    if (!accessToken) {
      // access token needed for this operation
      return this.emit('NotLinked');
    }
    const lights = getLights(this.attributes.devices);
    if (!lights || lights.length === 0) {
      // no lights found
      return this.emit('NoDiscoveredDevices', 'lights');
    }
    const parameters = this.event.request.intent.slots;
    const lightName = parameters.lightName.value;
    if (!lightName) {
      // no name provided
      return this.emit('NoDeviceNameProvided');
    }
    const light = getClosestDevice(lightName, lights);
    if (!light) {
      // no light found with that name
      return this.emit('IncorrectDeviceName');
    }

    return getState(accessToken, light)
      .then((result) => {
        log('getStateResult', result);
        if (!result) {
          // MyQ service down
          return this.emit('MyQServiceDown');
        }

        const {
          returnCode,
        } = result;

        if (returnCode !== 0) {
          // catch error
          return this.emit('ErrorHandler', {
            accessToken,
            result,
          });
        }

        return this.emit('emit', {
          type: 'tell',
          speechOutput: `${light.name} is ${result.lightStateDescription}`,
        });
      })
      .catch((err) => {
        log('LightQueryIntent - Error', err);
      });
  },
  ListDevicesIntent() {
    // user asks for all devices found
    log('ListDevicesIntent', this.event);
    const devices = this.attributes.devices;
    if (!devices || devices.length === 0) {
      // no devices found
      return this.emit('NoDiscoveredDevices', 'devices');
    }

    return this.emit('emit', {
      type: 'tellWithCard',
      speechOutput: listDevices(devices),
      cardTitle: 'Your Devices',
      cardContent: describeDevicesCard(devices),
    });
  },
  ListDoorsIntent() {
    // user asks for all doors found
    log('ListDoorsIntent', this.event);
    const doors = getDoors(this.attributes.devices);
    if (!doors || doors.length === 0) {
      // no doors found
      return this.emit('NoDiscoveredDevices', 'doors');
    }

    return this.emit('emit', {
      type: 'tellWithCard',
      speechOutput: listDoors(doors),
      cardTitle: 'Your Doors',
      cardContent: describeDevicesCard(doors),
    });
  },
  ListLightsIntent() {
    // user asks for all lights found
    log('ListLightsIntent', this.event);
    const lights = getLights(this.attributes.devices);
    if (!lights || lights.length === 0) {
      // no lights found
      return this.emit('NoDiscoveredDevices', 'lights');
    }

    return this.emit('emit', {
      type: 'tellWithCard',
      speechOutput: listLights(lights),
      cardTitle: 'Your Lights',
      cardContent: describeDevicesCard(lights),
    });
  },
  DiscoverDevicesIntent() {
    // user asks to discover devices
    log('DiscoverDevicesIntent', this.event);
    const accessToken = this.event.session.user.accessToken;
    if (!accessToken) {
      // access token needed for this operation
      return this.emit('NotLinked');
    }

    return discoverDevices(accessToken)
      .then((result) => {
        log('discoverDevicesResult', result);
        if (!result) {
          // MyQ service down
          this.attributes.devices = []; // clear out stored list of devices
          return this.emit('MyQServiceDown');
        }

        const {
          returnCode,
          devices,
        } = result;

        if (returnCode !== 0) {
          // catch error
          return this.emit('ErrorHandler', {
            accessToken,
            result,
          });
        }

        // parse list of devices
        let index = 1;
        for (let i = devices.length - 1; i >= 0; i -= 1) {
          const device = devices[i];
          if (!device.id) {
            devices.splice(i, 1); // remove device if no ID
          } else if (!device.name) {
            device.name = `Device ${index}`; // default name if not found in endpoint response
            index += 1;
          }
        }
        this.attributes.devices = devices; // store list of devices
        return this.emit('emit', {
          type: 'tellWithCard',
          speechOutput: `Discovery is complete. ${listDevices(devices)}`,
          cardTitle: 'Discovered Devices',
          cardContent: describeDevicesCard(devices),
        });
      })
      .catch((err) => {
        log('DiscoverDevicesIntent - Error', err);
      });
  },
  'AMAZON.HelpIntent': function helpIntent() {
    // user asks for help
    log('AMAZON.HelpIntent', this.event);
    const speech = 'You can ask me to discover your devices, after which you can ask about or change the state of a device.';
    return this.emit('emit', {
      type: 'ask',
      speechOutput: speech,
    });
  },
  'AMAZON.StopIntent': function stopIntent() {
    // user stops session
    log('AMAZON.StopIntent', this.event);
    return this.emit('SessionEndedRequest');
  },
  'AMAZON.CancelIntent': function cancelIntent() {
    // user cancels during session
    log('AMAZON.CancelIntent', this.event);
    return this.emit('SessionEndedRequest');
  },
  SessionEndedRequest() {
    // user exits session
    log('SessionEndedRequest', this.event);
    this.emit(':saveState', true);
    return this.emit('emit', {
      type: 'tell',
      speechOutput: 'Goodbye!',
    });
  },
  Unhandled() {
    // in case a request does not fit any of the above
    log('Unhandled', this.event);
    this.emit('emit', {
      type: 'ask',
      speechOutput: 'Sorry, I was unable to understand your request. Please try again.',
    });
    return this.emit('SessionEndedRequest');
  },
};

exports.handler = (event, context, callback) => {
  // initializes application
  const alexa = Alexa.handler(event, context, callback);
  alexa.appId = config.appId;
  alexa.dynamoDBTableName = config.db.name;
  alexa.registerHandlers(handlers);
  alexa.execute();
};
