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
};

module.exports = response;
