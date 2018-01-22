const express = require('express'),
  path = require('path'),
  bodyParser = require('body-parser'),
  sql = require('./api/sql'),
  storage = require('./api/storage'),
  url = require('url'),
  exec = require('child_process').exec,
  listenPort = 3000;

require('./api/platform');
  
express()
  .use(bodyParser.urlencoded({
    extended: true
  }))
  .use(bodyParser.json())
  .use((req, res, next) => next())
  .post('/sql', sql)
  .get('/storage', storage.get)
  .post('/storage', storage.set)
  .use(express.static(__dirname + '/ui'))
  .listen(listenPort, () => {
    console.log("Server has been started on:", listenPort);	
  });
  