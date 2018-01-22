
const ModbusRTU = require("modbus-serial");
// create an empty modbus client
const client = new ModbusRTU();
// open connection to a serial port
client.connectRTUBuffered("COM4", { 
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1
});

//client.setTimeout(10000);

client.params = {
    address: 1024,
    quantity: 100,
    markingDoneAddress: 1280
};

module.exports = client;