/*
 * Copyright (c) 2017 Inside Ride Technologies, LLC. All Rights Reserved.
 * Author: Jason De Lorme (jason@insideride.com)
 *
 * Parses serieal messages from ANT device log (i.e. Device0.txt).  Sends this
 */

const ANTLogParser = function() { 
    var self = this;

    // Sample line to parse looks like this:
    //    135.031 { 673362484} Rx - [A4][09][4E][00][19][2A][FF][C0][00][39][00][31][E7]

    

    function hello() {
        console.log("hello");
    }

    ANTLogParser.prototype.hello = hello;
};

module.exports = ANTLogParser;
