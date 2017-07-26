var fs = require('fs');
var azure = require('azure-storage');

// var accountName = "irt8413";
// var accessKey = "0yDq7ZYiSWueD7bfVQVKk7qEr8NWIUb2tYNgJ7Q5l4PxAY8ZZ1ubof1hxOFZ23jtyQ3cYSBaS9H0zw5ecjyzpw==";
var connectionString = "DefaultEndpointsProtocol=https;AccountName=irt8413;AccountKey=0yDq7ZYiSWueD7bfVQVKk7qEr8NWIUb2tYNgJ7Q5l4PxAY8ZZ1ubof1hxOFZ23jtyQ3cYSBaS9H0zw5ecjyzpw==;EndpointSuffix=core.windows.net";
var blobService = azure.createBlobService(connectionString);

blobService.createBlockBlobFromLocalFile('vhds', 'output3.json', '../build/output3.json', function(error, result, response) {
  if (!error) {
    // file uploaded
    console.log(result);
  }
});

/*
// http://azure.github.io/azure-sdk-for-node/azure-storage-legacy/latest/blob_blobservice.js.html
var blobService = new BlobService(storageAccountOrConnectionStringopt, storageAccessKeyopt, hostopt, authenticationProvideropt)

fs.createReadStream('task1-upload.txt').pipe(blobService.createBlob('taskcontainer', 'task1', storage.Constants.BlobConstants.BlobTypes.BLOCK));
*/