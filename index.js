const express = require('express'),
  path = require('path'),
  bodyParser = require('body-parser'),
  sql = require('./api/sql'),
  url = require('url'),
  port = 3000,
  {
    app,
    BrowserWindow,
    Menu,
    MenuItem
  } = require('electron');

app.on('ready', () => {

    let win = new BrowserWindow({
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: false
      },
      title: "Pilosol App",
      fullscreenable: true,
      width: 1224,
      height: 968,
      icon: path.join(__dirname + "/icons/64x64.png")
    });

    // and load the index.html of the app.
    win.loadURL(url.format({
      title: 'Application',
      pathname: path.join(__dirname, '/ui/index.html'),
      protocol: 'file:',
      slashes: true
    }));

    var webContents = win.webContents;

    webContents.on('did-get-response-details', function (event, status, newURL, originalURL, httpResponseCode) {
      if ((httpResponseCode == 404) && (newURL == ("http://localhost:" + listenPort + url))) {
        setTimeout(webContents.reload, 200);
      }
      Menu.setApplicationMenu(Menu.buildFromTemplate([{
        label: 'Application'
      }]));
    });

    win.on('closed', () => {
      win = null
    });
  })
  .on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  });

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