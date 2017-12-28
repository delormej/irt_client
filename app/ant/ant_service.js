/*
 * Copyright (c) 2016 Inside Ride Technologies, LLC. All Rights Reserved.
 * Author: Jason De Lorme (jason@insideride.com)
 *
 * [description ...]
 */

const AntService = function() {
    const util = require('util');
    const zpad = require('zpad');
    const antlib = require('../ant/antlib.js');
    const antManufacturer = require('../ant/ant_manufacturers.js');
    const AntBgScanner = require('../ant/ant_bg_scanner.js');
    const AntFec = require('../ant/ant_fec.js');
    const AntBikePower = require('../ant/ant_bp.js');
    const PowerAdjuster = require('../ant/power_adjuster.js');
    const LogParser = require('../ant/log_parser.js');
    const azure = require('../azure-upload.js');
    const fs = require('fs');

    const DEVICE_ENUM = {
        TRAINER : 0,
        POWER_METER : 1
    };
    const METERS_TO_MILES = 0.000621371;
    const MPS_TO_MPH = 2.23694;
    
    var bg_scan = null;
    var fec = null; 
    var bp = null;
    var powerAdjuster = null;
    var scope = null;
    var self = this;

    var speedEvents = [];
    var powerEvents = [];
    var trainerPowerEvents = [];

    var messages = { Trainer: [], PowerMeter: [] };

    var irtSettings = null; // hang on to the last settings we recieved.

    function flattenEvent(event, data, timestamp) {
        return Object.assign( {"timestamp":timestamp, "event":event}, data);            
    }

    function accumulateBikePowerAverage(message) {
        // Accumulate power events.
        powerEvents.push(message);
        // Accumulate power messages.
        messages.PowerMeter.push(message);
        // Get 10 second average.
        self.scope.averageBikePower = getAveragePower(10);              

        if (self.scope.powerAdjustEnabled == true) {
            self.scope.new_rr = powerAdjuster.adjust(
                getAverageSpeed(3), 
                self.scope.averageBikePower,
                self.scope.averageTrainerPower );                
        }

        self.scope.safeApply();
    }

    // Loads the ANT library.
    /* This is loaded in main.js otherwise it goes out of scope and gets GC'd.
    * however this creates a problem in that we need to use ipc to communicate 
    * to the renderer process.
    */
    function load(scope) {
        self.scope = scope;
        antlib.init();
        //antlib.setDebugLogDirectory("c:\\users\\jason\\workspace\\");
        console.log("Loaded ANT: ", antlib.antVersion());
        scope.version = antlib.antVersion();
        scope.new_rr = 0;        
        scope.persistSettings = false; // Set default.
        scope.powerAdjustEnabled = false;
        scope.availablePowerMeters = [];
        scope.availableFeC = [];

        bg_scan = new AntBgScanner();
        fec = new AntFec();
        bp = new AntBikePower();
        powerAdjuster = new PowerAdjuster(fec);
        
        bg_scan.on('deviceInfo', (deviceInfo) => {
            addOrUpdateAvailableDeviceTypes(deviceInfo);
            scope.safeApply();
        });

        // Process bike power messages.
        bp.on('standardPowerOnly', (data, timestamp) => {
            // "Flatten" json so it's more usable.
            var message = flattenEvent('standardPowerOnly', data, timestamp);

            scope.bikePower = data.instantPower;
            
            if (data.instantCadence != 0xFF) {
                scope.cadence = data.instantCadence;
            }
            else {
                scope.cadence = 0;
            }

            accumulateBikePowerAverage(message);
        });

        bp.on('ctfMainPage', (data, timestamp) => {
            // "Flatten" json so it's more usable.
            var message = flattenEvent('ctfMainPage', data, timestamp);

            if (data.instantPower >= 0) {
                var eventCount = 0;
                var accumulatedPower = 0;
                
                if (powerEvents.length > 1) {
                    var index = powerEvents.length -2;
                    eventCount = powerEvents[index].eventCount+1;
                    accumulatedPower = powerEvents[index].accumulatedPower + data.instantPower;
                }

                // Modify object to add eventCount & accumultatedPower so that 
                // we can average like standard power only.
                message = Object.assign( {"eventCount": eventCount, "accumulatedPower": accumulatedPower}, message);

                scope.bikePower = data.instantPower;
                scope.cadence = data.instantCadence;

                accumulateBikePowerAverage(message);
            }
        });

        bp.on('channel_status', (status, deviceId) => {
            console.log("BP channel_status: ", status);
            switch (status) {
                case antlib.STATUS_TRACKING_CHANNEL:
                    scope.powerMeterDeviceId = deviceId;
                    scope.lblPowerMeterButton = "Close Power Meter";        
                    break;
                case antlib.STATUS_SEARCHING_CHANNEL:
                    scope.lblPowerMeterButton = "Stop Searching for Power Meter";        
                    break;
                case antlib.STATUS_ASSIGNED_CHANNEL:
                case antlib.STATUS_UNASSIGNED_CHANNEL:
                    scope.lblPowerMeterButton = "Search for Power Meter";
                    scope.powerMeterDeviceId = 0;
                    scope.bikePower = 0;
                    scope.cadence = 0;
                    scope.averageBikePower = 0;
                    break;
                default:
                    return;
            }

            scope.safeApply();
        });
        
        // Process FE-C messages.
        fec.on('message', (event, data, timestamp) => {
            //var message = { event, timestamp, data };
            // "Flatten" json so it's more usable.
            var message = Object.assign( {"timestamp":timestamp, "event":event}, data);
            messages.Trainer.push(message);

            scope.hello = event;
            if (event === "generalFEData") {
                scope.speed = (data.speedMps * MPS_TO_MPH).toFixed(1);
                // Convert to miles from meters.
                scope.distanceTravelled = formatDistance(data.distanceTravelled);
                scope.elapsedTime = formatTime(data.elapsedTime); // Accumulated Seconds
                // Also accumulate speed in a collection for average calc.
                speedEvents.push(timestamp, data);
            }
            else if (event === "generalSettings") {
                scope.resistanceLevel = data.resistanceLevel;
                scope.wheelCircumference = data.wheelCircumference;
                scope.state = data.state; 
            }
            else if (event === "specificTrainerData") {
                scope.trainerPower = data.instantPower;
                scope.trainerStatus = data.trainerStatus;
                scope.target_power_status = formatTargetPowerStatus(data.flags);
                scope.feState = formatFeState(data.feState);
                // Accumulate power events.
                trainerPowerEvents.push(message);
                scope.averageTrainerPower = getAverageTrainerPower(10);
                //scope.trainerPowerChartEvents.push({x: timestamp, y: data.instantPower});
                scope.trainerPowerChartEvents.push(data.instantPower);
            }
            else if (event === "irtExtraInfo") {
                scope.servoPosition = data.servoPosition;
                
                if (scope.servoPosition < 1600) {
                    var pctOn = (1600 - scope.servoPosition) / 800;
                    scope.servoChartData = [pctOn, 1 - pctOn];
                } 
                else {
                    scope.servoChartData = [0, 1];                    
                } 
                
                scope.target = data.target;
                scope.flywheelRevs = data.flywheelRevs;
                scope.powerMeterState = data.powerMeterConnected;
            }
            else if (event == "productInfo") {
                scope.swRevision = data.swRevision;
            }
            else if (event === "irtSettings") {
                scope.drag = data.drag;
                scope.rr = data.rr;
                scope.servoOffset = data.servoOffset;
                scope.settings = data.settings;

                irtSettings = data;
            }
            else if (event === "irtSettingsPowerAdjust") {
                scope.powerMeterId = data.powerMeterId;
                scope.powerAdjustSeconds = data.powerAdjustSeconds;
                scope.powerAverageSeconds = data.powerAverageSeconds;
                scope.servoSmoothingSteps = data.servoSmoothingSteps;
                scope.minAdjustSpeedMps = data.minAdjustSpeedMps;
            }            
            else if (event === "commandStatus") {
                scope.lastCommand = data.lastCommand;
                scope.lastCommandTime = new Date().toTimeString();
            }
            else if (event === "userConfig") {
                console.log("User config arrived.");
                scope.userWeightKg = data.userWeightKg;
                scope.bikeWeightKg = data.bikeWeightKg;
            }
            else if (event == "batteryStatus") {
                console.log("Battery Status", data);
            }
            scope.safeApply();
        });
        
        fec.on('channel_status', (status, deviceId) => {
            console.log("FEC channel_status: ", status);
            // Once we've connected to the FE-C, try connecting to other devices.
            if (status == antlib.STATUS_TRACKING_CHANNEL) {

                scope.trainerDeviceId = deviceId;
                scope.lblTrainerButton = "Close Trainer";

                // Grab settings from the FEC if we haven't already.
                if (irtSettings == null) { 
                    getSettings();
                }

                // TODO: ensure that bike power isn't already opened.
                // exclude ID of the FE-C device from power meter search.

                // TODO: how do we know this is channel "1"... should this be hardcoded?
                // Configure channel 1 to exclude the FE-C.
                // antlib.setDeviceExclusionList(1, exclude);
                // antlib.setLowPrioirtySearch(1);
                // bp.openChannel(); // specify device Id
                            
                // var exclude = [
                //     {
                //         deviceNumber : deviceId,
                //         deviceTypeId : 0,
                //         transmissionType : 0,
                //     }
                // ]; 
            }   
            else if (status == antlib.STATUS_ASSIGNED_CHANNEL) {
                irtSettings = null;
                scope.trainerDeviceId = 0;
                scope.lblTrainerButton = "Search for Trainer";
            }

            scope.safeApply();
        });
        
        powerAdjuster.on('message', (new_rr, rr, actual_power, trainer_power) => {
            console.log('Updated RR: ', new_rr, rr, actual_power, trainer_power);
        });

        //bg_scan.openChannel();
        //fec.openChannel();      
        //bp.openChannel();
        
        scope.cadence = 'n/a';
    }

    function close() {
        antlib.close();
    }
    
    /**
     * Invoked when log file parsing has reached the end of a ride.
     * 
     * @param {*} path 
     * @param {*} length 
     * @param {*} lastIndexParsed 
     */
    function onEndOfRideFile(path, length, lastIndexParsed) {
        var json = JSON.stringify(messages); 
        var filename = new Date().toISOString().replace(/:|\.|-/g,'') + '.json';
        fs.writeFile(filename, json);
        
        // TODO: need to get the full path of the local file to upload.
        //azure.azure_upload('vhds', filename, filename);
        // Clear the array.
        messages.PowerMeter = [];
        messages.Trainer = [];

        if (length > lastIndexParsed) {
            console.log("More to parse:", length, lastIndexParsed);
            LogParser.parseAsync(path, lastIndexParsed+1, onEndOfRideFile);
        }
    }

    /*
     * Opens a log file to begin parsing.
     */
    function openLogFile(path) {
        antlib.setFileMode(true);
        LogParser.parseAsync(path, 0, onEndOfRideFile);
    }

    /*
     * Depending on the current state of the trainer channel, either starts searching,
     * cancels a search or closes the channel.  If starting a search, it will use the
     * trainerDeviceId value to look for a trainer.
     * 
     * channel: 0 = trainer, 1 = power meter
     * 
     * Closed <-> Searching <-> Tracking
    */    
    function setChannel(channel, deviceId) {
        
        if (deviceId == null) {
            deviceId = 0;
        }

        var channelObj = null;
        
        if (channel == DEVICE_ENUM.TRAINER)
        {
            channelObj = fec;
        }
        else if (channel == DEVICE_ENUM.POWER_METER)
        {
            channelObj = bp;
        }

        var status = channelObj.getChannelStatus();
        console.log("current status: ", status);
    }

    function setBasicResistance(level) {
        console.log("setting basic resistance", level);
        fec.setBasicResistance(level);
    }
    
    function setTargetPower(power) {
        fec.setTargetPower(power);
    }

    function setServoPosition(position) {
        fec.setServoPosition(position);
    }

    function setDfuMode() {
        fec.setDfuMode();
    }

    function blinkLed() {
        fec.blinkLed();
    }

    function startSearchForPowerMetersOnFecDevice() {
        fec.searchForPowerMeters();
    }

    function toggleBackgroundScanning() {
        if (bg_scan.isChannelOpen()) {
            bg_scan.closeChannel();
            self.scope.lblBackgroundScanningButton = "Search for Devices";
        }
        else {
            bg_scan.openChannel();
            self.scope.lblBackgroundScanningButton = "Stop Searching for Devices";
        }
    }

    function searchForFECById(deviceId) {
        if (fec.getChannelStatus() == antlib.STATUS_TRACKING_CHANNEL) 
            fec.closeChannel();
        else
            fec.openChannel(deviceId);      
    }

    function searchForBikePowerById(deviceId) {
        if (bp.getChannelStatus() == antlib.STATUS_TRACKING_CHANNEL)
            bp.closeChannel();
        else
            bp.openChannel(deviceId);
    }

    function getSettings() {
        console.log('ant_service::getSettings() called.');
        fec.getSettings();
    }

    // Reads values from scope and updates user config and IRT settings on the device.
    function setSettings() {
        try {
            fec.setIrtSettings(parseFloat(self.scope.drag),
                parseFloat(self.scope.rr),
                parseInt(self.scope.servoOffset),
                parseInt(self.scope.settings),
                self.scope.persistSettings);
        }
        catch (err) {
            // just log to console for right now.
            console.log('setUserConfiguration', err);
        }        
        
        // Send 2nd command 1/2 second later.
        setTimeout(function () {
            try {
                fec.setUserConfiguration(
                    parseFloat(self.scope.userWeightKg),  
                    parseFloat(self.scope.bikeWeightKg),
                    parseInt(self.scope.wheelDiameter),
                    null /*gearRatio */);
            }
            catch (err) {
                // just log to console for right now.
                console.log('setSettings', err);
            }
        }, 500);        
    }

    // Sets power meter ID on the FE-C device.
    function setAdjustPowerMeter() {
        try {
        fec.setIrtPowerAdjustSettings(
            parseInt(self.scope.powerMeterId), 
            parseInt(self.scope.powerAdjustSeconds),
            parseInt(self.scope.powerAverageSeconds),
            parseInt(self.scope.servoSmoothingSteps),
            parseInt(self.scope.minAdjustSpeedMps),
            self.scope.persistSettings);
        }
        catch(err) {
            console.log('setAdjustPowerMeter', err);
        }
    }

    // Converts distance in meters to miles and formats to 2 decimal places.     
    function formatDistance(distance) {
        return (distance * METERS_TO_MILES).toFixed(2);        
    }
    
    // Returns a string in hh:mm:ss format from seconds.
    function formatTime(time) {
        var hours = Math.floor(time / 3600);       
        var minutes = Math.floor( ((time - (hours * 3600)) / 60) );
        var seconds =  Math.floor(time - ((hours * 3600) + (minutes * 60))); 
        
        return util.format('%s:%s:%s', 
            zpad(hours,2), 
            zpad(minutes, 2),
            zpad(seconds,2));
    }

    // Formats flags value for trainer target power status into a user string.
    function formatTargetPowerStatus(flags) {
        var value = "";
        switch (flags) {
            case 0: /*TARGET_AT_POWER*/
                value = "On Target";
                break;
            case 1: /*TARGET_SPEED_TOO_LOW*/
                value = "Too Slow";
                break;
            case 2: /*TARGET_SPEED_TOO_HIGH*/
                value = "Too Fast";
                break;
            default:
                value = "Target not set.";
                break;
        }

        return value;
    }

    // Formats the fitness equipment state field into a user string.
    function formatFeState(fe_state) {
        var value = "";
        switch (fe_state) {
            case 1: /*FE_ASLEEP_OFF*/
                value = "Off";
                break;
            case 2: /*FE_READY*/
                value = "Ready";
                break;
            case 3: /*FE_IN_USE*/
                value = "In use"
                break;
            case 4: /*FE_FINISHED_PAUSED*/
                value = "Finished or Paused.";
                break;
            default:
                value = "Not set.";
                break;
        }
        return value;
    }

    // Gets the average power for a specified period of seconds. 
    function getAveragePower(seconds) {  
        if (powerEvents.length > 1) {
            return antlib.getAveragePower(seconds, powerEvents);
        }
        else {
            return 0;
        }
    }    

    // Gets the average trainer power for a specified period of seconds. 
    function getAverageTrainerPower(seconds) {  
        if (trainerPowerEvents.length > 1) {
            return antlib.getAveragePower(seconds, trainerPowerEvents);
        }
        else {
            return 0;
        }
    }    

    // Gets the average speed for a specified period of seconds. 
    function getAverageSpeed(seconds) {  
        //return antlib.getAveragePower(seconds, eventCount, powerEvents);
        // TOOD: we're not averaging yet.
        if (speedEvents.length > 1) {
            return speedEvents[speedEvents.length-1].speedMps;
        }
        else {
            return 0;
        }
    }    

    function getChartTicks(events, func) {
        var ticks = new Array(events.length);
        for (var i = 0; i < events.length; i++) {
            ticks[i] = { x: events[i].time, y: func(events[i]) };
        }
        return ticks;
    }

    function getChartXAxisLabels() {
        return [];
    }

    function formatSpeed(data) {
        return (data.speedMps * MPS_TO_MPH).toFixed(1);
    }

    // Builds backing chart datasets from log data.
    function buildChartDatasets() {
        // datasets: [
        //             {
        //                 type: 'bar',
        //                 label: 'Bar Component',
        //                 data: [10, 20, 30],
        //             },
        //             {
        //                 type: 'line',
        //                 label: 'Line Component',
        //                 data: [30, 20, 10],
        //             }
        //         ]
        var speed = getChartTicks(speedEvents, formatSpeed);
        var cadence = [];
        var power = [];
        var estimatedPower = [];
        var targetPower = [];
        var servoPosition = [];        

        var chartDatasets = [
            {
                type: 'line',
                label: 'Speed (mph)',
                data: speed,
            },
            {
                type: 'line',
                label: 'Cadence',
                data: cadence,
            },
            {
                type: 'line',
                label: 'Power',
                data: power,
            },
            {
                type: 'line',
                label: 'Estimated Power',
                data: estimatedPower,
            },
            {
                type: 'line',
                label: 'Target Power',
                data: targetPower,
            },
            {
                type: 'line',
                label: 'Servo Position',
                data: servoPosition,
            },
        ];

        var chartData = {
            labels: getChartXAxisLabels(),
            datasets: chartDatasets
        };
    }

    // function scavangeAvailableDevices(availableDevices, timestamp) {
    //     const EXPIRY_SECONDS = 30;
    //     if (timestamp > EXPIRY_SECONDS) {
    //         var expired = availableDevices.filter(deviceInfo => 
    //             deviceInfo.timestamp < (timestamp - EXPIRY_SECONDS));
    //     }

    //     // Can't remove from an array, I either need to make the expired element "undefined"
    //     // or create a new array, not sure the new array will work because it's bound to the model.
    // }

    function addOrUpdateAvailableDevice(availableDevices, deviceInfo) {
        var element = availableDevices.find(function(value) {
            return value.deviceId == deviceInfo.deviceId;
        });
        if (element != null) {
            if (deviceInfo.manufacturerId != 0) {
                element.manufacturerId = deviceInfo.manufacturerId;
                element.manufacturerName = 
                    antManufacturer.getAntManufacturerNameById(deviceInfo.manufacturerId);
            }
            element.timestamp = deviceInfo.timestamp;
        }
        else {
            availableDevices.push(deviceInfo);
        }        

        // TODO: wipe any devices from the list that we haven't seen in a minute or so
        // based on timestamp.
        // scavangeAvailableDevices(availableDevices, deviceInfo.timestamp);
    }

    function addOrUpdateAvailableDeviceTypes(deviceInfo) {
        const BIKE_POWER_DEVICE_TYPE = 0x0B;
        const FEC_DEVICE_TYPE = 0x11;
        if (deviceInfo.deviceType == BIKE_POWER_DEVICE_TYPE) 
            addOrUpdateAvailableDevice(self.scope.availablePowerMeters, deviceInfo);
        else if (deviceInfo.deviceType == FEC_DEVICE_TYPE) 
            addOrUpdateAvailableDevice(self.scope.availableFeC, deviceInfo);
    }

    AntService.prototype.load = load;
    AntService.prototype.close = close;
    AntService.prototype.setBasicResistance = setBasicResistance;
    AntService.prototype.setTargetPower = setTargetPower;
    AntService.prototype.setDfuMode = setDfuMode;
    AntService.prototype.blinkLed = blinkLed;
    AntService.prototype.startSearchForPowerMetersOnFecDevice = startSearchForPowerMetersOnFecDevice;
    AntService.prototype.toggleBackgroundScanning = toggleBackgroundScanning;
    AntService.prototype.setServoPosition = setServoPosition;
    AntService.prototype.getSettings = getSettings;
    AntService.prototype.setSettings = setSettings;      
    AntService.prototype.setAdjustPowerMeter = setAdjustPowerMeter;
    AntService.prototype.openLogFile = openLogFile;
    AntService.prototype.setChannel = setChannel;
    AntService.prototype.searchForFECById = searchForFECById;
    AntService.prototype.searchForBikePowerById = searchForBikePowerById;
    AntService.prototype.DEVICE_ENUM = DEVICE_ENUM;
}

module.exports = AntService;
