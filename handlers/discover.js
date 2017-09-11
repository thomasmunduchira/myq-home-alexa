const information = require('../utils/information');
const services = require('../utils/services');
const utils = require('../utils/utils');

const discover = {
  DiscoverDevicesIntent() {
    // user asks to discover devices
    utils.log('DiscoverDevicesIntent', this.event);
    const accessToken = this.event.session.user.accessToken;
    if (!accessToken) {
      // access token needed for this operation
      return this.emit('NotLinked');
    }

    return services
      .discover(accessToken)
      .then(result => {
        if (!result) {
          // MyQ service down
          this.attributes.devices = []; // clear out stored list of devices
          return this.emit('MyQServiceDown');
        }

        const { returnCode, devices } = result;

        if (returnCode !== 0) {
          // catch error
          return this.emit('ErrorHandler', {
            accessToken,
            result,
          });
        }

        // parse list of devices
        let index = 1;
        for (let i = devices.length - 1; i >= 0; i -= 1) {
          const device = devices[i];
          if (!device.id) {
            devices.splice(i, 1); // remove device if no ID
          } else if (!device.name) {
            device.name = `Device ${index}`; // default name if not found in endpoint response
            index += 1;
          }
        }
        this.attributes.devices = devices; // store list of devices
        return this.emit('emit', {
          type: 'tellWithCard',
          speechOutput: `Discovery is complete. ${information.listDevices(devices)}`,
          cardTitle: 'Discovered Devices',
          cardContent: information.describeDevicesCard(devices),
        });
      })
      .catch(err => {
        utils.log('DiscoverDevicesIntent - Error', err);
      });
  },
};

module.exports = discover;
