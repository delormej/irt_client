import React from 'react';
import ReactDOM from 'react-dom';
import Main from '../views/main';
import ErrorBoundry from '../views/errorBoundry.jsx';

const remote = require('electron').remote;

window.onload = function(){
  ReactDOM.render(<ErrorBoundry><Main /></ErrorBoundry>, 
    document.getElementById('app'));

  document.getElementById("closeBtn").addEventListener("click", function (e) {
      //upload();
      var window = remote.getCurrentWindow();
      window.close();      
  }); 
}

function upload() {
  // Docs on how to use Azure node sdk here: https://azure.github.io/azure-storage-node/
  var azure = require('azure-storage');
  // This is the blog that I used to figure out how to create a SAS: https://buildazure.com/2017/05/23/azure-cli-2-0-generate-sas-token-for-blob-in-azure-storage/
  // Note that blog lists how to create SAS for a specific blob (File), switch to "container":
  // az storage container generate-sas --account-name irt8413 --account-key xxx --name rides --permissions w --expiry 2020-01-01
    var sas = "se=2020-01-01&sp=w&sv=2017-07-29&sr=c&sig=/czaS/1tXZbewLOjC27a5VIapkOaO4iqbxkiZ0B/kLU%3D";
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

  blobService.createBlockBlobFromLocalFile(containerName, uploadFileName, localFileName, 
    function(error, result, response)  
    {
      if (error)
        console.log(error.message);
      console.log('File uploaded:',  result);
      var window = remote.getCurrentWindow();
      window.close();      
    }
  );
}

function getLogFilename() {
  var name = "Device-" + new Date().toISOString().replace(/:|\.|-/g,'') + '.txt';
  return name;
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