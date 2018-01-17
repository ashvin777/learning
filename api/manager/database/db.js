const sqlite3 = require('sqlite3').verbose();

module.exports = new sqlite3.Database('./database/application.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
});;