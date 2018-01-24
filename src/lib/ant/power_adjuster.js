/*
 * Copyright (c) 2017 Inside Ride Technologies, LLC. All Rights Reserved.
 * Author: Jason De Lorme (jason@insideride.com)
 *
 * Responsible for compensation / adjusting roller magnet power based on actual power.
 */

// Set this up as an event emitter.
const util = require('util');
const EventEmitter = require('events').EventEmitter;

const PowerAdjuster = function(ant_fec) { 
    var self = this;

    // adjust() can be called at any frequency.  This flag indicates when it is
    // benefitial to attempt adjustment. 
    var readyToAdjust = true;
        
    const THRESHOLD_WATTS = 3; // Don't adjust unless we're off by +/- 'n' watts.
    const ADJUST_FREQUENCY = 5000; // Don't adjust more than once every 'n' seconds.
    
    // Enum of module state.
    const TargetStateEnum = {
        NO_TARGET : 0, // no target set.
        TARGET_NOT_READY : 1, // just received, wait for average to get calculated.
        TARGET_READY : 2 // ready to calculate any offset required.
    };

    var target_state = TargetStateEnum.NO_TARGET;
    var fec; // trainer for target power, speed, settings (read/write)
    var irtSettings = null; // store FEC settings.

    fec = ant_fec;

    // Process FE-C messages.
    fec.on('message', (event, data) => {
        if (event === "irtSettings") {
            irtSettings = data;
        }
    });

    // Adjusts rolling resistance calibration dynamically based on actual power 
    // from power meter versus estimated trainer power.
    function adjust(speed_mps, actual_power, trainer_power) {

        if (readyToAdjust == false) {
            return;
        }

        if (speed_mps <= 0.0 || actual_power <= 0.0) {
           // nothing to be done.
            return;
        }

        // Check to see that power is off enough to be worth adjusting.
        if (!aboveThreshold(THRESHOLD_WATTS, actual_power, trainer_power)) {
            return;
        }

        if (irtSettings == null || isNaN(irtSettings.rr)) {
            console.log("IRT Settings not received yet, no rr to calculate adjustment with.");
            // Call to get for next time.
            fec.getIrtSettings();
            return;
        }

        var new_rr = calc_rr(irtSettings.rr, irtSettings.drag, speed_mps, 
            actual_power, trainer_power);

        readyToAdjust = false;

        // Send the new rr to the device.
        setRR(new_rr);
        // Wait a few seconds before allowing another adjustment.
        setTimeout(function() {
            readyToAdjust = true;
        }, ADJUST_FREQUENCY);

        // Emit event; calculated new rr.
        self.emit('message', 'SET_RR', new_rr, irtSettings.rr, actual_power, trainer_power);

        return new_rr;        
    }

    // Invokes ant_fec to set the new rr value and request that it was set.
    function setRR(new_rr) {
        // TOOD: try/catch here, in case it fails.
        fec.setIrtSettings(null, new_rr, null, null, false);
        
        // Send request 1/4 second later to request the same value to confirm.
        setTimeout(function () {
            fec.getIrtSettings();
        }, 250);        
    }

    // Calculates new rolling resistance value based on difference between 
    // estimated and actual power and existing rr, drag (k), velocity in mps.
    function calc_rr(rr, k, v, actual_power, trainer_power) {
        /* formula to solve for 'm' (current magnet force).
        // this is wrong: var m = (trainer_power/v) - (k*v) - rr;

        if (isNaN(m) || m <= 0) {
            m = 0;
        }
        */
        var delta_force = (actual_power - trainer_power) / v;
        var new_rr = rr + delta_force;

        if (new_rr <= 0) {
            throw new Error("Invalid new_rr calculation: ", 
                rr, new_rr, delta_force, actual_power, trainer_power);
        }

        return new_rr;
    }

    // Determines if a value is above a threshold range.
    function aboveThreshold(threshold, new_value, old_value) {
        return ( new_value >= (old_value + threshold) || 
            new_value <= (old_value - threshold) );
    }

    PowerAdjuster.prototype.calc_rr = calc_rr;
    PowerAdjuster.prototype.adjust = adjust;

};

util.inherits(PowerAdjuster, EventEmitter);

module.exports = PowerAdjuster;