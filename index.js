const express = require('express'),
  path = require('path'),
  bodyParser = require('body-parser'),
  sql = require('./api/sql');

const port = 3000;

express()
  .use(bodyParser.urlencoded({
    extended: true
  }))
  .use(bodyParser.json())
  .use((req, res, next) => next())
  .post('/sql', sql)
  .use(express.static(__dirname + '/ui'))
  .listen(port, () => {
    console.log("Server has been started on:", port);
  });