const csvjson = require('csvjson');
const db = require('./db');
const fs = require('fs');

const frames = fs.readFileSync('database/data/frames.csv', 'utf8');

db.serialize(function () {
  var result = csvjson.toObject(frames);
});

db.close();