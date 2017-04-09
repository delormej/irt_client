/*
 * Copyright (c) 2017 Inside Ride Technologies, LLC. All Rights Reserved.
 * Author: Jason De Lorme (jason@insideride.com)
 *
 * Responsible for compensation / adjusting roller magnet power based on actual power.
 */

// Set this up as an event emitter.
const util = require('util');
const EventEmitter = require('events').EventEmitter;

const PowerAdjuster = function() { 
    var self = this;

    // Enum of module state.
    const TargetStateEnum = {
        NO_TARGET : 0, // no target set.
        TARGET_NOT_READY : 1, // just received, wait for average to get calculated.
        TARGET_READY : 2 // ready to calculate any offset required.
    };

    var target_state = NO_TARGET;
    var average_seconds = 5;
    var drag;
    var original_rr;
    var bp; // bike power module for actual power events
    var fec; // trainer for target power, speed, settings (read/write)
    var bp_accum_power;
    var bp_event_count;
    var last_target_power;
    var last_rr;
        
    function init(ant_bp, ant_fec) {
        bp = ant_bp;
        // register listeners for bike power messages.
        
        fec = ant_fec;
        // register listeners for fec messages.
    }

    // invoked when message from fec comes? todo: figure this out.
    function process() {



        var speed_mps = 0.0; // need to get this from fec messages.
        var target_power = 0.0; // need to get this from fec messages.
        var average_power = 0.0; // need to get this from bp messages.
        
        if (speed_mps <= 0.0 || target_power <= 0.0 || 
                target_power == last_target_power) {
           // nothing to be done.
            return;
        }

        var new_rr = calc_rr(last_rr, drag, speed_mps, target_power, average_power);

        // TOOD: Should check here that setting is worthwhile, i.e. it's over a certain
        // threshold of change.

        // Send the new rr to the device.
        setRR(new_rr);
        
        // update state.
        last_target_power = target_power;

        // Emit event; calculated new rr.
        self.emit('message', 'SET_RR', new_rr, last_rr, actual_power, target_power);

        // Reset the status to reset timer for next interval.
        target_state = TARGET_NOT_READY;

        return;        
    }

    // Sets the time window to average actual power in seconds.
    function setAverageSeconds(seconds)  {
        // do some evalutation on bounds
        //if (seconds <= 0 || seconds > (60 * 60))
        //    throw new Exception("Average out of bounds.");

        average_seconds = seconds;
    }

    // invokes ant_fec to set the new rr value.
    function setRR(new_rr) {
        // TOOD: try/catch here, in case it fails.
        fec.setIrtSettings(null, new_rr, null, null);
    }

    // Calculates new rolling resistance value based on difference between 
    // target and actual power and existing rr, drag (k), velocity in mps.
    function calc_rr(rr, k, v, target_power, actual_power) {
        // formula to solve for 'm' (current magnet force).
        var m = (actual_power/v) - (k*v) - rr;

        if (isNaN(m) || m <= 0) {
            throw new Error('Could not calculate magnet power.');
        }

        var delta_force = (target_power - actual_power) / v;
        var new_rr = last_rr + delta_force;

        return new_rr;
    }
};

util.inherits(PowerAdjuster, EventEmitter);
module.exports = PowerAdjuster;