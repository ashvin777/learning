const fs = require('fs');
const db = require('./db');
const sql = fs.readFileSync('./database/sql/create_tables.sql', 'utf8');

db.serialize(function () {
  db.run(sql);
});

db.close();


