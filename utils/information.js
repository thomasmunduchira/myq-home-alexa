const utils = require('./utils.js');

const information = {
  describeDevices(devices, singularName, pluralName) {
    // generates a description of devices
    let description = '';
    if (devices.length === 0) {
      return description;
    }
    if (devices.length === 1) {
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
  },
  describeDevicesCard(devices) {
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
  },
  listDevices(devices) {
    // generates a description of devices
    const doors = utils.getDoors(devices);
    const descriptionDoors = this.describeDevices(doors, 'door', 'doors');
    const lights = utils.getLights(devices);
    const descriptionLights = this.describeDevices(lights, 'light', 'lights');
    const description = `You have ${devices.length} ${
      devices.length === 1 ? 'device' : 'devices'
    }, ${doors.length} ${doors.length === 1 ? 'door' : 'doors'} and ${lights.length} ${
      lights.length === 1 ? 'light' : 'lights'
    }. ${descriptionDoors} ${descriptionLights}`;
    return description;
  },
  listDoors(doors) {
    // generates a description of doors
    const descriptionDoors = this.describeDevices(doors, 'door', 'doors');
    const description = `You have ${doors.length} ${
      doors.length === 1 ? 'door' : 'doors'
    }. ${descriptionDoors}`;
    return description;
  },
  listLights(lights) {
    // generates a description of lights
    const descriptionLights = this.describeDevices(lights, 'light', 'lights');
    const description = `You have ${lights.length} ${
      lights.length === 1 ? 'light' : 'lights'
    }. ${descriptionLights}`;
    return description;
  },
};

module.exports = information;
