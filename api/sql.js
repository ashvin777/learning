const db = require('./db');

module.exports = function (req, res) {

  let query = req.body.query;
  console.log(query);

  db.all(query, (err, rows) => {
    if (err) {
      res.send(503, JSON.stringify(err));
      return;
    }
    res.send(200, rows);
  });

};