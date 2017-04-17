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
    const AntFec = require('../ant/ant_fec.js');
    const AntBikePower = require('../ant/ant_bp.js');
    const PowerAdjuster = require('../ant/power_adjuster.js');
    
    const METERS_TO_MILES = 0.000621371;
    const MPS_TO_MPH = 2.23694;
    
    var fec = null; 
    var bp = null;
    var powerAdjuster = null;
    var scope = null;
    var self = this;

    var speedEvents = [];
    var powerEvents = [];
    var trainerPowerEvents = [];
    var irtSettings = null; // hang on to the last settings we recieved.

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
        
        /* Once you've found the FEC device, try searching for a power meter 
        * (low prioirty) so that it doesn't conflict with the FE-C channel.  
        * Setup an exclusion list so that it doesn't attach the IRT roller device
        * as both an FE-C and power meter since it uses both channels.
        */

        fec = new AntFec();
        bp = new AntBikePower();
        powerAdjuster = new PowerAdjuster(fec);
        
        // Process bike power messages.
        bp.on('message', (event, data) => {
            if (event === "standardPowerOnly") {
                scope.bikePower = data.instantPower;
                
                if (data.instantCadence != 0xFF) {
                    scope.cadence = data.instantCadence;
                }
                else {
                    scope.cadence = 0;
                }

                // Accumulate power events.
                powerEvents.push(data);
                // Get 10 second average.
                scope.averageBikePower = getAveragePower(3); 
                scope.averageTrainerPower = getAverageTrainerPower(3);
                
                if (scope.powerAdjustEnabled == true) {
                    scope.new_rr = powerAdjuster.adjust(
                        getAverageSpeed(3), 
                        scope.averageBikePower,
                        scope.averageTrainerPower );                
                }
            }
            else {
                scope.bikePower = 0;
            }
            scope.$apply();
        });
        
        // Process FE-C messages.
        fec.on('message', (event, data) => {
            scope.hello = event;
            if (event === "generalFEData") {
                scope.speed = (data.speedMps * MPS_TO_MPH).toFixed(1);
                // Convert to miles from meters.
                scope.distanceTravelled = formatDistance(data.distanceTravelled);
                scope.elapsedTime = formatTime(data.elapsedTime); // Accumulated Seconds
                // Also accumulate speed in a collection for average calc.
                speedEvents.push(data);
            }
            else if (event === "generalSettings") {
                scope.resistanceLevel = data.resistanceLevel;
                scope.wheelCircumference = data.wheelCircumference;
                scope.state = data.state; 
            }
            else if (event === "specificTrainerData") {
                scope.trainerPower = data.instantPower;
                // Accumulate power events.
                trainerPowerEvents.push(data);
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
            else if (event === "commandStatus") {
                scope.lastCommand = data.lastCommand;
                scope.lastCommandTime = new Date().toTimeString();
            }
            else if (event === "userConfig") {
                console.log("User config arrived.");
                scope.userWeightKg = data.userWeightKg;
                scope.bikeWeightKg = data.bikeWeightKg;
            }
            scope.$apply();
        });
        
        fec.on('channel_status', (status, deviceId) => {
            // Once we've connected to the FE-C, try connecting to other devices.
            if (status == antlib.STATUS_TRACKING_CHANNEL) {
                // Grab settings from the FEC if we haven't already.
                if (irtSettings == null) { 
                    getSettings();
                }

                // TODO: ensure that bike power isn't already opened.
                // exclude ID of the FE-C device from power meter search.
            
                var exclude = [
                    {
                        deviceNumber : deviceId,
                        deviceTypeId : 0,
                        transmissionType : 0,
                    }
                ];
                // TODO: how do we know this is channel "1"... should this be hardcoded?
                // Configure channel 1 to exclude the FE-C.
                antlib.setDeviceExclusionList(1, exclude);
                antlib.setLowPrioirtySearch(1);
                
                bp.openChannel(); // specify device Id         
            }              
        });
        
        // Configure the channel.
        fec.openChannel();
        
        scope.cadence = 'n/a';
    }

    function close() {
        antlib.close();
    }
    
    function setBasicResistance(level) {
        console.log("setting basic resistance", level);
        fec.setBasicResistance(level);
    }
    
    function setTargetPower(power) {
        fec.setTargetPower(power);
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

    AntService.prototype.load = load;
    AntService.prototype.close = close;
    AntService.prototype.setBasicResistance = setBasicResistance;
    AntService.prototype.setTargetPower = setTargetPower;
    AntService.prototype.getSettings = getSettings;
    AntService.prototype.setSettings = setSettings;      
}

module.exports = AntService;
