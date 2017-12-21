/*
 * Copyright (c) 2017 Inside Ride Technologies, LLC. All Rights Reserved.
 * Author: Jason De Lorme (jason@insideride.com)
 *
 * Module that decodes messages and issues commands for the ANT+ Bike Power protocol. 
 */

// Set this up as an event emitter.
const util = require('util');
const EventEmitter = require('events').EventEmitter;

const AntBackgroundScanner = function() { 
    var self = this;
    const antlib = require('./antlib.js');
    var bgScanChannelEventBuffer = new Buffer(antlib.MESG_MAX_SIZE_VALUE);

    function parseDeviceInfo(timestamp) {
        var deviceInfo = { 
            deviceId: bgScanChannelEventBuffer[10] | (bgScanChannelEventBuffer[11] << 8), 
            deviceType: bgScanChannelEventBuffer[12], 
            manufacturerId: 0,
            timestamp: timestamp
        };

        var messagedId = bgScanChannelEventBuffer[1];
        if (messagedId == antlib.MANUFACTURER_PAGE) {
            var page = antlib.parseManufacturerInfo(bgScanChannelEventBuffer);
            deviceInfo.manufacturerId = page.manufacturerId;
            console.log("MANUFACTURER_PAGE:", deviceInfo);
        }

        return deviceInfo;
    }

    function bgScanChannelEvent(channelId, eventId, timestamp) {
        // console.log("bg scan:", bgScanChannelEventBuffer);
        self.emit('deviceInfo', parseDeviceInfo(timestamp));        
    }

    function openChannel() {
        // Configure the channel.
        const BG_SCANNER_CHANNEL_CONFIG = { 
            channelType: 0, 
            deviceId: 0, 
            deviceType: 0, 
            transmissionType: 0, 
            frequency: 0, 
            channelPeriod: 0, 
            channelCallback: bgScanChannelEvent,
            buffer: bgScanChannelEventBuffer,
            status: 0
        };

        antlib.openBackgroundScanningChannel(BG_SCANNER_CHANNEL_CONFIG);
    }

    function closeChannel() {
        antlib.closeChannel(antlib.BG_SCANNING_CHANNEL_ID);
    }

    AntBackgroundScanner.prototype.openChannel = openChannel;
    AntBackgroundScanner.prototype.closeChannel = closeChannel;
};

util.inherits(AntBackgroundScanner, EventEmitter);
module.exports = AntBackgroundScanner;
