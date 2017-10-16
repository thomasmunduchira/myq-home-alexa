const MyQ = require('myq-api');

const constants = require('../config/constants');
const utils = require('./utils');

const { email, password, pin } = process.env;
const account = new MyQ(email, password);

const services = {
  discover() {
    // discovers all garages and lights on a user's account
    if (this.attributes.disabled) {
      return { returnCode: 23 };
    }

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
    if (this.attributes.disabled) {
      return { returnCode: 23 };
    }

    // switch call based on type of device
    let call;
    if (device.typeId === 3) {
      call = account.getLightState;
    } else {
      call = account.getDoorState;
    }

    return account
      .login()
      .then(() => call(device.id))
      .then(result => {
        utils.log('getState result', result);
        return result;
      })
      .catch(err => {
        utils.log('getState - Error', err);
        return null;
      });
  },
  setState(device, state, inputPin) {
    // sets the state of a device
    if (this.attributes.disabled) {
      return { returnCode: 23 };
    } else if (!pin) {
      return { returnCode: 20 };
    } else if (inputPin !== pin) {
      return { returnCode: 22 };
    }

    // switch call based on type of device
    let call;
    if (device.typeId === 3) {
      call = account.setLightState;
    } else {
      call = account.setDoorState;
    }

    return account
      .login()
      .then(() => call(device.id))
      .then(result => {
        utils.log('setState result', result);
        return result;
      })
      .catch(err => {
        utils.log('setState - Error', err);
        return null;
      });
  },
  resetPin() {
    // resets a user's pin
    this.attributes.disabled = true;
  },
};

module.exports = services;
