let client = require('./modbus-client');

client.setID(1);

setTimeout(() =>{
    client.writeCoil(1281, true, function(err, data){
        console.log(data);

        setTimeout(()=>{
            client.writeCoil(1281, false);    
        }, 1000);

    });
}, 2000);