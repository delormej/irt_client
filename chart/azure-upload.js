/*
 * Copyright (c) 2017 Inside Ride Technologies, LLC. All Rights Reserved.
 * Author: Jason De Lorme (jason@insideride.com)
 * Requires: Node.js v4.x or greater.
 *
 * Simple test harness to upload file to Azure blob storage.
 */

require('process')
const fs = require('fs');
const path = require('path');
const azure = require('azure-storage');
const commandLineArgs = require('command-line-args');

var cli = commandLineArgs([
    { name: 'file', alias: 'f', description: 'Path of local file to upload.' },
    { name: 'output', alias: 'o', type: String, defaultValue: '', description: 'Specify a different destination filename.' }
]);

//
// More details on how to use nodejs Azure SDK here: // https://azure.github.io/azure-storage-node/
//
// If connection string not specified, it will look for environment variables.
//  
const connectionString = "DefaultEndpointsProtocol=https;AccountName=irt8413;AccountKey=0yDq7ZYiSWueD7bfVQVKk7qEr8NWIUb2tYNgJ7Q5l4PxAY8ZZ1ubof1hxOFZ23jtyQ3cYSBaS9H0zw5ecjyzpw==;EndpointSuffix=core.windows.net";

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

main();