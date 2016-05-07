/*
 * Copyright (c) 2016 Inside Ride Technologies, LLC. All Rights Reserved.
 * Author: Jason De Lorme (jason@insideride.com)
 *
 * [description ...]
 */

const AntService = function() {
    const antlib = require('../ant/antlib.js');
    const AntFec = require('../ant/ant_fec.js');
    const AntBikePower = require('../ant/ant_bp.js');
    
    const METERS_TO_MILES = 0.000621371;
    const MPS_TO_MPH = 2.23694;
    
    var fec = null; 
    var bp = null;
    var scope = null;
    var self = this;

    // Loads the ANT library.
    /* This is loaded in main.js otherwise it goes out of scope and gets GC'd.
    * however this creates a problem in that we need to use ipc to communicate 
    * to the renderer process.
    */
    function load(scope) {
        self.scope = scope;
        antlib.init();
        //console.log("Loaded ANT: ", antlib.antVersion());
        scope.version = antlib.antVersion();
        
        /* Once you've found the FEC device, try searching for a power meter 
        * (low prioirty) so that it doesn't conflict with the FE-C channel.  
        * Setup an exclusion list so that it doesn't attach the IRT roller device
        * as both an FE-C and power meter since it uses both channels.
        */

        fec = new AntFec();
        bp = new AntBikePower();
        
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
            }
            else {
                scope.bikePower = 'no data';
            }
            scope.$apply();
        });
        
        // Process FE-C messages.
        fec.on('message', (event, data) => {
            scope.hello = event;
            if (event === "generalFEData") {
                scope.speed = (data.speedMps * MPS_TO_MPH).toFixed(1);
                // Convert to miles from meters.
                scope.distanceTravelled = (data.distanceTravelled * METERS_TO_MILES).toFixed(2);
                scope.elapsedTime = (data.elapsedTime); // Accumulated Seconds
                // Also accumulate speed in a collection for average calc.
            }
            else if (event === "generalSettings") {
                scope.resistanceLevel = data.resistanceLevel;
                scope.wheelCircumference = data.wheelCircumference;
                scope.state = data.state; 
            }
            else if (event === "specificTrainerData") {
                scope.trainerPower = data.instantPower;
            }
            else if (event === "irtExtraInfo") {
                scope.servoPosition = data.servoPosition;
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
            fec.setIrtSettings(self.scope.drag,
                self.scope.rr,
                self.scope.servoOffset,
                self.scope.settings);
        }
        catch (err) {
            // just log to console for right now.
            console.log('setUserConfiguration', err);
        }        
        
        // Send 2nd command 1/2 second later.
        setTimeout(function () {
            try {
                fec.setUserConfiguration(
                    self.scope.userWeightKg,  
                    self.scope.bikeWeightKg,
                    self.scope.wheelDiameter,
                    null /*gearRatio */);
            }
            catch (err) {
                // just log to console for right now.
                console.log('setSettings', err);
            }
        }, 500);        
    }

    AntService.prototype.load = load;
    AntService.prototype.close = close;
    AntService.prototype.setBasicResistance = setBasicResistance;
    AntService.prototype.setTargetPower = setTargetPower;
    AntService.prototype.getSettings = getSettings;
    AntService.prototype.setSettings = setSettings;      
}

module.exports = AntService;
