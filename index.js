const awsIot = require('aws-iot-device-sdk');
const five = require('johnny-five');
const Raspi = require('raspi-io');

const thingShadow = awsIot.thingShadow({
  keyPath: 'certs/raven-ridge-nursery-thermometer.private.key',
  certPath: 'certs/raven-ridge-nursery-thermometer.cert.pem',
  caPath: 'certs/root-CA.crt',
  clientId: 'raven-ridge-nursery-thermometer',
  host: 'a1sja93rj6djc4.iot.us-east-2.amazonaws.com',
});

let clientTokenUpdate;

const board = new five.Board({ io: new Raspi() });

thingShadow.on('connect', function() {
  thingShadow.register('thermometer');

  board.on('ready', function() {
    const thermometer = new five.Thermometer({ controller: 'MCP9808' });
    thermometer.on('change', function() {
      const { fahrenheit, celcius } = this;
      const tempState = { state: { desired: { fahrenheit, celcius } } };
      clientTokenUpdate = thingShadow.update('thermometer', tempState);
      if (clientTokenUpdate === null) console.log('update shadow failed, operation still in progress');
    });
  });
});

thingShadow.on('status', (thingName, stat, clientToken, stateObject) => {
  console.log(`received ${stat} on ${thingName}: ${JSON.stringify(stateObject)}`);
});

thingShadow.on('delta', (thingName, stateObject) => {
  console.log(`received delta on ${thingName}: ${JSON.stringify(stateObject)}`);
});

thingShadow.on('timeout', (thingName, clientToken) => {
  console.log(`received timeout on ${thingNamewith} token: ${clientToken}`);
});

