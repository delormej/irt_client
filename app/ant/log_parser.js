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

/**
 * Asyncronously parses ANT device log file.
 * 
 * @param {*} path          ANT device log file to parse.
 * @param {*} offset        Offset index to start parsing at, if resuming.
 * @param {*} onEndOfRide   CallBack function (path, length, lastIndexParsed)
 */
function parseAsync(path, offset, onEndOfRide) {
    jetpack.readAsync(path).then((data) => {
        var lines = data.split('\n');
        // Jump ahead to the offset.
        if (offset > 0) {
            lines = lines.slice(offset);
            console.log("Staring at line: ", offset);
        }
        var lastTimestamp = 0;
        var index = offset;
        var len = lines.length;
        for (; index < len; index++) {
            var record = lines[index].split('-'); // Splits into timestamp and hex bytes ascii chars.
            if (record != null && record.length >= 2) {
                var transmitType = record[0].slice(24, 25); // can be Rx or Tx
                var timestamp = parseTimeStamp(record[0]);

                // We've hit the end of a ride.
                if (timestamp < lastTimestamp) {
                    // Callback function to indicate end of ride and exit the function.
                    console.log("Reached the end of a ride.", lastTimestamp, timestamp, index, lines.length);
                    break;
                }

                // Don't process transmits, only recieves. 
                if (transmitType == 'R') {
                    var hexBytes = parseHexBytes(record[1]);
                    // record last timestamp for comparison.
                    lastTimestamp = timestamp; 
                    antlib.parseLogLine(hexBytes, timestamp);
                }
            }
        }

        // We're done parsing.
        onEndOfRide(path, lines.length, index);
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

exports.parseAsync = parseAsync;