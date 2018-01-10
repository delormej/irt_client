/*
 * Copyright (c) 2016 Inside Ride Technologies, LLC. All Rights Reserved.
 * Author: Jason De Lorme (jason@insideride.com)
 *
 * Interop to native C library for talking to ANT USB device. 
 */

const ref = require('ref');
const ffi = require('ffi');
const process2 = require('process');

const BIKE_POWER_DEVICE_TYPE = 0x0B;
const FEC_DEVICE_TYPE = 0x11;
const HEART_RATE_DEVICE_TYPE = 0x78;

const BAUD_RATE = 57600;
const PORT_TYPE_USB = 0;
const FRAMER_TYPE_BASIC = 0;
const ANT_NETWORK = 0;
const CHANNEL_TYPE_SLAVE = 0;
const ANT_KEY = [ 0xb9, 0xa5, 0x21, 0xfb, 0xbd, 0x72, 0xc3, 0x45 ];
const ANT_DEVICE_NUMBER = 0;
const ANT_DEVICE_TYPE = 0x11;
const ANT_TRANSMISSION_TYPE = 0x5;
const ANT_FREQ = 57;
const ANT_CHANNEL_PERIOD = 8192;
const ANT_CHANNEL_ID = 0;

const ANT_MESSAGELEN_POS = 1;
const ANT_MESSAGEID_POS = 2; // position in the buffer for the message id.
const ANT_CHANNELID_POS = 3; // position in the buffer for the channel id.

const RESPONSE_NO_ERROR = 0;
const EVENT_RX_SEARCH_TIMEOUT = 0x01;
const EVENT_RX_FAIL= 0x02;
const EVENT_RX_BROADCAST = 0x9A;           // returned when module receives broadcast data
const EVENT_RX_ACKNOWLEDGED = 0x9B;           // returned when module receives acknowledged data
const EVENT_RX_BURST_PACKET = 0x9C;           // returned when module receives burst data
const EVENT_CHANNEL_CLOSED = 0x07;
const EVENT_RX_FAIL_GO_TO_SEARCH = 0x08;
const EVENT_CHANNEL_COLLISION = 0x09;

const EVENT_RX_FLAG_BROADCAST = 0xA3;
const EVENT_RX_FLAG_ACKNOWLEDGED = 0xA4;

const MESG_STARTUP_MESG_ID = 0x6F;
const MESG_CHANNEL_STATUS_ID = 0x52;
const MESG_RESPONSE_EVENT_ID = 0x40;
const MESG_NETWORK_KEY_ID = 0x46;
const MESG_ASSIGN_CHANNEL_ID = 0x42;
const MESG_CHANNEL_ID_ID = 0x51;
const MESG_CHANNEL_RADIO_FREQ_ID = 0x45;
const MESG_OPEN_CHANNEL_ID = 0x4B;
const MESG_UNASSIGN_CHANNEL_ID = 0x41;
const MESG_CLOSE_CHANNEL_ID = 0x4C;
const MESG_REQUEST_ID = 0x4D;
const MESG_BROADCAST_DATA = 0x4E;
const MESG_ACKNOWLEDGED_DATA = 0x4F;
const MESG_BURST_DATA = 0x50;

const MESG_MAX_SIZE_VALUE = 41;
const ANT_STANDARD_DATA_PAYLOAD_SIZE = 8;

const MAX_CHANNELS = 8;

const REQUEST_DATA_PAGE = 0x46;
const MANUFACTURER_PAGE = 0x50;
const PRODUCT_PAGE = 0x51;
const BATTERY_STATUS_PAGE = 0x52;

const STATUS_UNASSIGNED_CHANNEL = 0x00;
const STATUS_ASSIGNED_CHANNEL = 0x01;
const STATUS_SEARCHING_CHANNEL = 0x02;
const STATUS_TRACKING_CHANNEL = 0x03;

const BG_SCANNING_CHANNEL_ID = 0;

// Internal memory structures used by ANT library for sending and recieving messages. 
const responseBuffer = new Buffer(MESG_MAX_SIZE_VALUE);

// Array of channel configurations.
const channelConfigs = new Array(8);

// Native library definition.
const antlib = ffi.Library(libPath(), {
    'ANT_LibVersion': ['string', [] ],
    'ANT_Init': ['bool', ['uchar', 'ulong', 'uchar', 'uchar'] ],
    'ANT_AssignResponseFunction': ['void', [ 'pointer', 'pointer' ] ],
    'ANT_AssignChannelEventFunction': ['void', [ 'uchar', 'pointer', 'pointer' ] ],
    'ANT_AssignChannel': ['bool', ['uchar', 'uchar', 'uchar'] ],
    'ANT_AssignChannelExt': ['bool', ['uchar', 'uchar', 'uchar', 'uchar'] ],
    'ANT_UnAssignChannel': ['bool', ['char']],
    'ANT_SetChannelId': ['bool', ['uchar', 'ushort', 'uchar', 'uchar' ] ],
    'ANT_SetChannelRFFreq': ['bool', ['uchar', 'uchar'] ],
    'ANT_SetChannelPeriod': ['bool', ['uchar', 'ushort'] ],
    'ANT_SendBroadcastData': ['bool', ['uchar', 'pointer'] ],
    'ANT_SendAcknowledgedData': ['bool', ['uchar', 'pointer'] ],
    'ANT_RxExtMesgsEnable': ['bool', ['uchar']],
    'ANT_ResetSystem': ['bool', [] ],
    'ANT_OpenChannel': ['bool', ['uchar'] ],
    'ANT_CloseChannel': ['bool', ['uchar'] ],
    'ANT_SetNetworkKey': ['bool', ['uchar', 'pointer'] ],
    'ANT_RequestMessage': ['bool', ['uchar', 'uchar'] ],
    'ANT_ConfigList': ['bool', ['uchar', 'uchar', 'uchar'] ],
    'ANT_AddChannelID': ['bool', ['uchar', 'ushort', 'uchar', 'uchar', 'uchar'] ],
    'ANT_SetLowPriorityChannelSearchTimeout': ['bool', ['uchar', 'uchar'] ],
    'ANT_SetChannelSearchTimeout': ['bool', ['uchar', 'uchar'] ],
    'ANT_Nap': ['void', ['ulong'] ],
    'ANT_SetDebugLogDirectory': ['bool', ['string'] ],
    'ANT_Close': ['void', [] ]
});

// Global variable indicates if the module has been initialized.
var initialized = false;
// Flag to indicate true if we are invoking this from a log file.
var fileMode = false;
// Time in seconds since 1/1/1970, all timestamps will be relative to this.
var startTime = Date.now() / 1000; 

// Returns a string representing the ANT Library version.
function antVersion() {
    return antlib.ANT_LibVersion();    
}

// Sets the debug log directory.
// NOTE: This is ignored unless running a debug build of the ANT_DLL.
function setDebugLogDirectory(directory) {
    var status = antlib.ANT_SetDebugLogDirectory(directory);
    if (status) {
        console.log('SUCCESS: Set debug log directory to ', directory);
    } else {
        console.log('ERROR: Failed to set debug log directory to ', directory);
    }

    return status;
}

// Flags antlib's mode to work on a file log vs. interacting with the ANT device.
function setFileMode(value) {
    fileMode = value;
}

// Called when a channel Id message is received which contains the device it found.
function onChannelId(channelId) {
    var deviceTypeId = responseBuffer[3];
    console.log("parseChannelId::",
        responseBuffer[0], responseBuffer[1], responseBuffer[2], 
        responseBuffer[3],responseBuffer[4]);

    // Interrupt if the deviceType is not set.
    if (deviceTypeId == 0)
        return;
    let channelDevice = {
        deviceId: responseBuffer[1] | responseBuffer[2] << 8, 
        deviceType: responseBuffer[3],
        transmissionType: responseBuffer[4] 
    };
    channelConfigs[channelId].channelIdCallback(channelId, channelDevice);
}

// Callback for ANT device responses.
function deviceResponse(channelId, messageId) {
    if (channelId == 0) 
        return;
    // Load the appropriate channel configuration based on channelId of message.    
    var channelConfig = channelConfigs[channelId];
    if (channelConfig == null) {
        console.log(channelId, ' Channel not configured, message recieved:', messageId);
        return;
    }
    // Process the incoming message.
    switch (messageId) {
        case MESG_STARTUP_MESG_ID:
            console.log('ANT Started.');
            break;      
        case MESG_CHANNEL_ID_ID:
            onChannelId(channelId);
            break;
        default:
            console.log('response:', messageId, responseBuffer);
            break;
    }
}

function getTimestamp() {
    // time in milliseconds since module started recording.
    let timestamp = (Date.now() / 1000) - startTime;
    return timestamp;
}

// Called when channel events occur.
function channelEvent(channelId, eventId) {
    if (channelConfigs[channelId] != null) {
        // time in milliseconds since module started recording.
        var timestamp = getTimestamp();
        switch(eventId) {
            case EVENT_RX_FAIL:
                console.log('EVENT_RX_FAIL channel:', channelId);
                break;
            case EVENT_CHANNEL_COLLISION:
                console.log('EVENT_CHANNEL_COLLISION channel:', channelId);
                break;
            case EVENT_RX_SEARCH_TIMEOUT:
            case EVENT_CHANNEL_CLOSED:
            case EVENT_RX_FAIL_GO_TO_SEARCH:
                // Get the channel status.
                requestMessage(channelId, MESG_CHANNEL_STATUS_ID);
                break;
            default:
                // Invoke the channel's callback.
                channelConfigs[channelId].channelCallback(channelId, eventId, timestamp);
                break;
        }
    }
    else {
        console.log('no channel.');
    }
}

// Determines if the app is being run from a deployed ASAR package.
function isRunningInAsar() {
	return process.mainModule.filename.indexOf('app.asar') !== -1;    
}

// Determins the right library path based on OS version.
function libPath() {
    var path = require('path');
    var isWindows = /^win/.test(process2.platform);
    var lib = '';

    if (isWindows) {
        // When running in ASAR dependencies are deployed in app directory. 
        if (isRunningInAsar()) {
            lib = 'ANT_DLL';
        }
        else
        {
            /*
              NOTE: if you get a Win32 Error Code 126, it likely means that the cwd electron is starting in is wrong, 
              electron's cwd should be the root workspace (not src).  
              console.log("Current dir:" + process.cwd());
            */
            lib = path.join('lib/ant', 'ANT_DLL');        
        }
    }
    else 
    {
        // MacOSX impementation:
        var remote = require('remote');
        var app = remote.require('app');

        var base = path.join(
            path.parse(app.getAppPath()).dir,
            '..', '..');

        if (base.endsWith('.app')) {
            // If *installed* on a Mac, it's deployed into [AppName].app/Content/Resources/...
            lib = path.join(base, 'libANT');
        }
        else {
            // In development mode, just find the library.
            lib = 'libANT';
        }
    }    

    return lib;
}

// Sets the ANT+ proprietary network key which cannot be distributed.
function setNetworkKey() {
    // TODO: load this from a file or MASK this out somehow in what gets promoted to scc.
    var key = new Buffer(ANT_KEY);
    return antlib.ANT_SetNetworkKey(ANT_NETWORK, key);    
}

// Assign deviceResponse function to handle callbacks from ANT+ device (MCU).
const responseCallback = ffi.Callback('bool', [ 'uchar', 'uchar' ], deviceResponse);

// Callback for ANT channel events.
const channelEventCallback = ffi.Callback('bool', [ 'uchar', 'uchar' ], channelEvent);

// Loads the native ANT library and Initializes the ANT+ network key. 
function init() {    
    // If init already called or in filemode, exit.
    if (initialized || fileMode)
        return; 
    
    var ver = antVersion();
    console.log(ver);

    var success = antlib.ANT_Init(ANT_DEVICE_NUMBER, 
        BAUD_RATE, PORT_TYPE_USB, FRAMER_TYPE_BASIC);
    
    if (!success) {
        throw new Error('Unable to initialize ANT+, please check USB key is available and not in use by another application.');
    }
    console.log('ANT initialized.');
    
    antlib.ANT_AssignResponseFunction(responseCallback, responseBuffer);    
    
    // Seems prototypical to reset the system after an init.
    if (antlib.ANT_ResetSystem()) {
        antlib.ANT_Nap(500);       // ms to nap 
    }
    else {
        throw new Error('Unable to do initialize ANT module.');
    }
    
    // Set the network key.
    if (!setNetworkKey()) {
       throw new Error('Unable to set ANT+ network key.'); 
    }
    
    initialized = true;
}

function enableExtendedMessages(enable) {
    const ENABLE_EXT_MSG = 0x01;
    
    if (!antlib.ANT_RxExtMesgsEnable(enable))
        throw new Error('Unable to enable extended messages.');    
}

function openBackgroundScanningChannel(config) {
    const BG_SCANNING_CHANNEL_TYPE = 0x40;
    const EXT_PARAM_ALWAYS_SEARCH = 0x01;
    const WILDCARD_DEVICE_ID = 0;
    const WILDCARD_DEVICE_TYPE = 0;
    const TRANSMISSION_TYPE = 0;
    const SEARCH_TIMEOUT_INFINITE = 0xFF;
    const TIMEOUT_DISABLED = 0;
    const CHANNEL_FREQUENCY = 57;

    channelConfigs[BG_SCANNING_CHANNEL_ID] = config;

    if (!antlib.ANT_AssignChannelExt(BG_SCANNING_CHANNEL_ID, BG_SCANNING_CHANNEL_TYPE, ANT_NETWORK, EXT_PARAM_ALWAYS_SEARCH)) 
        throw new Error('Unable to assign channel.');         

    if (!antlib.ANT_SetChannelId(BG_SCANNING_CHANNEL_ID, WILDCARD_DEVICE_ID, WILDCARD_DEVICE_TYPE,
            TRANSMISSION_TYPE))
        throw new Error('Unable to set channel id.');

    enableExtendedMessages(true);

    if (!antlib.ANT_SetLowPriorityChannelSearchTimeout(BG_SCANNING_CHANNEL_ID, SEARCH_TIMEOUT_INFINITE))
        throw new Error("Unable to set low priority channel search timeout.");

    if (!antlib.ANT_SetChannelSearchTimeout(BG_SCANNING_CHANNEL_ID, TIMEOUT_DISABLED))
        throw new Error("Unable to disable search timeout.");

    antlib.ANT_AssignChannelEventFunction(BG_SCANNING_CHANNEL_ID, 
        channelEventCallback, 
        config.buffer);    

    if (!antlib.ANT_SetChannelRFFreq(BG_SCANNING_CHANNEL_ID, CHANNEL_FREQUENCY)) 
        throw new Error("Unable to set channel frequency.");    

    if (!antlib.ANT_OpenChannel(BG_SCANNING_CHANNEL_ID))
        throw new Error("Unable to open channel.");        
}

function openChannel(channelId, config) {
    const HIGH_PRI_SEARCH_TIMEOUT = 2; 
    const LOW_PRI_SEARCH_TIMEOUT = 10; // 10 == 25s
    const ffiChannelCallback = ffi.Callback('bool', [ 'uchar', 'uchar' ], config.channelCallback);
    // A copy of the ffi version of the callback is required to be stored, otherwise it will be garbage collected.
    let channelConfig = {
        ffiChannelCallback: ffiChannelCallback,
        channelCallback: config.channelCallback, // only for legacy reasons, once FEC/BP are migrated, this can be removed.
        channelIdCallback: config.channelIdCallback,
    };
    channelConfigs[channelId] = channelConfig;
    if (!antlib.ANT_AssignChannel(channelId, config.channelType, ANT_NETWORK))
        throw new Error('Unable to assign channel.');
    antlib.ANT_AssignChannelEventFunction(channelId, ffiChannelCallback, config.buffer) 
    if (!antlib.ANT_SetChannelId(channelId, 
            config.deviceId, 
            config.deviceType, 
            config.transmissionType))
        throw new Error('Unable to set channel id.');
    if (!antlib.ANT_SetChannelRFFreq(channelId, config.frequency))
        throw new Error('Unable to set channel frequency.');
    if (!antlib.ANT_SetChannelPeriod(channelId, config.channelPeriod))
        throw new Error('Unable to set channel period.');
    if (!antlib.ANT_SetChannelSearchTimeout(channelId, HIGH_PRI_SEARCH_TIMEOUT))
        throw new Error("Unable to disable search timeout.");
    if (!antlib.ANT_SetLowPriorityChannelSearchTimeout(channelId, LOW_PRI_SEARCH_TIMEOUT))
        throw new Error("Unable to set low priority channel search timeout.");   
    if (!antlib.ANT_OpenChannel(channelId))
        throw new Error("Unable to open channel.");   
    return channelId;
}

// Closes the ANT channel.
function closeChannel(channelId) {
    antlib.ANT_CloseChannel(channelId);
    if (!antlib.ANT_UnAssignChannel(channelId))
        throw new Error("Unable to unassign channel: " + channelId);
}

// This message is sent to the device to request a specific information message from the device.
function requestMessage(channelId, messageId) {
    return antlib.ANT_RequestMessage(channelId, messageId);
}

// Requests channel details; device number, device type id, trans type. 
function requestChannelId(channelId) {
    requestMessage(channelId, MESG_CHANNEL_ID_ID);
}

// Sends acknowledged data on the ANT channel. 
function sendAcknowledgedData(channelId, buffer) {
    return antlib.ANT_SendAcknowledgedData(channelId, buffer);
}

// Sends broadcast data on the ANT channel.
function sendBroadcastData(channelId, buffer) {
    return antlib.ANT_SendBroadcastData(channelId, buffer);
}

// Sets an exclusion list of devices when openning a channel.
function setDeviceExclusionList(channelId, devices) {
    // max exclusions of 4.
    for (var index = 0; index < devices.length && index < 4; 
            index++) {
        antlib.ANT_AddChannelID(channelId, 
            devices[index].deviceNumber,
            devices[index].deviceTypeId,
            devices[index].transmissionType,
            index);
    }
    /*exclude == 1, include == 0*/
    return antlib.ANT_ConfigList(channelId, index, 1);
}

// Configures channel search to be low priority.
function setLowPrioirtySearch(channelId) {
    const timeout = 24; // 60 seconds; 
    // Lengthens low prioirty search.
    antlib.ANT_SetLowPriorityChannelSearchTimeout(channelId, timeout);
    // Disables high priority search.
    antlib.ANT_SetChannelSearchTimeout(channelId, 0);
}

// Closes the ANT module and releases resources.
function close() {
    console.log('Attempting to close.');
    
    for (var index = 0; index < channelConfigs.length; index++) {
        if (channelConfigs[index] != null) {
            console.log('closing channelid:', index);
            closeChannel(index);
        }
    }
    
    antlib.ANT_Close.async(function(err, ret) {
        console.log('closed.');
        process2.exit();
    });         
}

// Returns a string from 2 byte revision.
function getSwRevision(supplemental, main) {
    /*
    Supplemental is the build #
    Main is broken into 2 nibbles; Major (MSN), Minor (LSN) 
    */
    var major = main >> 4; // Most significant nibble.
    var minor = main & 0xF; // Lean significant nibble.
    var build = supplemental;

    // Create a string.
    var rev = major + "." + minor + "." + build;
    return rev;
}

// Commmon function that parses Common ANT page 80.
function parseManufacturerInfo(buffer) {
    var page = {
        hwRevision : buffer[4],
        manufacturerId : buffer[6] << 8 | buffer[5],
        modelNumber : buffer[8] << 8 | buffer[7]
    };
    return page;
}

// Common function that parses Common ANT page 81.
function parseProductInfo(buffer) {
    var page = {
        swRevision : getSwRevision(buffer[3], buffer[4]),
        serial : buffer[8] << 32 |
            buffer[7] << 24 |
            buffer[6] << 16 |
            buffer[5] << 8 |
            buffer[4] 
    };
    return page;
}

// Target has a unique encoding.
function decodeTarget(lsb, msb) {
    // Encodes the resistance mode into the 2 most significant bits.
    var target = lsb | ((msb & 0x3F) << 8); 
    return target;
}

// Common function to parse IRT manufacturer specific data sent on FEC and BP channels.
function parseIrtExtraInfo(buffer) {
    var page = {
        servoPosition : buffer[2] | buffer[3] << 8,
        target : decodeTarget(buffer[4], buffer[5]),
        flywheelRevs : buffer[6] | buffer[7] << 8,
        temperature : buffer[8] & 0x7F, // mask out msb
        powerMeterConnected : (buffer[8] & 0x80) == 0x80  // first bit is the connected flag
    };
    return page;
}

// Common data page to request data from a device.
function sendRequestDataPage(channelId, pageNumber, buffer) {
    buffer[0] = REQUEST_DATA_PAGE;
    buffer[1] = 0xFF;
    buffer[2] = 0xFF;
    buffer[3] = 0xFF;
    buffer[4] = 0xFF;
    buffer[5] = 0x80;
    buffer[6] = pageNumber;
    buffer[7] = 0x01; // Request Data Page.

    if (!sendAcknowledgedData(channelId, buffer))
    {
        console.log('failed to send data request message.');
    }
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

// This method accumulates a double byte into a 32 bit unsigned int.
function accumulateDoubleByte(accumulator, byte) {
    // Did a rollover occur?
    if (byte < (accumulator & 0xFFFF)) {
        accumulator += 0xFFFF;
    }
    
    // >>>0 keeps this a 32 bit *un*signed int.
    accumulator = (accumulator >>>0 & 0xFFFF0000) + byte 

    return accumulator;        
}


// Returns the difference between two values, while also accounting for a 16 bit rollover.
function getDeltaWithRollover16(prior, current) {
    return (prior > current ? (0xFFFF ^ prior) + current : current - prior);
}

// Gets the average power for a specified period of seconds. 
function getAveragePower(seconds,  powerEvents) {
   
    var length = powerEvents.length - 1;
    var index =  length;
    // Grab last event count.
    var eventCount = powerEvents[length].eventCount;

    // Events are ~2hz, so 2 events per second.  Find the oldest event we want to avg from.
    var targetEvent = eventCount - (seconds * 2);
    
    while (index > 0 && powerEvents[index].eventCount > targetEvent)
        index--;
        
    var deltaEvents = powerEvents[length].eventCount - powerEvents[index].eventCount;
    var deltaPower = powerEvents[length].accumulatedPower - powerEvents[index].accumulatedPower;
    
    var average = (deltaPower / deltaEvents);
    
    if (!isNaN(average)) {
        return Math.round(average);
    }
    else { 
        return 0;
    }
}


// Define module exports.
exports.init = init;  
exports.close = close;
exports.antVersion = antVersion;
exports.setDebugLogDirectory = setDebugLogDirectory;
exports.openChannel = openChannel;
exports.openBackgroundScanningChannel = openBackgroundScanningChannel;
exports.sendBroadcastData = sendBroadcastData;
exports.sendAcknowledgedData = sendAcknowledgedData;
exports.closeChannel = closeChannel;
exports.requestMessage = requestMessage;
exports.sendRequestDataPage = sendRequestDataPage;
exports.setDeviceExclusionList = setDeviceExclusionList;
exports.setLowPrioirtySearch = setLowPrioirtySearch;
exports.requestChannelId = requestChannelId;
exports.accumulateByte = accumulateByte;
exports.accumulateDoubleByte = accumulateDoubleByte;
exports.getDeltaWithRollover16 = getDeltaWithRollover16;
exports.getAveragePower = getAveragePower;
exports.enableExtendedMessages = enableExtendedMessages;
exports.getTimestamp = getTimestamp;

exports.parseManufacturerInfo = parseManufacturerInfo;
exports.parseProductInfo = parseProductInfo;
exports.parseIrtExtraInfo = parseIrtExtraInfo;

exports.MESG_MAX_SIZE_VALUE = MESG_MAX_SIZE_VALUE;
exports.MESG_CHANNEL_STATUS_ID = MESG_CHANNEL_STATUS_ID;
exports.ANT_STANDARD_DATA_PAYLOAD_SIZE = ANT_STANDARD_DATA_PAYLOAD_SIZE; 
exports.MANUFACTURER_PAGE = MANUFACTURER_PAGE;
exports.PRODUCT_PAGE = PRODUCT_PAGE;
exports.BATTERY_STATUS_PAGE = BATTERY_STATUS_PAGE;
exports.REQUEST_DATA_PAGE = REQUEST_DATA_PAGE;

exports.EVENT_RX_SEARCH_TIMEOUT = EVENT_RX_SEARCH_TIMEOUT;
exports.EVENT_RX_FAIL= EVENT_RX_SEARCH_TIMEOUT;
exports.EVENT_RX_BROADCAST = EVENT_RX_BROADCAST;
exports.EVENT_RX_ACKNOWLEDGED = EVENT_RX_ACKNOWLEDGED;
exports.EVENT_RX_BURST_PACKET = EVENT_RX_BURST_PACKET;
exports.EVENT_CHANNEL_CLOSED = EVENT_CHANNEL_CLOSED;

exports.EVENT_RX_FLAG_BROADCAST = EVENT_RX_FLAG_BROADCAST;
exports.EVENT_RX_FLAG_ACKNOWLEDGED = EVENT_RX_FLAG_ACKNOWLEDGED;

exports.STATUS_TRACKING_CHANNEL = STATUS_TRACKING_CHANNEL;
exports.STATUS_UNASSIGNED_CHANNEL = STATUS_UNASSIGNED_CHANNEL;
exports.STATUS_ASSIGNED_CHANNEL = STATUS_ASSIGNED_CHANNEL;
exports.STATUS_SEARCHING_CHANNEL = STATUS_SEARCHING_CHANNEL;
exports.BG_SCANNING_CHANNEL_ID = BG_SCANNING_CHANNEL_ID;

exports.BIKE_POWER_DEVICE_TYPE = BIKE_POWER_DEVICE_TYPE;
exports.FEC_DEVICE_TYPE = FEC_DEVICE_TYPE;
exports.HEART_RATE_DEVICE_TYPE = HEART_RATE_DEVICE_TYPE;
