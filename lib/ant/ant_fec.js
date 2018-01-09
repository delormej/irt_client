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
    const IRT_SETTINGS_POWER_ADJUST_PAGE = 0xF3;   // Manufacturer specific page sending power adjust specific settings.
    

    const IRT_SPECIFIC_PAGE = 0xF0;         // IRT (Manufacturers) specific page.
    const IRT_SET_SERVO_COMMAND = 0x61;
    const IRT_SET_DFU_COMMAND = 0x64;
    const IRT_TOGGLE_BG_SCAN = 0x65;
    const IRT_BLINK_LED = 0x66;


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

    // Keep a running accumuation.
    var accumulatedPower = 0;
    var eventCount = 0;

    // Keep track of the channel's status.
    function getChannelStatus() {
        return FEC_CHANNEL_CONFIG.status;
    }

    function getDeviceId() {
        return FEC_CHANNEL_CONFIG.deviceId;
    }

    // Placeholder function.
    function printBuffer(channelId, buffer) {
        console.log(buffer);
    }

    // Returns accumulated time in seconds.
    function getElapsedSeconds(time) {
        elapsedTime = antlib.accumulateByte(elapsedTime, time);
        // Elapsed time is stored in 0.25 seconds, divide by 4 to get seconds.
        return elapsedTime / 4;
    }

    // Distance is a single byte, this method accumulates distance into a 32 bit unsigned int.
    function getDistance(distance) {
        accumulatedDistance = antlib.accumulateByte(accumulatedDistance, distance); 
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
            eventCount : getEventCount(fecChannelEventBuffer[2]),
            accumulatedPower : getAccumulatedPower(fecChannelEventBuffer[5] << 8 |
                fecChannelEventBuffer[4]),
            instantPower : ( (fecChannelEventBuffer[7] & 0x0F) << 8 |
                fecChannelEventBuffer[6] ),
            trainerStatus : getTrainerStatus(fecChannelEventBuffer[7] & 0xF0),
            flags : fecChannelEventBuffer[8] & 0x0F,
            feState : fecChannelEventBuffer[7] & 0xF0
        };
        
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

    // Parses voltage, accumulated time and status from battery message (0x52).
    function parseBatteryStatus() {
        
        var courseVoltage = fecChannelEventBuffer[8] & 0x0F; // lowest 4 bits.
        var fractionalVoltage = (fecChannelEventBuffer[7] / 256); // 1/265 of a volat.
        var voltage = courseVoltage + fractionalVoltage;
        
        /*
            Possible status levels:
            0 (0x00) Reserved for future use
            1 (0x01) Battery Status = New
            2 (0x02) Battery Status = Good
            3 (0x03) Battery Status = Ok
            4 (0x04) Battery Status = Low
            5 (0x05) Battery Status = Critical
            6 (0x06) Reserved for future use
            7 (0x07) Invalid
        */        
        var status = ((fecChannelEventBuffer[8] & 0x70) >> 4); // bits 4-6
        var time = 
            fecChannelEventBuffer[4] |      // bits 0-7 
            fecChannelEventBuffer[5] << 8 | // bits 8-15
            fecChannelEventBuffer[6] << 16; // bits 16-23

        var resolution2second = (fecChannelEventBuffer[8] & 0x80) != 0;
        var cumulativeOperatingHours = 0;

        if (resolution2second)
        {
            cumulativeOperatingHours = (time * 2) / 3600; // in hours.
        }
        else
        {
            cumulativeOperatingHours = (time * 16) / 3600; // in hours.
        }
        
        var page = {
            operatingHours: cumulativeOperatingHours,
            status: status,
            voltage: voltage
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
    
    // Parse IRT manufacturer specific settings for power adjustment.
    function parseIrtSettingsPowerAdjust() {
        var buffer = fecChannelEventBuffer;
        var page = {
            powerMeterId : (buffer[2] | buffer[3] << 8),
            powerAdjustSeconds : buffer[4],
            powerAverageSeconds : buffer[5],
			servoSmoothingSteps : buffer[6],
            minAdjustSpeedMps : buffer[7]
        };
        return page;
    }

    // Function called back by the ant library when a message arrives.
    function fecChannelEvent(channelId, eventId, timestamp) { 
        switch(eventId) {
            case antlib.EVENT_RX_BROADCAST:
            case antlib.EVENT_RX_FLAG_BROADCAST:
                var messagedId = fecChannelEventBuffer[1];
                switch (messagedId) {
                    case GENERAL_FE_DATA_PAGE:
                        self.emit('generalFEData', parseGeneralFEData(), timestamp);
                        break;
                    case GENERAL_SETTINGS_PAGE:
                        self.emit('generalSettings', parseGeneralSettings(), timestamp);
                        break;
                    case SPECIFIC_TRAINER_DATA_PAGE:
                        self.emit('specificTrainerData', parseSpecificTrainerData(), timestamp);
                        break;
                    case COMMAND_STATUS_PAGE:
                        self.emit('commandStatus', parseCommandStatus(), timestamp);
                        break;
                    case FE_CAPABILITIES_PAGE:
                        self.emit('feCapabilities', parseFeCapabilites(), timestamp);
                        break;
                    case USER_CONFIGURATION_PAGE:
                        self.emit('userConfig', parseUserConfig(), timestamp);
                        break;
                    case antlib.PRODUCT_PAGE:
                        self.emit('productInfo', 
                            antlib.parseProductInfo(fecChannelEventBuffer), timestamp);
                        break;
                    case antlib.MANUFACTURER_PAGE:
                        self.emit('manufacturerInfo', 
                            antlib.parseManufacturerInfo(fecChannelEventBuffer), timestamp);
                        break;
                    case antlib.BATTERY_STATUS_PAGE:
                        self.emit('batteryStatus', 
                            parseBatteryStatus(fecChannelEventBuffer), timestamp);
                        break;                    
                    case IRT_EXTRA_INFO_PAGE:
                        self.emit('irtExtraInfo', 
                            antlib.parseIrtExtraInfo(fecChannelEventBuffer), timestamp);            
                        break;
                    case IRT_SETTINGS_PAGE:
                        self.emit('irtSettings', 
                            parseIrtSettings(), timestamp);            
                        break;
                    case IRT_SETTINGS_POWER_ADJUST_PAGE:
                        self.emit('irtSettingsPowerAdjust', 
                            parseIrtSettingsPowerAdjust(), timestamp);
                        break;
                    default:
                        console.log('Unrecognized message.', 
                            formatHex(fecChannelEventBuffer[0]),
                            formatHex(fecChannelEventBuffer[1]),
                            formatHex(fecChannelEventBuffer[2]),
                            formatHex(fecChannelEventBuffer[3]),
                            formatHex(fecChannelEventBuffer[4]),
                            formatHex(fecChannelEventBuffer[5]),
                            formatHex(fecChannelEventBuffer[6]),
                            formatHex(fecChannelEventBuffer[7]),
                            formatHex(fecChannelEventBuffer[8])
                        );
                        break;
                }
                break; // EVENT_RX_BROADCAST
            case antlib.MESG_CHANNEL_STATUS_ID:
                let status = fecChannelEventBuffer[1] & 0x3;
                if (status != FEC_CHANNEL_CONFIG.status) {
                    FEC_CHANNEL_CONFIG.status = status;
                    console.log('Channel status changed:', FEC_CHANNEL_CONFIG);
                    self.emit('channel_status', FEC_CHANNEL_CONFIG.status,
                        FEC_CHANNEL_CONFIG.deviceId, timestamp);
                }
                break;
            default: // eventId
                console.log('Unrecognized event.', eventId);
                break;                
        }
    }
    
    function formatHex(value) {
        return '[' + parseInt(value).toString(16) + ']';
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
        buffer: fecChannelEventBuffer,
        status: 0
    };
    
    // Opens the FE-C channel.
    function openChannel(deviceId) {
        // Start.    
        antlib.init();
        
        if (deviceId != null) {
            FEC_CHANNEL_CONFIG.deviceId = deviceId;
        }
        
        fecChannelId = antlib.openChannel(FEC_CHANNEL_CONFIG);     
    }

    function closeChannel() {
        let status = getChannelStatus();
        if (status == antlib.STATUS_TRACKING_CHANNEL || 
            status == antlib.STATUS_SEARCHING_CHANNEL) {
            antlib.closeChannel(fecChannelId);
        }
    }

    // Send a message requesting the last command, should be used to verify the last succeeded.
    function requestLastCommand() {
        // Async request of page 71 (command status)
        setTimeout(function () {
                antlib.sendRequestDataPage(fecChannelId, COMMAND_STATUS_PAGE, transmitBuffer);
            }, 1000);
    }

    // Builds the buffer and sends the IRT manufacturer specific command page.
    function sendIrtSpecificPage(command, value) {
        if (value == null) {
            value = 0xFFFF;
        }

        transmitBuffer[0] = IRT_SPECIFIC_PAGE;

        // 4th byte is the command.        
        transmitBuffer[1] = command;
        transmitBuffer[2] = 0xFF;   //reserved

        // Send absolute servo position.
        transmitBuffer[3] = value & 0xFF;
        transmitBuffer[4] = value >> 8;

        transmitBuffer[5] = 0xFF; // Should be a sequence # (this is from the Wahoo spec.)
        transmitBuffer[6] = 0xFF;
        transmitBuffer[7] = 0xFF;
        
        var result = antlib.sendAcknowledgedData(fecChannelId, transmitBuffer);
        console.log('sending IRT manufacturer specific command:', result);
        // Verify it worked by async aking for last command.
        requestLastCommand();
    }

    // Sends a command to put the device in device firmware update (DFU) mode. 
    function setDfuMode() {
        sendIrtSpecificPage(IRT_SET_DFU_COMMAND, null);
    }

    function searchForPowerMeters() {
        sendIrtSpecificPage(IRT_TOGGLE_BG_SCAN, null);
    }

    function blinkLed() {
        sendIrtSpecificPage(IRT_BLINK_LED, null);
    }

    // Sets servo position. 
    function setServoPosition(position) {
        sendIrtSpecificPage(IRT_SET_SERVO_COMMAND, position);
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

    // Sets target grade and coefficient of rolling resistance.
    function setTrackResistance(grade, crr) {
        transmitBuffer[0] = TRACK_RESISTANCE_PAGE;

        var result = antlib.sendAcknowledgedData(fecChannelId, transmitBuffer);
        console.log('setting track resistance:', result);
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
        
        if (userWeightKg != null && !isNaN(userWeightKg)) {
            userWeightKg = Math.round(userWeightKg * 100);
            transmitBuffer[1] = userWeightKg & 0xFF;
            transmitBuffer[2] = userWeightKg >> 8;
            hasChanges = true;
        }
        else {
            // Set to invalid.
            transmitBuffer[1] = 0xFF;
            transmitBuffer[2] = 0xFF;            
        }
        
        transmitBuffer[3] = 0xFF; // Reserved.
        
        //wheelDiameterOffset
        if (wheelDiameter != null && !isNaN(wheelDiameter)) {
            // Wheel diameter 0-2.54m
            if (wheelDiameter > 2.54) {
                throw new RangeError('Wheel diameter must be less than 2.54m');
            }
            transmitBuffer[6] = Math.round(wheelDiameter * 100);

            var wheelDiameterOffset = 
                (wheelDiameter * 100) - Math.round(wheelDiameter * 100);

            // Only store a nibble of data (0.5 byte) in bits 0-3.
            transmitBuffer[4] = (parseInt(wheelDiameterOffset) & 0xF) << 4; // bits 0-3
            hasChanges = true;
        }
        else {
            transmitBuffer[4] = 0xF0; // bits 0-3
            transmitBuffer[6] = 0xFF;
        } 
        
        if (bikeWeightKg != null && !isNaN(bikeWeightKg)) {
            if (bikeWeightKg >= 51) {
                throw new RangeError('Bike Weight is too high.');
            }
            
            var bikeWeightValue = Math.round(bikeWeightKg / 0.05); 
            transmitBuffer[4] |= bikeWeightValue & 0xF; // LSN
            transmitBuffer[5] = (bikeWeightValue & 0xFF0) >> 4; // MSB
            
            hasChanges = true;
        }
        else {
            transmitBuffer[4] |= 0xF;
            transmitBuffer[5] = 0xFF;
        }

        if (gearRatio == null) {
            transmitBuffer[7] = 0;
        }
        else {
            // TODO: check bounds
            if (gearRatio < 0.03 || gearRatio > 7.65) {
                throw new RangeError('Gear ratio must be betwee 0.03 and 7.65');
            } 
            
            transmitBuffer[7] = gearRatio / 0.03;
            hasChanges = true;
        }
        
        if (hasChanges) {
            console.log('Sending user configuration.');
            antlib.sendAcknowledgedData(fecChannelId, transmitBuffer);
        }
        else {
            throw new Error('No valid configuration values to set.');
        }
    }
    
    // Sends the manufacturer specific page to set device settings.
    function setIrtSettings(drag, rr, servoOffset, settings, persist) {
        console.log('setIrtSettings, persist? ', persist);
        var hasChanges = false;
        transmitBuffer[0] = IRT_SETTINGS_PAGE;
        
        /*
            drag : (buffer[2] | buffer[3] << 8) / 1000000.0,
            rr :  (buffer[4] | buffer[5] << 8) / 1000.0,
            servoOffset : buffer[6] | buffer[7] << 8,
            settings : buffer[8]
        */        
        if (drag != null && !isNaN(drag)) {
            transmitBuffer[1] =  (drag * 1000000) & 0xFF; // DragLSB
            transmitBuffer[2] =  (drag * 1000000) >> 8; //DragMSB
            hasChanges = true;
        }
        else {
            transmitBuffer[1] = 0xFF;
            transmitBuffer[2] = 0xFF;
        }

        if (rr != null && !isNaN(rr)) {
            transmitBuffer[3] =  (rr * 1000) & 0xFF; // RRLSB
            transmitBuffer[4] =  (rr * 1000) >> 8; //RRMSB
            hasChanges = true;
        }
        else {
            transmitBuffer[3] = 0xFF;
            transmitBuffer[4] = 0xFF;
        }            

        if (servoOffset != null && !isNaN(servoOffset)) {
            transmitBuffer[5] = servoOffset & 0xFF; // ServoOffsetLSB  
            transmitBuffer[6] = servoOffset >> 8; // ServoOffsetMSB  
            hasChanges = true;
        }
        else {
            transmitBuffer[5] = 0xFF;
            transmitBuffer[6] = 0xFF;
        }            

        if (settings != null && !isNaN(settings)) {
            transmitBuffer[7] = settings & 0xFF; // Settings
            hasChanges = true;
        }
        else {
            transmitBuffer[7] = 0xFF;
        }

        // Send flag as to whether these settings should be persisted to device flash or not.
        // servoOfset only uses 15 least significant bits. MSBit is reserved for a flag 
        // to determine whether all settings changes should be persisted (1) or not (0).
        if (persist) { 
            transmitBuffer[6] |= 0x80; // Set MSB to 1.
        }
        else { 
            transmitBuffer[6] &= 0x7F; // Set MSB to 0.
        }

        if (hasChanges) {
            console.log('Sending IRT Settings.');
            antlib.sendAcknowledgedData(fecChannelId, transmitBuffer);            
        }
        else {
            throw new Error('No valid settings to set.');
        }
    }
    
    // Sends the manufacturer specific page to set power meter adjust device settings.
    function setIrtPowerAdjustSettings(powerMeterId, adjustSeconds, averageSeconds, servoSmoothingSteps, minAdjustSpeedMps, persist) {
        transmitBuffer[0] = IRT_SETTINGS_POWER_ADJUST_PAGE;
        transmitBuffer[1] = powerMeterId & 0xFF; // powerMeterIdLSB  
        transmitBuffer[2] = powerMeterId >> 8; // powerMeterIdMSB  
        transmitBuffer[3] = adjustSeconds;
        transmitBuffer[4] = averageSeconds;
        transmitBuffer[5] = servoSmoothingSteps;
        transmitBuffer[6] = minAdjustSpeedMps;
        if (persist)
            transmitBuffer[7] = 0xFF;
        else
            transmitBuffer[7] = 0x7F;

        console.log('Sending IRT Power Adjust Settings.');
        antlib.sendAcknowledgedData(fecChannelId, transmitBuffer);   
    }

    function getIrtSettings() {
        console.log("ant_fec requesting IRT settings.");
        antlib.sendRequestDataPage(fecChannelId, IRT_SETTINGS_PAGE, transmitBuffer);
    }

    function getUserConfiguration() {
        console.log("Requesting user config page.");
        antlib.sendRequestDataPage(fecChannelId, USER_CONFIGURATION_PAGE, 
            transmitBuffer);
    }

    function getIrtSettingsPowerAdjust() {
        console.log("Requesting power adjust settings page.");
        antlib.sendRequestDataPage(fecChannelId, IRT_SETTINGS_POWER_ADJUST_PAGE, 
            transmitBuffer);        
    }

    // Requests the IRT settings & user configuration pages (2 requests).
    function getSettings() {
        getIrtSettings();
        // Async ask for the user settings in 250ms after sending last request.
        setTimeout(function () {
                getUserConfiguration();
            }, 250);
        setTimeout(function () {
                getIrtSettingsPowerAdjust();
            }, 500);            
    }

    // Accumulates power beyond the 16 bits.
    function getAccumulatedPower(power) {   
        accumulatedPower = antlib.accumulateDoubleByte(accumulatedPower, power);
        return accumulatedPower;
    }
    
    // Accumulates event count beyond the 8 bits.
    function getEventCount(events) {
        eventCount = antlib.accumulateByte(eventCount, events);
        return eventCount;
    }
    
    AntFec.prototype.openChannel = openChannel;
    AntFec.prototype.closeChannel = closeChannel;
    AntFec.prototype.setServoPosition = setServoPosition;
    AntFec.prototype.setDfuMode = setDfuMode;
    AntFec.prototype.searchForPowerMeters = searchForPowerMeters;
    AntFec.prototype.blinkLed = blinkLed;
    AntFec.prototype.setBasicResistance = setBasicResistance;
    AntFec.prototype.setTargetPower = setTargetPower;
    AntFec.prototype.setUserConfiguration = setUserConfiguration;    
    AntFec.prototype.getSettings = getSettings;
    AntFec.prototype.getUserConfiguration = getUserConfiguration;
    AntFec.prototype.getIrtSettings = getIrtSettings;
    AntFec.prototype.setIrtSettings = setIrtSettings;
    AntFec.prototype.setIrtPowerAdjustSettings = setIrtPowerAdjustSettings;
    AntFec.prototype.setUserConfiguration = setUserConfiguration;
    AntFec.prototype.getChannelStatus = getChannelStatus;
    AntFec.prototype.getDeviceId = getDeviceId;
};

util.inherits(AntFec, EventEmitter);

module.exports = AntFec;
