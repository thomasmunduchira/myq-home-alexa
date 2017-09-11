const information = require('../utils/information');
const utils = require('../utils/utils');

const description = {
  ListDevicesIntent() {
    // user asks for all devices found
    utils.log('ListDevicesIntent', this.event);
    const devices = this.attributes.devices;
    if (!devices || devices.length === 0) {
      // no devices found
      return this.emit('NoDiscoveredDevices', 'devices');
    }

    return this.emit('emit', {
      type: 'tellWithCard',
      speechOutput: information.listDevices(devices),
      cardTitle: 'Your Devices',
      cardContent: information.describeDevicesCard(devices),
    });
  },
  ListDoorsIntent() {
    // user asks for all doors found
    utils.log('ListDoorsIntent', this.event);
    const doors = utils.getDoors(this.attributes.devices);
    if (!doors || doors.length === 0) {
      // no doors found
      return this.emit('NoDiscoveredDevices', 'doors');
    }

    return this.emit('emit', {
      type: 'tellWithCard',
      speechOutput: information.listDoors(doors),
      cardTitle: 'Your Doors',
      cardContent: information.describeDevicesCard(doors),
    });
  },
  ListLightsIntent() {
    // user asks for all lights found
    utils.log('ListLightsIntent', this.event);
    const lights = utils.getLights(this.attributes.devices);
    if (!lights || lights.length === 0) {
      // no lights found
      return this.emit('NoDiscoveredDevices', 'lights');
    }

    return this.emit('emit', {
      type: 'tellWithCard',
      speechOutput: information.listLights(lights),
      cardTitle: 'Your Lights',
      cardContent: information.describeDevicesCard(lights),
    });
  },
};

module.exports = description;
