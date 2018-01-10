/*
 * Copyright (c) 2016 Inside Ride Technologies, LLC. All Rights Reserved.
 * Author: Jason De Lorme (jason@insideride.com)
 *
 * Module that decodes messages and issues commands for the ANT+ Bike Power protocol. 
 */

// Set this up as an event emitter.
const util = require('util');
const EventEmitter = require('events').EventEmitter;
const AntCtfOffset = require('../ant/AntCtfOffset.js');
const ANT_BP_CHANNEL_ID = 2;

const AntBikePower = function() { 
    var self = this;
    const antlib = require('./antlib.js');
    
    const bpChannelEventBuffer = new Buffer(antlib.MESG_MAX_SIZE_VALUE);
    //const transmitBuffer = new Buffer(antlib.ANT_STANDARD_DATA_PAYLOAD_SIZE);
    var ctfOffset = new AntCtfOffset();

    const STANDARD_POWER_ONLY_PAGE = 0x10;
    const CTF_MAIN_PAGE = 0x20;
    const CTF_CALIBRATION_PAGE = 0x01;

    // Keep a running accumuation.
    var accumulatedPower = 0;
    var eventCount = 0;
    var lastCtfMainPage = null;
    var cadenceTimeout = 0;
    const CTF_CADENCE_TIMEOUT = 12;
    
    var bpChannelId = 0;

    // Accumulates power beyond the 16 bits.
    function getAccumulatedPower(power) {   
        accumulatedPower = antlib.accumulateDoubleByte(accumulatedPower, power);
        return accumulatedPower;
    }

    // Calculates and return watts from Crank Torque Frequency message.
    // Returns an object with cadence and watts.  Values are -1 if no events to report from.
    function calclateCtf(ctfPage) {
        var watts = 0;
        var cadence = 0;
        
        if (lastCtfMainPage != null) {
            var elapsedTime = antlib.getDeltaWithRollover16(
                lastCtfMainPage.timestamp, 
                ctfPage.timestamp);
            var events = antlib.getDeltaWithRollover16(
                lastCtfMainPage.eventCount, 
                ctfPage.eventCount);                
            
            if (events < 1) {
                // If no new events, keep track until we have a cadence time out.

                if (++cadenceTimeout >= CTF_CADENCE_TIMEOUT) {
                    // Cadence timed out.
                    watts = 0;
                    cadence = 0;
                }
                else {
                    // Signal to ignore watts, we haven't accumulated a new event yet.
                    return null;
                }
            }
            else {
                cadenceTimeout = 0;

                var cadence_period = (elapsedTime / events) * 0.0005; // Seconds
                cadence = 60/cadence_period; // RPMs
                var torque_ticks = antlib.getDeltaWithRollover16(
                    lastCtfMainPage.torque_ticks, 
                    ctfPage.torque_ticks);

                // The average torque per revolution of the pedal is calculated using the calibrated Offset parameter.
                var torque_frequency = (1.0 / ( (elapsedTime* 0.0005) /torque_ticks)) - ctfOffset.getOffset(); // hz
            
                // Torque in Nm is calculated from torque rate (Torque Frequency) using the calibrated sensitivity Slope
                var torque = torque_frequency / (ctfPage.slope/10);
            
                // Finally, power is calculated from the cadence and torque.
                watts = torque * cadence * (Math.PI/30); // watts            
            }
        }

        // Store last message for next calculation.
        lastCtfMainPage = ctfPage;

        // Create a new object.
        return { 
            instantPower : Math.round(watts), 
            instantCadence : Math.round(cadence)
        };
    }

    // Accumulates event count beyond the 8 bits.
    function getEventCount(events) {
        eventCount = antlib.accumulateByte(eventCount, events);
        return eventCount;
    }

    // Keep track of the channel's status.
    function getChannelStatus() {
        return BP_CHANNEL_CONFIG.status;
    }

    function getDeviceId() {
        return BP_CHANNEL_CONFIG.deviceId;
    }

    // Parse ANT+ message for power.
    function parseStandardPowerOnly() {
        var page = { 
            eventCount : getEventCount(bpChannelEventBuffer[2]),
            // pedalPower : future implement
            instantCadence : bpChannelEventBuffer[4],
            accumulatedPower : getAccumulatedPower(bpChannelEventBuffer[6] << 8 |
                bpChannelEventBuffer[5]),
            instantPower : bpChannelEventBuffer[8] << 8 | bpChannelEventBuffer[7]   
        };
        
        return page;
    }

    // Parses ANT+ Crank Torque Frequency Main page.
    function parseCTFMain() {
        var page = {
            eventCount : bpChannelEventBuffer[2],
            slope : bpChannelEventBuffer[3] << 8 | bpChannelEventBuffer[4],
            timestamp : bpChannelEventBuffer[5] << 8 | bpChannelEventBuffer[6],
            torque_ticks : bpChannelEventBuffer[7] << 8 | bpChannelEventBuffer[8]
        };

        // Return a new object that just has watts.
        return calclateCtf(page);
    }

    // Parses ANT+ Crank Torque Frequency calibration page.
    function parseCTFCalibration(timestamp) {
        var page = {
            calibration_id : bpChannelEventBuffer[2],
            ctf_defined_id : bpChannelEventBuffer[3],
            offset : bpChannelEventBuffer[7] << 8 | bpChannelEventBuffer[8]
        };

        if (page.calibration_id == 0x10 && page.ctf_defined_id == 0x01) {
            ctfOffset.isValidSample(page.offset, timestamp);
        }

        return page;
    }

    // Function called back by the ant library when a message arrives.
    function bpChannelEvent(channelId, eventId, timestamp) { 
        switch(eventId) {
            case antlib.EVENT_RX_BROADCAST:
            case antlib.EVENT_RX_FLAG_BROADCAST:
                ensureDeviceTracking();
                var messagedId = bpChannelEventBuffer[1];
                switch (messagedId) {
                    case STANDARD_POWER_ONLY_PAGE:
                        self.emit('standardPowerOnly', parseStandardPowerOnly(), 
                            timestamp);
                        break;
                    case CTF_MAIN_PAGE:
                        var page = parseCTFMain();
                        if (page != null) {
                            self.emit('ctfMainPage', page, 
                                timestamp);    
                        }        
                        break;
                    case CTF_CALIBRATION_PAGE:
                        self.emit('ctfCalibrationPage', parseCTFCalibration(timestamp), 
                            timestamp);                
                    break;
                    case antlib.PRODUCT_PAGE:
                        self.emit('productInfo', 
                            antlib.parseProductInfo(bpChannelEventBuffer), timestamp);
                        break;
                    case antlib.MANUFACTURER_PAGE:
                        self.emit('manufacturerInfo', 
                            antlib.parseManufacturerInfo(bpChannelEventBuffer), timestamp);
                        break;                
                    default:
                        //console.log('Unrecognized message.', messagedId);
                        break;
                }
                break;
            case antlib.EVENT_RX_FAIL_GO_TO_SEARCH:
            case antlib.EVENT_RX_SEARCH_TIMEOUT:
                updateChannelStatus(antlib.STATUS_SEARCHING_CHANNEL);
                break;
            case antlib.EVENT_CHANNEL_CLOSED:
                updateChannelStatus(antlib.STATUS_ASSIGNED_CHANNEL);
                break;
            default: // eventId
                console.log('Unrecognized event.', eventId);
                break;                
        }
    }

    function updateChannelStatus(status) {
        BP_CHANNEL_CONFIG.status = status;
        self.emit('channel_status', status, BP_CHANNEL_CONFIG.deviceId);        
    }

    function ensureDeviceTracking() {
        if (BP_CHANNEL_CONFIG.status != antlib.STATUS_TRACKING_CHANNEL) 
            antlib.requestChannelId(ANT_BP_CHANNEL_ID);
    }        

    // Configure the channel.
    const BP_CHANNEL_CONFIG = { 
        channelType: 0, 
        deviceId: 0, 
        deviceType: 0x0B, 
        transmissionType: 0, 
        frequency: 57, 
        channelPeriod: 8182, 
        channelCallback: bpChannelEvent,
        buffer: bpChannelEventBuffer,
        channelIdCallback: function() { updateChannelStatus(antlib.STATUS_TRACKING_CHANNEL); },
        status: 0
    };
    
    function openChannel(deviceId) {
        antlib.init();        
        if (deviceId != null) {
            BP_CHANNEL_CONFIG.deviceId = deviceId;
        }
        bpChannelId = antlib.openChannel(ANT_BP_CHANNEL_ID, BP_CHANNEL_CONFIG);     
    }

    function closeChannel() {
        let status = getChannelStatus();
        if (status == antlib.STATUS_TRACKING_CHANNEL || 
            status == antlib.STATUS_SEARCHING_CHANNEL) {
            antlib.closeChannel(bpChannelId);
        }
    }

    AntBikePower.prototype.openChannel = openChannel;
    AntBikePower.prototype.closeChannel = closeChannel;
    AntBikePower.prototype.getChannelStatus = getChannelStatus;
    AntBikePower.prototype.getDeviceId = getDeviceId;
};

util.inherits(AntBikePower, EventEmitter);
module.exports = AntBikePower;
