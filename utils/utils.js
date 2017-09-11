const levenshtein = require('fast-levenshtein');

const utils = {
  log(title, message) {
    // title: string, message: object
    console.log(`**** ${title}:`, JSON.stringify(message));
  },
  getClosestDevice(name, devices) {
    // finds closest device by comparing device names to name provided. Uses https://en.wikipedia.org/wiki/Levenshtein_distance
    let minimumDistance = Number.MAX_VALUE;
    let closestDevice = null;
    const cleanName = name.replace(/\s/g, '').toLowerCase(); // standardize format of name
    for (let i = 0; i < devices.length; i += 1) {
      const device = devices[i];
      const cleanDeviceName = device.name.replace(/\s/g, '').toLowerCase(); // standardize format of device name
      const distance = levenshtein.get(cleanName, cleanDeviceName);
      if (distance < minimumDistance) {
        // make this device the closestDevice if it has the shortest distance
        minimumDistance = distance;
        closestDevice = device;
      }
    }
    console.log(name, minimumDistance, closestDevice.name, devices);
    return closestDevice;
  },
  getDoors(devices) {
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
  },
  getLights(devices) {
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
  },
};

module.exports = utils;
