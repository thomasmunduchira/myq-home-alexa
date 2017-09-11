const request = require('request-promise-native');

const constants = require('../config/constants');
const utils = require('./utils');

const services = {
  discover(accessToken) {
    // discovers all garages and lights on a user's account
    const requestOptions = {
      method: 'GET',
      uri: `${constants.endpoint}/devices`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      json: true,
      timeout: constants.requestTimeout,
    };
    return request(requestOptions)
      .then(result => {
        utils.log('discoverDevices result', result);
        return result;
      })
      .catch(err => {
        utils.log('discoverDevices - Error', err);
        return null;
      });
  },
  getState(accessToken, device) {
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
      uri: `${constants.endpoint}/${type}/state`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      qs: {
        id: device.id,
      },
      json: true,
      timeout: constants.requestTimeout,
    };
    return request(requestOptions)
      .then(result => {
        utils.log('getState result', result);
        return result;
      })
      .catch(err => {
        utils.log('getState - Error', err);
        return null;
      });
  },
  setState(accessToken, device, state, pin) {
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
      uri: `${constants.endpoint}/${type}/state`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: {
        id: device.id,
        state,
        pin,
      },
      json: true,
      timeout: constants.requestTimeout,
    };
    return request(requestOptions)
      .then(result => {
        utils.log('setState result', result);
        return result;
      })
      .catch(err => {
        utils.log('setState - Error', err);
        return null;
      });
  },
  resetPin(accessToken) {
    // resets a user's pin
    const requestOptions = {
      method: 'POST',
      uri: `${constants.endpoint}/resetPin`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      json: true,
      timeout: constants.requestTimeout,
    };
    return request(requestOptions)
      .then(result => {
        utils.log('resetPin result', result);
        return result;
      })
      .catch(err => {
        utils.log('resetPin - Error', err);
        return null;
      });
  },
};

module.exports = services;
