/*
 * Copyright (c) 2016 Inside Ride Technologies, LLC. All Rights Reserved.
 * Author: Jason De Lorme (jason@insideride.com)
 *
 * Module that decodes messages and issues commands for the ANT+ FE-C protocol. 
 */

// Set this up as an event emitter.
const util = require('util');
const EventEmitter = require('events').EventEmitter;

const AntFec = function() { 
    var self = this;
        
    const antlib = require('./antlib.js');
    
    const fecChannelEventBuffer = new Buffer(antlib.MESG_MAX_SIZE_VALUE);
    const transmitBuffer = new Buffer(antlib.ANT_STANDARD_DATA_PAYLOAD_SIZE);

    const BASIC_RESISTANCE_PAGE = 0x30;
    const TARGET_POWER_PAGE = 0x31;
    const WIND_RESISTANCE_PAGE = 0x32;
    const TRACK_RESISTANCE_PAGE = 0x33;
    const FE_CAPABILITIES_PAGE = 0x36;
    const USER_CONFIGURATION_PAGE = 0x37;
    const GENERAL_FE_DATA_PAGE = 0x10;
    const GENERAL_SETTINGS_PAGE = 0x11;
    const SPECIFIC_TRAINER_DATA_PAGE = 0x19;
    const COMMAND_STATUS_PAGE = 0x47;
    const IRT_EXTRA_INFO_PAGE =	0xF1;   // Manufacturer specific page sending servo position, etc...
    const IRT_SETTINGS_PAGE	= 0xF2;   // Manufacturer specific page sending device specific settings.

    // Enum of device status.
    const FEStateEnum = {
        ASLEEP : 1,
        READY : 2,
        IN_USE : 3,
        FINISHED : 4 
    };

    // Possible values for command status.
    const CommandStatuEnum = {
        PASS : 0,
        FAIL : 1,
        NOT_SUPPORTED : 2,
        REJECTED : 3,
        PENDING : 4,
        NO_COMMAND : 255
    };

    var fecChannelId = 0;
    var elapsedTime = 0;  // 1/4 seconds.
    var accumulatedDistance = 0; // Meters

    // Placeholder function.
    function printBuffer(channelId, buffer) {
        console.log(buffer);
    }

    // This method accumulates a single byte into a 32 bit unsigned int.
    function accumulateByte(accumulator, byte) {
        // Did a rollover occur?
        if (byte < (accumulator & 0xFF)) {
            accumulator += 0xFF;
        }
        
        // >>>0 keeps this a 32 bit *un*signed int.
        accumulator = (accumulator >>>0 & 0xFFFFFF00) + byte 

        return accumulator;        
    }

    // Returns accumulated time in seconds.
    function getElapsedSeconds(time) {
        elapsedTime = accumulateByte(elapsedTime, time);
        // Elapsed time is stored in 0.25 seconds, divide by 4 to get seconds.
        return elapsedTime / 4;
    }

    // Distance is a single byte, this method accumulates distance into a 32 bit unsigned int.
    function getDistance(distance) {
        accumulatedDistance = accumulateByte(accumulatedDistance, distance); 
        return accumulatedDistance;
    }

    // Changes endiness and adjusts to meters per second.
    function getSpeed(byte1, byte2) {
        return (parseInt(byte2) << 8 | parseInt(byte1)) / 1000;
    }

    // 0-100% in 0.5% increments.
    function getResistance(resistance) {
        return (resistance/200);
    }

    function getCapabilitiesState(byte) {
        var state = {
                virtualSpeed : byte & 0x08,
                feState : byte & 0xE0,
                lapToggle : byte & 0x80 
        };
        return state;
    }

    // Parses resistance capabilities as sent in page 0x36.
    function getCapabilities(byte) {
        var capabilities = {
            supportsBasicResistance : (byte & 0x01),
            supportsTargetPower : (byte & 0x02),
            supportsSimulation : (byte & 0x4) 
        };
        
        return capabilities;
    }

    // Returns an object with trainer status flags.
    function getTrainerStatus(bits) {
        var status = {
            powerCalibrationRequired : (bits & 0x1),
            resistanceCalibrationRequired : (bits & 0x2),
            userConfigRequired : (bits & 0x4)
        };
        return status;
    }

    // Depending on the type of command, return the right data.
    function getCommandData(buffer) {
        var type = buffer[2];
        var data = {};
        
        switch (type) {
            case BASIC_RESISTANCE_PAGE:
                data.resistance = buffer[8];
                break;
            case TARGET_POWER_PAGE:
                data.targetPower = buffer[8] << 8 | buffer[7];
                break;
            case WIND_RESISTANCE_PAGE:
                data.windCoeff = buffer[6];
                data.windSpeed = buffer[7];
                data.draftFactor = buffer[8]; 
                break;
            case TRACK_RESISTANCE_PAGE:
                data.slope = buffer[7] << 8 | buffer[6];
                data.rollingCoeff = buffer[8];
                break;
            default:
                console.log('unrecognized type.');
                break;
        }
        
        return data;
    }

    // Parses page 16 and emits an event with human readable values.
    function parseGeneralFEData() {
        var page = { 
                elapsedTime : getElapsedSeconds(fecChannelEventBuffer[3]),
                distanceTravelled: getDistance(fecChannelEventBuffer[4]),
                speedMps : getSpeed(fecChannelEventBuffer[5], fecChannelEventBuffer[6]),
                distanceTraveledEnabled : fecChannelEventBuffer[8] & 0x04,
                state : getCapabilitiesState(fecChannelEventBuffer[8]) 
        };
                
        //console.log(page);
        return page;            
    }

    // Parses page 17 and emits an event with human readable values.
    function parseGeneralSettings() {
        var page = {
            wheelCircumference : parseInt(fecChannelEventBuffer[4]),
            resistanceLevel : getResistance(fecChannelEventBuffer[7]),     
            state : getCapabilitiesState(fecChannelEventBuffer[8])
        };
        //console.log(page);
        return page;                
    }

    // Parses page 25 and emits an event with human readable values.
    function parseSpecificTrainerData() {
        var page = {
            eventCount : fecChannelEventBuffer[2],
            accumulatedPower : (fecChannelEventBuffer[5] << 8 |
                fecChannelEventBuffer[4]),
            instantPower : ( (fecChannelEventBuffer[7] & 0x0F) << 8 |
                fecChannelEventBuffer[6] ),
            trainerStatus : getTrainerStatus(fecChannelEventBuffer[7] & 0xF0),
            flags : fecChannelEventBuffer[8] & 0x0F,
            feState : fecChannelEventBuffer[7] & 0xF0
        };
        //console.log(page);
        return page;
    }

    // Parses page 71 and emits an event with human readable values.
    function parseCommandStatus() {
        var page = {
            lastCommand : fecChannelEventBuffer[2],
            sequence : fecChannelEvent[3],
            status : fecChannelEvent[4], // see enum for possible values.
            data : getCommandData(fecChannelEventBuffer)
        };
        //console.log(page);
        return page;
    }

    function parseFeCapabilites() {
        // does nothing right now.
        var page = {
            // Maximum resistance in Newtons.
            maxResistanceN : fecChannelEventBuffer[7] << 8 | 
                fecChannelEventBuffer[6],
            capabilities : getCapabilities(fecChannelEventBuffer[8])
        };
        //console.log(page);
        return page;
    }
    
    // Parses the user configuration page.
    function parseUserConfig() {
        var page = {
            userWeightKg : (fecChannelEventBuffer[2] | fecChannelEventBuffer[3] << 8) / 100.0,
            // 1.5 byte field length in 0.05kg increments. 
            bikeWeightKg : (fecChannelEventBuffer[5] & 0xF | fecChannelEventBuffer[6] << 4) * 0.05 
            // TODO: Bicycle Wheel Diameter.  But this doesn't really matter. 
        };
        return page;
    }        
    // Parse IRT manufacturer specific settings.
    function parseIrtSettings() {
        var buffer = fecChannelEventBuffer;
        var page = {
            drag : (buffer[2] | buffer[3] << 8) / 1000000.0,
            rr :  (buffer[4] | buffer[5] << 8) / 1000.0,
            servoOffset : buffer[6] | buffer[7] << 8,
            settings : buffer[8]
        };
        return page;
    }

    // Function called back by the ant library when a message arrives.
    function fecChannelEvent(channelId, eventId) { 
        //printBuffer(channelId, fecChannelEventBuffer);
        if (channelId != fecChannelId) {
            console.log('Wrong channel.');
            return;
        }
        
        switch(eventId) {
            case antlib.EVENT_RX_BROADCAST:
                var messagedId = fecChannelEventBuffer[1];
                switch (messagedId) {
                    case GENERAL_FE_DATA_PAGE:
                        self.emit('message', 'generalFEData', parseGeneralFEData());
                        break;
                    case GENERAL_SETTINGS_PAGE:
                        self.emit('message', 'generalSettings', parseGeneralSettings());
                        break;
                    case SPECIFIC_TRAINER_DATA_PAGE:
                        self.emit('message', 'specificTrainerData', parseSpecificTrainerData());
                        break;
                    case COMMAND_STATUS_PAGE:
                        self.emit('message', 'commandStatus', parseCommandStatus());
                        break;
                    case FE_CAPABILITIES_PAGE:
                        self.emit('message', 'feCapabilities', parseFeCapabilites());
                        break;
                    case USER_CONFIGURATION_PAGE:
                        self.emit('message', 'userConfig', parseUserConfig());
                        break;
                    case antlib.PRODUCT_PAGE:
                        self.emit('message', 'productInfo', 
                            antlib.parseProductInfo(fecChannelEventBuffer));
                        break;
                    case antlib.MANUFACTURER_PAGE:
                        self.emit('message', 'manufacturerInfo', 
                            antlib.parseManufacturerInfo(fecChannelEventBuffer));
                        break;
                    case IRT_EXTRA_INFO_PAGE:
                        self.emit('message', 'irtExtraInfo', 
                            antlib.parseIrtExtraInfo(fecChannelEventBuffer));            
                        break;
                    case IRT_SETTINGS_PAGE:
                        self.emit('message', 'irtSettings', 
                            parseIrtSettings());            
                        break;
                    default:
                        console.log('Unrecognized message.', 
                            fecChannelEventBuffer[0],
                            fecChannelEventBuffer[1],
                            fecChannelEventBuffer[2],
                            fecChannelEventBuffer[3],
                            fecChannelEventBuffer[4],
                            fecChannelEventBuffer[5],
                            fecChannelEventBuffer[6],
                            fecChannelEventBuffer[7],
                            fecChannelEventBuffer[8]
                        );
                        break;
                }
                break; // EVENT_RX_BROADCAST
            case antlib.MESG_CHANNEL_STATUS_ID:
                // status changed
                console.log('Channel status changed:', FEC_CHANNEL_CONFIG);
                // Raise an event. 
                self.emit('channel_status', FEC_CHANNEL_CONFIG.status,
                    FEC_CHANNEL_CONFIG.deviceId);
                break;
            default: // eventId
                console.log('Unrecognized event.', eventId);
                break;                
        }
    }
    
    // Configure the channel.
    const FEC_CHANNEL_CONFIG = { 
        channelType: 0, 
        deviceId: 0, 
        deviceType: 0x11, 
        transmissionType: 0, 
        frequency: 57, 
        channelPeriod: 8192,         
        channelCallback: fecChannelEvent,
        status: 0
    };
    
    // Opens the FE-C channel.
    function openChannel(deviceId) {
        // Start.    
        antlib.init();
        
        if (deviceId != null) {
            FEC_CHANNEL_CONFIG.deviceId = deviceId;
        }
        
        fecChannelId = antlib.openChannel(FEC_CHANNEL_CONFIG, fecChannelEventBuffer);     
    }

    // Send a message requesting the last command, should be used to verify the last succeeded.
    function requestLastCommand() {
        // Async request of page 71 (command status)
        setTimeout(function () {
                antlib.sendRequestDataPage(fecChannelId, COMMAND_STATUS_PAGE, transmitBuffer);
            }, 1000);
    }

    // Sets basic resistance.
    function setBasicResistance(totalResistance) {
        transmitBuffer[0] = BASIC_RESISTANCE_PAGE;
        
        // Pad reserved bytes.
        for (var index = 1; index < 6; index++) {
            transmitBuffer[index] = 0xFF;
        }
        
        // Resistance level.  0-254, 0.5% increments 
        transmitBuffer[7] = totalResistance; // Resistance level.
        
        var result = antlib.sendAcknowledgedData(fecChannelId, transmitBuffer);
        console.log('setting resistance:', result);
        // Verify it worked by async aking for last command.
        requestLastCommand();
    }

    // Sets erg mode and target watts.
    function setTargetPower(watts) {
        
        // in 0.25 watts
        var value = watts * 4;
        
        transmitBuffer[0] = TARGET_POWER_PAGE;
        transmitBuffer[1] = 0xFF;
        transmitBuffer[2] = 0xFF;
        transmitBuffer[3] = 0xFF;
        transmitBuffer[4] = 0xFF;
        transmitBuffer[5] = 0xFF;
        transmitBuffer[6] = value & 0xFF;
        transmitBuffer[7] = value >> 8;
        
        antlib.sendAcknowledgedData(fecChannelId, transmitBuffer);
        requestLastCommand();
    }

    // Sends a command to the device set user configuration.
    function setUserConfiguration(userWeightKg, bikeWeightKg, wheelDiameter, gearRatio) {
        console.log('setUserConfiguration');
        var hasChanges = false;
        
        transmitBuffer[0] = USER_CONFIGURATION_PAGE;
        
        if (userWeightKg != null) {
            userWeightKg = Math.round(userWeightKg * 100);
            transmitBuffer[1] = userWeightKg & 0xFF;
            transmitBuffer[2] = userWeightKg << 8;
            hasChanges = true;
        }
        else {
            // Set to invalid.
            transmitBuffer[1] = 0xFF;
            transmitBuffer[1] = 0xFF;            
        }
        
        transmitBuffer[3] = 0xFF; // Reserved.
        
        //wheelDiameterOffset
        if (wheelDiameter != null) {
            // Wheel diameter 0-2.54m
            if (wheelDiameter > 2.54) {
                throw new RangeError('Wheel diameter must be less than 2.54m');
            }
            transmitBuffer[7] = Math.round(wheelDiameter * 100);

            var wheelDiameterOffset = 
                (wheelDiameter * 100) - Math.round(wheelDiameter * 100);

            transmitBuffer[5] = parseInt(wheelDiameterOffset) & 0xF;
            hasChanges = true;
        }
        else {
            transmitBuffer[5] = 0xF;
            transmitBuffer[7] = 0xFF;
        } 
        
        if (bikeWeightKg != null) {
            if (bikeWeightKg >= 51) {
                throw new RangeError('Bike Weight is too high.');
            }
            
            var bikeWeightValue = Math.round(bikeWeightKg / 0.05); 
            transmitBuffer[5] = transmitBuffer[5] | 
                bikeWeightValue & 0xF00;
            transmitBuffer[6] = bikeWeightValue & 0xFF;
            
            hasChanges = true;
        }
        else {
            transmitBuffer[5] |= 0xF00;
            transmitBuffer[6] = 0xFF;
        }

        if (gearRatio == null) {
            transmitBuffer[8] = 0;
        }
        else {
            // TODO: check bounds
            if (gearRatio < 0.03 || gearRatio > 7.65) {
                throw new RangeError('Gear ratio must be betwee 0.03 and 7.65');
            } 
            
            transmitBuffer[8] = gearRatio / 0.03;
            hasChanges = true;
        }
        
        if (hasChanges) {
            antlib.sendAcknowledgedData(fecChannelId, transmitBuffer);
        }
        else {
            throw new Error('No valid configuration values to set.');
        }
    }
    
    // Sends the manufacturer specific page to set device settings.
    function setIrtSettings(drag, rr, servoOffset, settings) {
        console.log('setIrtSettings');
        var hasChanges = false;
        transmitBuffer[0] = IRT_SETTINGS_PAGE;
        
        /*
            drag : (buffer[2] | buffer[3] << 8) / 1000000.0,
            rr :  (buffer[4] | buffer[5] << 8) / 1000.0,
            servoOffset : buffer[6] | buffer[7] << 8,
            settings : buffer[8]
        */        
        if (drag != null) {
            transmitBuffer[1] =  (drag * 1000000) & 0xFF; // DragLSB
            transmitBuffer[2] =  (drag * 1000000) >> 8; //DragMSB
            hasChanges = true;
        }
        else {
            transmitBuffer[1] = 0xFF;
            transmitBuffer[2] = 0xFF;
        }

        if (rr != null) {
            transmitBuffer[3] =  (drag * 1000) & 0xFF; // RRLSB
            transmitBuffer[4] =  (drag * 1000) >> 8; //RRMSB
            hasChanges = true;
        }
        else {
            transmitBuffer[3] = 0xFF;
            transmitBuffer[4] = 0xFF;
        }            
            
        if (servoOffset != null) {
            transmitBuffer[5] = servoOffset & 0xFF; // ServoOffsetLSB  
            transmitBuffer[6] = servoOffset >> 8; // ServoOffsetMSB  
            hasChanges = true;
        }
        else {
            transmitBuffer[5] = 0xFF;
            transmitBuffer[6] = 0xFF;
        }            
            
        if (settings != null) {
            transmitBuffer[7] = settings & 0xFF; // Settings
            hasChanges = true;
        }
        else {
            transmitBuffer[7] = 0xFF;
        }
        
        if (hasChanges) {
            antlib.sendAcknowledgedData(fecChannelId, transmitBuffer);            
        }
        else {
            throw new Error('No valid settings to set.');
        }
    }
    
    // Requests the IRT settings page.
    function getSettings() {
        console.log("ant_fec requesting settings.");
        antlib.sendRequestDataPage(fecChannelId, IRT_SETTINGS_PAGE, transmitBuffer);
        // Async ask for the user settings in 250ms after sending last request.
        setTimeout(function () {
                antlib.sendRequestDataPage(fecChannelId, USER_CONFIGURATION_PAGE, 
                    transmitBuffer);
                console.log("Requesting user config page.");
            }, 250);
    }

    AntFec.prototype.openChannel = openChannel;
    AntFec.prototype.setBasicResistance = setBasicResistance;
    AntFec.prototype.setTargetPower = setTargetPower;
    AntFec.prototype.setUserConfiguration = setUserConfiguration;    
    AntFec.prototype.getSettings = getSettings;
    AntFec.prototype.setIrtSettings = setIrtSettings;
    AntFec.prototype.setUserConfiguration = setUserConfiguration;
};

util.inherits(AntFec, EventEmitter);

module.exports = AntFec;
