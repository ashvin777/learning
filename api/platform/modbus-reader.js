var waitForPort = require('wait-for-port'),
  WebSocket = require('ws'),
  db = require('../db'),
  localStorage = require('../localstorage');

class Modbus {

  constructor() {
    this.prevStopSignal = false;
    this.ws = null;
    this.selectedFrame = {};
    waitForPort('localhost', 1880, this.nodeRedActivated.bind(this));
  }

  nodeRedActivated() {
    this.ws = new WebSocket('ws://localhost:1880/ws/modbus');
    this.wsLogs = new WebSocket('ws://localhost:1880/ws/logs');

    this.ws.on('open', open => {
      console.log('modbus-reader connected...');
    });

    this.ws.on('message', this.onMessage.bind(this));
  }

  onMessage(message) {
    let signals = JSON.parse(message);
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
    signals = signals.splice(16, this.frames.length);

    if (this.getShift() && this.getFrameSerial() > 0) {

      console.log('Generating logs... shift and frame serial is valid');
      let frameSerial = this.getFrameSerial();
      let isValid = signals.every(comp => {
        return comp === true;
      });

      if (!isValid) {
        frameSerial = frameSerial - 1;
      }

      this.logs = [];

      this.components.forEach((comp, index) => {
        if (isValid && index == 0) {
          console.log('Valid sceneario...', this.getShift());
          this.logs.push({
            frametype: selectedFrame ? selectedFrame.name : '',
            framenumber: isValid ? frameSerial : '---',
            frameid: selectedFrame.id,
            framecomponent: 'ALL',
            shiftnumber: this.getShift(),
            processingtime: "",
            status: signals[index] === true ? "PRESENT" : "ABSENT",
            timestamp: new Date(),
            framedynamiccode: this.getFrameCode(new Date(), frameSerial)
          });
        } else if (!isValid && signals[index] == false) {
          console.log('Invalid sceneario...');
          this.logs.push({
            frametype: selectedFrame ? selectedFrame.name : '',
            framenumber: isValid ? frameSerial : '---',
            frameid: selectedFrame.id,
            framecomponent: (index + 1) + ":" + comp.name,
            shiftnumber: this.getShift(),
            processingtime: "",
            status: signals[index] === true ? "PRESENT" : "ABSENT",
            timestamp: new Date(),
            framedynamiccode: '---'
          });
        }

        localStorage.setItem('lastLogs', JSON.stringify(this.logs));
      });

      this.selectedFrame.serial = frameSerial;
      localStorage.setItem('selectedFrame', JSON.stringify(this.selectedFrame));

      //add log into table
      this.logs.forEach(this.addLogsIntoTable.bind(this));

      this.generateHex();
    }
  }

  addLogsIntoTable(log) {
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
    let hex = '';//hex_to_ascii("1B");
    let str = '';
    str += hex + "M001;" + hex + "B000;" + hex + "U";
    //data
    str += lastLogs[0].framedynamiccode + ";" ;
   //ending 
    str += hex + "Z;";
      
    this.ws.send(str);
    this.wsLogs.send('{ "id": 10}');
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
