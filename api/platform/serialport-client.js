var SerialPort = require('serialport');
var port = new SerialPort('COM4', {
  baudRate: 19200,
  dataBits: 8,
  parity: 'none',
  stopBits: 1
});

module.exports = port;