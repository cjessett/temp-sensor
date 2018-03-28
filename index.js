const awsIot = require('aws-iot-device-sdk');
const five = require('johnny-five');
const Raspi = require('raspi-io');

const board = new five.Board({ io: new Raspi() });


const config = {
	keyPath: 'certs/cb8d3158dc-private.pem.key',
	certPath: 'certs/cb8d3158dc-certificate.pem.crt',
	caPath: 'certs/root-CA.crt',
	clientId: 'raven-ridge-nursery-thermometer',
	host: 'a1sja93rj6djc4.iot.us-east-2.amazonaws.com',
};


const thingShadows = awsIot.thingShadow(config);

board.on('ready', function() {
	const thermometer = new five.Thermometer({ controller: 'MCP9808' });
	thingShadows.on('connect', function() {
		thingShadows.register('raven-ridge-nursery-thermometer', {}, function() {
			thermometer.on('change', function() {
				console.log(this.fahrenheit)
		        	thingShadows.update('raven-ridge-nursery-thermometer', { state: { reported: { temp: this.fahrenheit } } }); 
			});
		});
	});
});


