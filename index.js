const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/application.db');
const fs = require('fs');
const sqlScriptCreate = fs.readFileSync('./database/sql/create_tables.sql', 'utf8');

db.serialize(function () {
  db.run(sqlScriptCreate);
});

db.close();