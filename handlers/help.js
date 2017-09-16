const utils = require('../utils/utils');

const help = {
  LaunchRequest() {
    // user enters skill
    utils.log('LaunchRequest', this.event);
    return this.emit('notice');
    // const devices = this.attributes.devices;
    // const hasDevices = devices && devices.length > 0;
    // let speech = 'Welcome to MyQ Home. ';
    // if (hasDevices) {
    //   speech += 'Ask about or change the state of a device.';
    // } else {
    //   speech +=
    //     'Ask me to discover your devices, after which you can ask about or change the state of a device.';
    // }
    // return this.emit('emit', {
    //   type: 'ask',
    //   speechOutput: speech,
    //   repromptSpeech: speech,
    // });
  },
  'AMAZON.HelpIntent': function helpIntent() {
    // user asks for help
    utils.log('AMAZON.HelpIntent', this.event);
    const speech =
      'You can ask me to discover your devices, after which you can ask about or change the state of a device.';
    return this.emit('emit', {
      type: 'ask',
      speechOutput: speech,
    });
  },
  'AMAZON.StopIntent': function stopIntent() {
    // user stops session
    utils.log('AMAZON.StopIntent', this.event);
    return this.emit('SessionEndedRequest');
  },
  'AMAZON.CancelIntent': function cancelIntent() {
    // user cancels during session
    utils.log('AMAZON.CancelIntent', this.event);
    return this.emit('SessionEndedRequest');
  },
  SessionEndedRequest() {
    // user exits session
    utils.log('SessionEndedRequest', this.event);
    this.emit(':saveState', true);
    return this.emit('emit', {
      type: 'tell',
      speechOutput: 'Goodbye!',
    });
  },
  Unhandled() {
    // in case a request does not fit any of the above
    utils.log('Unhandled', this.event);
    this.emit('emit', {
      type: 'ask',
      speechOutput: 'Sorry, I was unable to understand your request. Please try again.',
    });
    return this.emit('SessionEndedRequest');
  },
};

module.exports = help;
