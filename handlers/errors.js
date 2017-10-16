const utils = require('../utils/utils');

const errors = {
  IncorrectCredentials() {
    // user has changed MyQ credentials
    utils.log('IncorrectCredentials', this.event);
    return this.emit('emit', {
      type: 'tell',
      speechOutput:
        'Your MyQ account credentials have changed. Please go to your Lambda service and correct your credentials',
    });
  },
  NoPinEstablished() {
    // user does not have a pin established
    utils.log('NoPinEstablished', this.event);
    return this.emit('emit', {
      type: 'tell',
      speechOutput:
        'You do not have a pin established. Please go to your Lambda service to set a pin',
    });
  },
  NoPinProvided() {
    // user did not provide a pin
    utils.log('NoPinProvided', this.event);
    return this.emit('emit', {
      type: 'ask',
      speechOutput: 'You did not provide a pin',
    });
  },
  FirstIncorrectPin() {
    // user provided an incorrect pin
    utils.log('FirstIncorrectPin', this.event);
    return this.emit('emit', {
      type: 'ask',
      speechOutput: 'You have provided an incorrect pin.',
    });
  },
  SecondIncorrectPin() {
    // user provided the second consecutive incorrect pin
    utils.log('SecondIncorrectPin', this.event);
    return this.emit('emit', {
      type: 'ask',
      speechOutput:
        'You have provided an incorrect pin. If you forgot your pin, please set a new pin through your Lambda service and then disable and reenable this skill through the Alexa app to have the changes take effect',
    });
  },
  PinReset() {
    // user provided the third consecutive incorrect pin
    utils.log('PinReset', this.event);
    return this.emit('emit', {
      type: 'tell',
      speechOutput:
        'Your pin has been disabled due to too many incorrect attempts. Please set a new pin through your Lambda service and then disable and reenable this skill through the Alexa app to have the changes take effect',
    });
  },
  NoDiscoveredDevices(type) {
    // user does not have any devices of this type
    utils.log('NoDiscoveredDevices', this.event);
    return this.emit('emit', {
      type: 'ask',
      speechOutput: `You do not have any ${type} discovered. Ask me to discover devices and try again`,
    });
  },
  NoDeviceNameProvided() {
    // user did not provide a device name
    utils.log('NoDeviceNameProvided', this.event);
    return this.emit('emit', {
      type: 'ask',
      speechOutput: 'You did not provide a device name',
    });
  },
  IncorrectDeviceName() {
    // user did not provide a valid device name
    utils.log('IncorrectDeviceName', this.event);
    return this.emit('emit', {
      type: 'ask',
      speechOutput: 'A device by that name was not found. Try again',
    });
  },
  MyQServiceDown() {
    // MyQ service is down
    utils.log('MyQServiceDown', this.event);
    return this.emit('emit', {
      type: 'tell',
      speechOutput: 'The MyQ service is currently down. Please wait for a bit and try again.',
    });
  },
  ErrorHandler(returnCode) {
    // error handler for all requests going to endpoint

    if ([13, 14, 16, 17].includes(returnCode)) {
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
      return this.resetPin()
        .then(output => {
          utils.log('pinReset', output);
          if (!output || !output.success) {
            // MyQ service down
            return this.emit('MyQServiceDown');
          }

          // resets pinAttempts to 0
          this.attributes.pinAttempts = 0;
          return this.emit('PinReset');
        })
        .catch(err => {
          utils.log('pinReset - Error', err);
        });
    } else if ([23].includes(returnCode)) {
      // pin has been reset
      return this.emit('PinReset');
    }

    // default error
    return this.emit('MyQServiceDown');
  },
};

module.exports = errors;
