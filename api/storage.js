const localStorage = require('./localstorage');

exports.get = function (req, res) {
  res.send(200, localStorage.getItem(req.query.key));
};

exports.set = function (req, res) {
  localStorage.setItem(req.body.key, JSON.stringify(req.body.value));
  res.send(200, '');
};