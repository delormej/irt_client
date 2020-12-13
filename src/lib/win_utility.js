/*
 * Copyright (c) 2016 Inside Ride Technologies, LLC. All Rights Reserved.
 * Author: Jason De Lorme (jason@insideride.com)
 *
 * Windows specific helper functions. 
 */
const ffi = require('ffi');

const kernel32 = ffi.Library('kernel32.dll', {
    'SetThreadExecutionState': ['uint32', ['uint32'] ] 
});
    
// Prevents Windows from going to sleep while this thread is running. 
function preventShutdown() {
    var CONTINUOUS = 0x80000000;
    var DISPLAY_REQUIRED = 0x00000002;
    var SYSTEM_REQUIRED = 0x00000001;    
    
    return kernel32.SetThreadExecutionState(
        (CONTINUOUS | DISPLAY_REQUIRED | SYSTEM_REQUIRED) >>> 0);
}    

exports.preventShutdown = preventShutdown;
