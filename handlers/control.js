const services = require('../utils/services');
const utils = require('../utils/utils');

let { pin } = process.env;
pin = parseFloat(pin);

const control = {
  DoorOpenIntent() {
    // user asks to open door
    utils.log('DoorOpenIntent', this.event);
    if (this.attributes.pinDisabled) {
      return this.emit('PinErrorHandler', 23);
    }
    if (!pin) {
      return this.emit('PinErrorHandler', 20);
    }
    const doors = utils.getDoors(this.attributes.devices);
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
    let inputPin = parameters.pin.value;
    if (!inputPin || inputPin === '?') {
      // no pin provided
      return this.emit('PinErrorHandler', 21);
    }
    inputPin = parseFloat(inputPin);
    if (inputPin !== pin) {
      // incorrect pin
      return this.emit('PinErrorHandler', 22);
    }
    const door = utils.getClosestDevice(doorName, doors);
    if (!door) {
      // no door found with that name
      return this.emit('IncorrectDeviceName');
    }

    return services
      .setState(door, 1, pin)
      .then(result => {
        if (!result) {
          // MyQ service down
          return this.emit('MyQServiceDown');
        }

        const { returnCode } = result;

        if (returnCode !== 0) {
          // catch error
          return this.emit('ServiceErrorHandler', returnCode);
        }

        return this.emit('emit', {
          type: 'tell',
          speechOutput: `Opening ${door.name}`,
        });
      })
      .catch(err => {
        utils.log('DoorOpenIntent - Error', err);
      });
  },
  DoorCloseIntent() {
    // user asks to close door
    utils.log('DoorCloseIntent', this.event);
    const doors = utils.getDoors(this.attributes.devices);
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
    const door = utils.getClosestDevice(doorName, doors);
    if (!door) {
      // no door found with that name
      return this.emit('IncorrectDeviceName');
    }

    return services
      .setState(door, 0)
      .then(result => {
        if (!result) {
          // MyQ service down
          return this.emit('MyQServiceDown');
        }

        const { returnCode } = result;

        if (returnCode !== 0) {
          // catch error
          return this.emit('ServiceErrorHandler', returnCode);
        }

        return this.emit('emit', {
          type: 'tell',
          speechOutput: `Closing ${door.name}`,
        });
      })
      .catch(err => {
        utils.log('DoorCloseIntent - Error', err);
      });
  },
  LightOnIntent() {
    // user asks to turn on light
    utils.log('LightOnIntent', this.event);
    const lights = utils.getLights(this.attributes.devices);
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
    const light = utils.getClosestDevice(lightName, lights);
    if (!light) {
      // no light found with that name
      return this.emit('IncorrectDeviceName');
    }

    return services
      .setState(light, 1)
      .then(result => {
        if (!result) {
          // MyQ service down
          return this.emit('MyQServiceDown');
        }

        const { returnCode } = result;

        if (returnCode !== 0) {
          // catch error
          return this.emit('ServiceErrorHandler', returnCode);
        }

        return this.emit('emit', {
          type: 'tell',
          speechOutput: 'Okay',
        });
      })
      .catch(err => {
        utils.log('LightOnIntent - Error', err);
      });
  },
  LightOffIntent() {
    // user asks to turn off light
    utils.log('LightOffIntent', this.event);
    const lights = utils.getLights(this.attributes.devices);
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
    const light = utils.getClosestDevice(lightName, lights);
    if (!light) {
      // no light found with that name
      return this.emit('IncorrectDeviceName');
    }

    return services
      .setState(light, 0)
      .then(result => {
        if (!result) {
          // MyQ service down
          return this.emit('MyQServiceDown');
        }

        const { returnCode } = result;

        if (returnCode !== 0) {
          // catch error
          return this.emit('ServiceErrorHandler', returnCode);
        }

        return this.emit('emit', {
          type: 'tell',
          speechOutput: 'Okay',
        });
      })
      .catch(err => {
        utils.log('LightOffIntent - Error', err);
      });
  },
};

module.exports = control;
