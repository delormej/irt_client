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
    var fec = null; 
    var bp = null;

    // Loads the ANT library.
    /* This is loaded in main.js otherwise it goes out of scope and gets GC'd.
    * however this creates a problem in that we need to use ipc to communicate 
    * to the renderer process.
    */
    function load(scope) {
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
        
        // exclude ID of the FE-C device from power meter search.
        var exclude = [
            {
                deviceNumber : 37894,
                deviceTypeId : 0,
                transmissionType : 0,
            }
        ];
        /* Configure channel 1.
        antlib.setDeviceExclusionList(1, exclude);
        antlib.setLowPrioirtySearch(1); */
        
        
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
                scope.speed = (data.speedMps * 2.23).toFixed(1);
                scope.distanceTravelled = data.distanceTravelled;
                scope.elapsedTime = data.elapsedTime; // Accumulated Seconds
                // Also accumulate speed in a collection for average calc.
            }
            else if (event === "specificTrainerData") {
                scope.trainerPower = data.instantPower;
            }
            else if (event === "irtExtraInfo") {
                scope.servoPosition = data.servoPosition;
            }
            else if (event == "productInfo") {
                scope.swRevision = data.swRevision;
            }
            
            scope.$apply();
        });
        
        // Configure the channel.
        fec.openChannel();
        bp.openChannel(101); // specify device Id
        
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

    AntService.prototype.load = load;
    AntService.prototype.close = close;
    AntService.prototype.setBasicResistance = setBasicResistance;
    AntService.prototype.setTargetPower = setTargetPower;   
}

module.exports = AntService;
