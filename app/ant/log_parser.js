/*
 * Copyright (c) 2017 Inside Ride Technologies, LLC. All Rights Reserved.
 * Author: Jason De Lorme (jason@insideride.com)
 *
 * Parses serial messages from ANT device log (i.e. Device0.txt).  
 */

//const ANTLogParser = function() { 
//    var self = this;

    // Sample line to parse looks like this:
    //    135.031 { 673362484} Rx - [A4][09][4E][00][19][2A][FF][C0][00][39][00][31][E7]

//    ANTLogParser.prototype.open = open;
//};

//module.exports = ANTLogParser;

const antlib = require('../ant/antlib.js');
//const fs = require('fs');
const jetpack = require('fs-jetpack');

function open(path) {
    console.log("open log file: ", path);

    var data = jetpack.read(path);
    var lines = data.split('\n');
    
    lines.forEach(function(element, index, array) {
        var record = element.split('-'); // Splits into timestamp and hex bytes ascii chars.
        if (record != null && record.length >= 2) {

            var transmitType = record[0].slice(24, 25); // can be Rx or Tx
            // Don't process transmits, only recieves. 
            if (transmitType == 'R') {
                var timestamp = parseTimeStamp(record[0]);
                var hexBytes = parseHexBytes(record[1]);
                //console.log(timestamp, hexBytes);

                antlib.parseLogLine(hexBytes, timestamp);
            }
        }
    });
}

// Parses serial transmission byte array from the log line.
function parseHexBytes(data) {
    // data =    135.031 { 673362484} Rx - [A4][09][4E][00][19][2A][FF][C0][00][39][00][31][E7]
    // hexBytes = [A4][09][4E][00][19][2A][FF][C0][00][39][00][31][E7]

    // Strip down to just the elements.    
    var record = data.slice(2, data.lastIndexOf(']'))

    // Convert ascii hex into actual hex value.
    var hex = record.split('\]\[');
    var hexBytes = new Array(hex.length);
    for (var i = 0; i < hex.length; i++) {
        hexBytes[i] = parseInt(hex[i], 16);
    }

    return hexBytes;
}

// Parses time in fractional seconds from the log line.
function parseTimeStamp(data) {
    // data =   135.031 { 673362484} Rx - [A4][09][4E][00][19][2A][FF][C0][00][39][00][31][E7]
    // time =   135.031
    var stop = data.indexOf('{');
    var time = 0.0;

    if (stop > 1) {
        time = parseFloat(data.slice(0, stop - 1));
    }
    
    return time;
}

exports.open = open;