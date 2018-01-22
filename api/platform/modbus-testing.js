// let client = require('./modbus-client');

// client.setID(1);


// setInterval(() => {

//     //client.readCoils - irobotics
//     client.readDiscreteInputs(client.params.address, client.params.quantity, (err, data) => {
//         if (err) {
//             console.log("ERROR-modbuse-reader:", err);
//             return;
//         }
//     });
// }, 5000);

// setTimeout(() => {
//     client.writeCoil(1280, true, function (err, data) {
//         console.log(data);

//         setTimeout(() => {
//             client.writeCoil(1280, false);
//         }, 1000);

//     });
// }, 2000);

var SerialPort = require('serialport');
var port = new SerialPort('COM4');
 
port.write('main screen turn on', function(err) {
  if (err) {
    return console.log('Error on write: ', err.message);
  }
  console.log('message written');
});
 
// Open errors will be emitted as an error event
port.on('error', function(err) {
  console.log('Error: ', err.message);
})