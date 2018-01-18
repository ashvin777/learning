const express = require('express'),
  path = require('path'),
  bodyParser = require('body-parser'),
  sql = require('./api/sql'),
  url = require('url');

const {
  app,
  BrowserWindow
} = require('electron');

console.log(require('electron'));

const port = 3000;

let win;

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
    createWindow();
  });

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600
  });

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, '/ui/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  win.webContents.openDevTools()

  win.on('closed', () => {
    win = null
  });
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});