const utils = require('../utils/utils');

const response = {
  emit(parameters) {
    // handles all responses to user requests
    const { type, speechOutput, repromptSpeech, cardTitle, cardContent, imageObj } = parameters;
    utils.log(`Response ${type}`, parameters);
    if (['ask'].includes(type)) {
      return this.emit(`:${type}`, speechOutput, repromptSpeech);
    } else if (['tellWithCard'].includes(type)) {
      return this.emit(`:${type}`, speechOutput, cardTitle, cardContent, imageObj);
    } else if (['askWithCard'].includes(type)) {
      return this.emit(`:${type}`, speechOutput, repromptSpeech, cardTitle, cardContent, imageObj);
    }

    return this.emit(`:${type}`, speechOutput);
  },
  notice() {
    const notice =
      'This Amazon skill has not been approved through Chamberlain’s partnership process, and has been disabled as a result. The developer is working with the appropriate teams to secure the proper approval and agreement. Check the community forums for more details.';
    this.emit('emit', {
      type: 'tellWithCard',
      speechOutput: notice,
      cardTitle: 'Notice',
      cardContent: notice,
    });
  },
};

module.exports = response;
