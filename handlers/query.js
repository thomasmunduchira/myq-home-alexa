const services = require('../utils/services');
const utils = require('../utils/utils');

const query = {
  DoorQueryIntent() {
    // user asks about the state of a door
    utils.log('DoorQueryIntent', this.event);
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
      .getState(door)
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
          speechOutput: `${door.name} is ${result.doorStateDescription}`,
        });
      })
      .catch(err => {
        utils.log('DoorQueryIntent - Error', err);
      });
  },
  LightQueryIntent() {
    // user asks about the state of a light
    utils.log('LightQueryIntent', this.event);
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
      .getState(light)
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
          speechOutput: `${light.name} is ${result.lightStateDescription}`,
        });
      })
      .catch(err => {
        utils.log('LightQueryIntent - Error', err);
      });
  },
};

module.exports = query;
