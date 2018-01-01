/*
 * Copyright (c) 2017 Inside Ride Technologies, LLC. All Rights Reserved.
 * Author: Jason De Lorme (jason@insideride.com)
 * Requires: Node.js v4.x or greater.
 *
 * Simple test harness to upload file to Azure blob storage.
 */

require('process')
// const fs = require('fs');
// const path = require('path');
const azure = require('azure-storage');
// const commandLineArgs = require('command-line-args');

// var cli = commandLineArgs([
//     { name: 'file', alias: 'f', description: 'Path of local file to upload.' },
//     { name: 'output', alias: 'o', type: String, defaultValue: '', description: 'Specify a different destination filename.' }
// ]);

//
// More details on how to use nodejs Azure SDK here: // https://azure.github.io/azure-storage-node/
//
// If connection string not specified, it will look for environment variables.
//  
const connectionString = "";

function upload(container, destinationFileName, sourceFilename) {
  var blobService = azure.createBlobService(connectionString);

  blobService.createBlockBlobFromLocalFile(container, destinationFileName, sourceFilename, 
    function(error, result, response) {
      if (!error) {
        // file uploaded
        console.log(result);
      }
  });
}

/*
function main() {
    console.log("Uploading...", cli);

    // Required inputs:
    var container = 'vhds';
    var sourceFilename = cli.file; //'../build/output3.json';
    var destinationFileName = cli.output //'output3.json'; 

    if (sourceFilename == null) {
        //console.log(cli.getUsage());
        console.log("ERROR: please provide filename.");
        return;
    } else if (destinationFileName === '') {
        // If no destination, just strip path and use the same filename.
        destinationFileName = path.basename(sourceFilename);
    }

    upload(container, destinationFileName, sourceFilename);
}
*/

exports.azure_upload = upload;
