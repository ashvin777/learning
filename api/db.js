const sqlite3 = require('sqlite3').verbose(),
  fs = require('fs'),
  csvjson = require('csvjson'),
  createSql = fs.readFileSync('./api/sql/create_tables.sql', 'utf8'),
  frames = fs.readFileSync('./data/csv/frames.csv', 'utf8'),
  components = fs.readFileSync('./data/csv/components.csv', 'utf8'),
  users = fs.readFileSync('./data/csv/users.csv', 'utf8'),
  db = new sqlite3.Database('./data/database.sqlite');

db.serialize(function () {

  let sqlStatments = createSql.split(';')

  console.log('INFO: Create Tables');
  sqlStatments.forEach((sql) => {

    db.all(sql, {}, (err, row) => {
      if (err) {
        console.info('INFO: Database create failed. Seems database is already installed');
        return;
      }
    });

  });

  console.log('INFO: Adding Frames Data in FRAMES Table');

  insertIntoTable('frames', frames, (row) => {
    return `${row.id}, '${row.name}', '${row.number}'`;
  });

  insertIntoTable('components', components, (row) => {
    return `${row.id}, '${row.name}', '${row.number}', ${row.frameid}`;
  });

  insertIntoTable('users', users, (row) => {
    return `${row.id}, '${row.username}', '${row.password}'`;
  });

});

function insertIntoTable(table, csvText, values) {
  let csv = csvjson.toObject(csvText);

  csv.forEach((row) => {
    let query = `INSERT into ${table}(${Object.keys(row).join(',')}) values(${values(row)})`;

    //console.log(query);
    db.all(query, {}, (err, res) => {
      if (err) {
        //console.error('ERROR: Not able to insert the frame data', err);
      }
    });
  });
}

//db.close();

module.exports = db;