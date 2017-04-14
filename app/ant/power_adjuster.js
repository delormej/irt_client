/*
 * Copyright (c) 2017 Inside Ride Technologies, LLC. All Rights Reserved.
 * Author: Jason De Lorme (jason@insideride.com)
 *
 * Responsible for compensation / adjusting roller magnet power based on actual power.
 */

// Set this up as an event emitter.
const util = require('util');
const EventEmitter = require('events').EventEmitter;

const METERS_TO_MILES = 0.000621371;
const MPS_TO_MPH = 2.23694;

const PowerAdjuster = function(ant_fec) { 
    var self = this;

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

        if (speed_mps <= 0.0 || actual_power <= 0.0) {
           // nothing to be done.
            return;
        }

        if (irtSettings == null || isNaN(irtSettings.rr)) {
            console.log("IRT Settings not received yet, no rr to calculate adjustment with.");
            return;
        }

        // TODO:  check if we're in the right TargetStateEnum ?

        var new_rr = calc_rr(irtSettings.rr, irtSettings.drag, speed_mps, 
            actual_power, trainer_power);

        // TOOD: Should check here that setting is worthwhile, i.e. it's over a certain
        // threshold of change. 

        // Send the new rr to the device.
        setRR(new_rr);

        // Emit event; calculated new rr.
        self.emit('message', 'SET_RR', new_rr, irtSettings.rr, actual_power, trainer_power);

        // TODO: is this module going to figure out when it's time to adjust?
        // Reset the status to reset timer for next interval.
        // target_state = TargetStateEnum.TARGET_NOT_READY;

        // TODO: force that we don't set within 3 seconds of a new rr adjustment.

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
        // formula to solve for 'm' (current magnet force).
        var m = (trainer_power/v) - (k*v) - rr;

        if (isNaN(m) || m <= 0) {
            throw new Error('Could not calculate magnet power.');
        }

        var delta_force = (actual_power - trainer_power) / v;
        var new_rr = rr + delta_force;

        return new_rr;
    }

    PowerAdjuster.prototype.calc_rr = calc_rr;
    PowerAdjuster.prototype.adjust = adjust;

};

util.inherits(PowerAdjuster, EventEmitter);

module.exports = PowerAdjuster;