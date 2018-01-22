var WebSocket = require('ws'),
  db = require('../db'),
  localStorage = require('../localstorage'),
  client = require('./modbus-client'),
  serialport = require('./serialport-client');

class Modbus {

  constructor() {
    this.prevStopSignal = false;
    this.ws = null;
    this.selectedFrame = {};
    this.isLogging = false;

    setInterval(() => {
      if (this.isLogging == false) {
        //client.readCoils - irobotics
        client.readDiscreteInputs(client.params.address, client.params.quantity, (err, data) => {
          if (err) {
            console.log("ERROR-modbuse-reader:", err);
            return;
          }
          //console.log("---\n"+JSON.stringify(data.data));
          this.onMessage(data.data);
        });
      }
      this.onMessage(data);

    }, 1000);

  }

  onMessage(signals) {
    let stopSignal = signals[1];
    let selectedFrame = JSON.parse(localStorage.getItem("selectedFrame"));

    //When previous signal and current signal are not same and current signal is true
    //this triggers the logging process
    if (this.prevStopSignal !== stopSignal && stopSignal === true) {
      console.log('Recieved stop signal: started logging...')
      if (typeof selectedFrame === 'object' && selectedFrame.id) {
        this.selectedFrame = selectedFrame;
        this.fetchData(signals, selectedFrame);
      }

    }
    this.prevStopSignal = stopSignal;
  }

  fetchData(signals, selectedFrame) {
    console.log('Fetching data...')
    this.getDataFromTable('frames')
      .then(res => this.frames = res)
      .then(this.getDataFromTableComponents.bind(this, 'components'))
      .then(res => this.components = res)
      .then(this.getDataFromTable.bind(this, 'shifts'))
      .then(res => this.shifts = res)
      .then(() => {
        this.generateLogs(signals, selectedFrame);
      })
  }

  generateLogs(signals, selectedFrame) {
    console.log('Generating logs...')
    //data signal starting form 16
    signals = signals.splice(16, this.components.length);

    console.log("SHIFT:", this.getShift());
    console.log("SERIAL:", this.getFrameSerial());

    if (this.getShift() && this.getFrameSerial() > 0) {

      console.log('Generating logs... shift and frame serial is valid');
      let frameSerial = this.getFrameSerial();
      let isValid = signals.every(comp => {
        return comp === true;
      });

      if (!isValid) {
        frameSerial = frameSerial - 1;
      }

      //hardcode
      //isValid = true;

      console.log('isValid sceneario...', isValid);

      this.logs = [];

      this.components.forEach((comp, index) => {
        //console.log(isValid, signals[index]);
        if (isValid && index == 0) {
          //console.log('Valid sceneario...', this.getShift());
          this.logs.push({
            frametype: selectedFrame ? selectedFrame.name : '',
            framenumber: isValid ? frameSerial : '---',
            frameid: selectedFrame.id,
            framecomponent: 'ALL',
            shiftnumber: this.getShift(),
            processingtime: "",
            status: signals[index] === true ? "PRESENT" : "ABSENT",
            timestamp: new Date(new Date().getTime() + index * 1000),
            framedynamiccode: this.getFrameCode(new Date(), frameSerial)
          });
        } else if (!isValid && signals[index] == false) {
          //console.log('Invalid sceneario...');
          this.logs.push({
            frametype: selectedFrame ? selectedFrame.name : '',
            framenumber: isValid ? frameSerial : '---',
            frameid: selectedFrame.id,
            framecomponent: (index + 1) + ":" + comp.name,
            shiftnumber: this.getShift(),
            processingtime: "",
            status: signals[index] === true ? "PRESENT" : "ABSENT",
            timestamp: new Date(new Date().getTime() + index * 1000),
            framedynamiccode: '---'
          });
        }

        localStorage.setItem('lastLogs', JSON.stringify(this.logs));
      });

      this.selectedFrame.serial = frameSerial;
      localStorage.setItem('selectedFrame', JSON.stringify(this.selectedFrame));

      //add log into table
      //console.log(this.logs);
      this.logs.forEach(this.addLogsIntoTable.bind(this));

      if (isValid) {

        let hex = this.generateHex();

        console.log(hex);

        serialport.write(hex, function (err) {
          if (err) {
            return console.log('Error on write: ', err.message);
          }
        });

        this.isLogging = true;
        setTimeout(() => {
          client.writeCoil(client.params.markingDoneAddress, true, function (err, data) {
            console.log(err, data);
          });
        }, 1000);

        setTimeout(() => {
          client.writeCoil(client.params.markingDoneAddress, false, () => {
            this.isLogging = false;
          });
        }, 5000);
      }
    }
  }

  addLogsIntoTable(log) {
    //console.log(log);
    db.all(`INSERT INTO logs (
                frametype,
                framenumber,
                framecomponent,
                shiftnumber,
                processingtime,
                status,
                timestamp,
                framedynamiccode
              )
    
              VALUES (
    
              '${log.frametype}',
              '${log.framenumber}',
              '${log.framecomponent}',
              '${log.shiftnumber}',
              '${log.processingtime}',
              '${log.status}',
              '${log.timestamp}',
              '${log.framedynamiccode}'
              )`
    );
  }

  generateHex() {

    let lastLogs = JSON.parse(localStorage.getItem('lastLogs'));
    let hex = this.hex_to_ascii("1B");
    let str = '';
    str += hex + "M001;" + hex + "B000;" + hex + "U";
    //data
    str += lastLogs[0].framedynamiccode + ";";
    //ending 
    str += hex + "Z;";

    return str;
    //this.wsLogs.send('{ "id": 10}');
  }

  hex_to_ascii(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
  }

  getDataFromTable(table) {
    return new Promise(res => {
      db.all(`select * from ${table}`, (err, rows) => {
        res(rows);
      });
    })
  }

  getDataFromTableComponents(table) {
    return new Promise(res => {
      db.all(`select * from ${table} where frameid = ${this.selectedFrame.id}`, (err, rows) => {
        res(rows);
      });
    })
  }

  getShift() {
    var shifts = this.shifts;
    var shiftName = '';

    for (var i = 0; i < shifts.length; i++) {

      var currentTime = new Date().toString().slice(16, 21);
      currentTime = parseInt(currentTime.replace(":", ""));

      var start = parseInt(shifts[i].starttime.replace(":", ""));
      var end = parseInt(shifts[i].endtime.replace(":", ""));

      //console.log(i, shifts[i], currentTime, start, end);
      // Fix time for compare.
      if (end < start) {

        end += 2400;

        if (!((currentTime >= start) && (currentTime <= end)))
          currentTime += 2400;
      }

      if (currentTime < end && currentTime >= start) {
        shiftName = shifts[i].name;
        break;
      }

    }

    return shiftName;
  }

  getFrameSerial() {
    var frames = this.frames;
    var serial = null;
    let lastLogs = JSON.parse(localStorage.getItem('lastLogs'));

    frames.forEach(frame => {
      if (this.selectedFrame.id == frame.id) {
        //console.log(lastLogs[0].shiftnumber, getShift())
        if (lastLogs && lastLogs[0] && lastLogs[0].shiftnumber && lastLogs[0].shiftnumber != this.getShift()) {
          serial = frame.serialstart;
        } else if (lastLogs && lastLogs[0] && lastLogs[0].framenumber > 0) {
          console.log('framesearch for each---', frame.serial);
          serial = parseInt(lastLogs[0].framenumber) + 1;
        } else {
          serial = frame.serial > 0 ? (parseInt(frame.serial) + 1) : frame.serialstart;
        }
      }

    });

    return serial;
  }

  getFrameCode(date, frameSerial) {
    var dd = date.getDate();
    var mm = date.getMonth() + 1; //January is 0!

    var yyyy = date.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    return 'MMT ' + dd + '-' + mm + '-' + yyyy.toString().substr(2) + '-' + this.getShift() + '' + frameSerial;
  }
}

new Modbus();
