
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

client.params = {
    address: 1024,
    quantity: 10
};

module.exports = client;