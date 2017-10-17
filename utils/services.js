const MyQ = require('myq-api');

const constants = require('../config/constants');
const utils = require('./utils');

const { email, password } = process.env;
const account = new MyQ(email, password);

const services = {
  discover() {
    // discovers all garages and lights on a user's account
    return account
      .login()
      .then(() => account.getDevices(constants.typeIds))
      .then(result => {
        utils.log('discoverDevices result', result);
        return result;
      })
      .catch(err => {
        utils.log('discoverDevices - Error', err);
        return null;
      });
  },
  getState(device) {
    // gets the state of a device

    // switch call based on type of device
    let call;
    if (device.typeId === 3) {
      call = 'getLightState';
    } else {
      call = 'getDoorState';
    }

    return account
      .login()
      .then(() => account[call](device.id))
      .then(result => {
        utils.log('getState result', result);
        return result;
      })
      .catch(err => {
        utils.log('getState - Error', err);
        return null;
      });
  },
  setState(device, state) {
    // sets the state of a device

    // switch call based on type of device
    let call;
    if (device.typeId === 3) {
      call = 'setLightState';
    } else {
      call = 'setDoorState';
    }

    return account
      .login()
      .then(() => account[call](device.id, state))
      .then(result => {
        utils.log('setState result', result);
        return result;
      })
      .catch(err => {
        utils.log('setState - Error', err);
        return null;
      });
  },
};

module.exports = services;
