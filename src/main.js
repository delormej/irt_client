import { app, BrowserWindow } from 'electron';

let mainWindow = null;

function preventShutdown() {
  // Prevent windows from going to sleep while the app is running.
  if (process.platform === 'win32') {
    const win_utility = require('./lib/win_utility.js')
    win_utility.preventShutdown();
  }
}

app.on('window-all-closed', () => {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  mainWindow = new BrowserWindow({width: 1440, height: 1080});
  mainWindow.loadURL('file://' + __dirname + '/index.html');
  // mainWindow.setFullScreen(true); // if we don't want the title bar,min,max,close buttons.
  mainWindow.maximize();
  // Disable the menubar
  // mainWindow.setMenu(null)  
  // mainWindow.webContents.openDevTools();
  preventShutdown();
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});
