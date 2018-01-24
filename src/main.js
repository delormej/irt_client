import { app, BrowserWindow } from 'electron';

let path = require('path');
let mainWindow,
    loadingScreen,
    windowParams = {
        icon: path.join( __dirname + './images/logo_16x16.png'),
        show: false
    };


function preventShutdown() {
  // Prevent windows from going to sleep while the app is running.
  if (process.platform === 'win32') {
    const win_utility = require('./lib/win_utility.js')
    win_utility.preventShutdown();
  }
}

function createLoadingScreen() {
  loadingScreen = new BrowserWindow(Object.assign(windowParams, {frame: false, width: 400, height: 400, parent: mainWindow}));
  loadingScreen.setMenu(null);
  loadingScreen.loadURL('file://' + __dirname + '/loading.html');
  loadingScreen.on('closed', () => loadingScreen = null);
  loadingScreen.webContents.on('did-finish-load', () => {
      loadingScreen.show();
  });
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow(windowParams);

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  // mainWindow.setProgressBar(-1); // hack: force icon refresh
  mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.setMenu(null);
      //mainWindow.maximize();
      mainWindow.setFullScreen(true);
      mainWindow.show();

      if (loadingScreen) {
          let loadingScreenBounds = loadingScreen.getBounds();
          mainWindow.setBounds(loadingScreenBounds);
          loadingScreen.close();
      }
  });

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null;
  })
}

app.on('window-all-closed', () => {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  createLoadingScreen();
  createWindow();
  preventShutdown();
});

app.on('activate', function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
      createWindow();
  }
})
