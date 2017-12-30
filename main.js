import { app, BrowserWindow } from 'electron';

let mainWindow = null;

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
  // Disable the menubar (production only).
  // mainWindow.setMenu(null)  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});
