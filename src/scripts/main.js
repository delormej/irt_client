import React from 'react';
import ReactDOM from 'react-dom';
import Main from '../views/main';
import ErrorBoundry from '../views/errorBoundry.jsx';
import antlib from '../lib/ant/antlib.js';

const remote = require('electron').remote;

window.onload = function(){
  ReactDOM.render(<ErrorBoundry><Main /></ErrorBoundry>, 
    document.getElementById('app'));

  document.getElementById("closeBtn").addEventListener("click", function (e) {
      //antlib.close();
      uploadAntLog();
      archiveAntLog();
      //var window = remote.getCurrentWindow();
     // window.close();      
  }); 
}

function closeWindow() {
  var window = remote.getCurrentWindow();
  window.close();
}

function onUploadComplete(error, result, response) {
  if (error)
    console.log('Upload error:', error.message);
  else
    console.log('File uploaded:',  result);
  
  //closeWindow();
}

function uploadAntLog() {
  // Docs on how to use Azure node sdk here: https://azure.github.io/azure-storage-node/
  var azure = require('azure-storage');
  // This is the blog that I used to figure out how to create a SAS: https://buildazure.com/2017/05/23/azure-cli-2-0-generate-sas-token-for-blob-in-azure-storage/
  // Note that blog lists how to create SAS for a specific blob (File), switch to "container":
  // az storage container generate-sas --account-name irt8413 --account-key xxx --name rides --permissions w --expiry 2020-01-01
  var sas = "?sv=2019-02-02&ss=bfqt&srt=sco&sp=rwdlacup&se=2020-04-12T08:26:53Z&st=2020-04-12T00:26:53Z&spr=https&sig=C7BWGQBeK16oX8KezTt%2Fv%2B%2Fn6Q%2FKLTu8FJnasinJ0js%3D";
  var url = "https://irt8413.blob.core.windows.net/";
  var containerName = "rides";
  var uploadFileName = getLogFilename();
  var localFileName =  getLocalFilename();
  if (localFileName == null || localFileName == "") {
    console.log("Unable to find local log file.")
    return;
  }
  var connectionString = "BlobEndpoint=" + url + ";SharedAccessSignature=" + sas;
  var blobService = azure.createBlobService(connectionString);

  console.log("Attempting upload of " + localFileName);

  blobService.createBlockBlobFromLocalFile(containerName, uploadFileName, localFileName, 
    onUploadComplete);
}

function getLogFilename() {
  var name = "Device-" + new Date().toISOString().replace(/:|\.|-/g,'') + '.txt';
  return name;
}

function archiveAntLog() {
  // moves the ant log file so that the next run will create a new file.
  // admittedly, this who process could be easier if we just renamed the file first and used 
  // that to upload, however minimizing changes for now.
  console.log("Attempting to rename");
  var fs = require('fs');
  //fs.renameSync(getLocalFilename(), getLogFilename());
}

function getLocalFilename() {
  var fs = require('fs');
  const fileRegEx = /Device\d+\.\w{3}/i;
  var lastStat = null;
  var newest = "";

  var files = fs.readdirSync(".");
  files.forEach(function (file) {
    if (fileRegEx.test(file)) {
      var stat = fs.statSync(file);
      if (lastStat == null) {
        lastStat = stat;
        newest = file;
      }
      else {
        if (stat.atime > lastStat.atime)
          lastStat = stat;
          newest = file;
      }
    }
  });
  console.log("filename", lastStat, newest);
  if (lastStat != null)
    return newest;
  return "";
}