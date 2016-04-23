/*
 * Copyright (c) 2016 Inside Ride Technologies, LLC. All Rights Reserved.
 * Author: Jason De Lorme (jason@insideride.com)
 *
 * Interop to native C library for talking to ANT USB device. 
 */

const ref = require('ref');
const ffi = require('ffi');
const process2 = require('process');
const sprintf = require('sprintf-js').sprintf;

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

const RESPONSE_NO_ERROR = 0;
const EVENT_RX_SEARCH_TIMEOUT = 0x01;
const EVENT_RX_FAIL= 0x02;

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

const MESG_MAX_SIZE_VALUE = 41;
const ANT_STANDARD_DATA_PAYLOAD_SIZE = 8;

const MAX_CHANNELS = 8;

const REQUEST_DATA_PAGE = 0x46;
const MANUFACTURER_PAGE = 0x50;
const PRODUCT_PAGE = 0x51;


// Internal memory structures used by ANT library for sending and recieving messages. 
const responseBuffer = new Buffer(MESG_MAX_SIZE_VALUE);

// Array of channel configurations.
const channelConfigs = new Array(MAX_CHANNELS);

// Native library definition.
const antlib = ffi.Library(libPath(), {
    'ANT_LibVersion': ['string', [] ],
    'ANT_Init': ['bool', ['uchar', 'ulong', 'uchar', 'uchar'] ],
    'ANT_AssignResponseFunction': ['void', [ 'pointer', 'pointer' ] ],
    'ANT_AssignChannelEventFunction': ['void', [ 'uchar', 'pointer', 'pointer' ] ],
    'ANT_AssignChannel': ['bool', ['uchar', 'uchar', 'uchar'] ],
    'ANT_SetChannelId': ['bool', ['uchar', 'ushort', 'uchar', 'uchar' ] ],
    'ANT_SetChannelRFFreq': ['bool', ['uchar', 'uchar'] ],
    'ANT_SendBroadcastData': ['bool', ['uchar', 'pointer'] ],
    'ANT_SendAcknowledgedData': ['bool', ['uchar', 'pointer'] ],
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
    'ANT_Close': ['void', [] ]
});

// Global variable indicates if the module has been initialized.
var initialized = false;

// Returns a string representing the ANT Library version.
function antVersion() {
    return antlib.ANT_LibVersion();    
}

// Callback for ANT device responses.
function deviceResponse(channelId, messageId) {
    if (channelConfigs[channelId] == null) {
        console.log('Channel not configured, message recieved:', messageId);
        return;
    }

    // Load the appropriate channel configuration based on channelId of message.    
    var channelConfig = channelConfigs[channelId];

    // Process the incoming message.
    switch (messageId) {
        case MESG_STARTUP_MESG_ID:
            console.log('ANT Started.');
            break;      
        case EVENT_RX_SEARCH_TIMEOUT:
            // Timeout trying to find master on the particular channel.
            // The channel will get closed.
            console.log('EVENT_RX_SEARCH_TIMEOUT, channel:', channelId);
            break;
        case MESG_CHANNEL_STATUS_ID:
            console.log('MESG_CHANNEL_STATUS_ID, channel:', channelId);
            break;
        case MESG_RESPONSE_EVENT_ID:
            switch (responseBuffer[1]) {
                case MESG_NETWORK_KEY_ID:
                    if (responseBuffer[2] != RESPONSE_NO_ERROR) {
                        console.log('Error congfiguring network key: Code: ' + responseBuffer[2]);
                    }
                    break;
                case MESG_ASSIGN_CHANNEL_ID:
                    if (responseBuffer[2] != RESPONSE_NO_ERROR) {
                        console.log('Error assigning channel: Code: ' + responseBuffer[2]);
                    }
                    else {
                        console.log('Channel assigned.');
                        console.log('Setting channel ID...');
                        antlib.ANT_SetChannelId(channelId, 
                            channelConfig.deviceId, 
                            channelConfig.deviceType, 
                            channelConfig.transmissionType);
                    }
                    break;
                case MESG_CHANNEL_ID_ID:
                    if (responseBuffer[2] != RESPONSE_NO_ERROR) {
                        console.log('Error setting channel: Code: ' + responseBuffer[2]);
                    }
                    else {
                        console.log('Channel ID set.');
                        console.log('Setting radio frequency...');
                        antlib.ANT_SetChannelRFFreq(channelId, channelConfig.frequency);  
                    }                
                    break;
                case MESG_CHANNEL_RADIO_FREQ_ID:
                    if (responseBuffer[2] != RESPONSE_NO_ERROR) {
                        console.log('Error configuring radio frequency: Code: ' + responseBuffer[2]);
                    }
                    else {
                        console.log('Radio frequency set.');
                        console.log('Opening channel...');
                        antlib.ANT_OpenChannel(channelId);
                    }                
                    break;
                case MESG_OPEN_CHANNEL_ID:
                    if (responseBuffer[2] != RESPONSE_NO_ERROR) {
                        console.log('Error opening channel: Code: ' + responseBuffer[2]);
                    }
                    else {
                        console.log('Channel opened.');
                    }                
                    break;
                default:
                    break;
            }
            break;
        default:
            console.log('response:', messageId, responseBuffer);
            break;
    }
}

// Called when channel events occur.
function channelEvent(channelId, eventId) {
    switch (eventId) {
        case EVENT_RX_FAIL:
            console.log("EVENT_RX_FAIL, channel: ", channelId);
            break;
            
        default:
            if (channelConfigs[channelId] != null) {
                channelConfigs[channelId].channelCallback(channelId, eventId);
            }
            else {
                console.log('no channel.');
            }
            break;        
    }
}

// Determins the right library path based on OS version.
function libPath() {
    var isWindows = /^win/.test(process2.platform);
    var lib = '';
    if (isWindows) {
        lib = 'ANT_DLL';
    }
    else {
        lib = 'libANT';
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
    // If init already called, exit.
    if (initialized)
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

// Opens a chanel.
function openChannel(config, buffer) {
    // Get the first empty channel.
    var index = 0;
    for (; index < channelConfigs.length; index++) {
        if (channelConfigs[index] == null) {
            break;
        }
    }

    // Assign channel configuration.
    channelConfigs[index] = config;
    if (!antlib.ANT_AssignChannel(index, config.channelType, ANT_NETWORK)) {
        throw new Error('Unable to assign channel.');
    }

    antlib.ANT_AssignChannelEventFunction(index, channelEventCallback, buffer);
    
    return index;
}

// Closes the ANT channel.
function closeChannel(channelId) {
    return antlib.ANT_CloseChannel(channelId);
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

// Common function to parse IRT manufacturer specific data sent on FEC and BP channels.
function parseIrtExtraInfo(buffer) {
    var page = {
        servoPosition : buffer[2] | buffer[3] << 8,
        target :   buffer[4] | buffer[5] << 8,
        flywheelRevs : buffer[6] | buffer[7] << 8,
        temperature : buffer[8]
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

// Define module exports.
exports.init = init;  
exports.close = close;
exports.antVersion = antVersion;
exports.openChannel = openChannel;
exports.sendBroadcastData = sendBroadcastData;
exports.sendAcknowledgedData = sendAcknowledgedData;
exports.closeChannel = closeChannel;
exports.sendRequestDataPage = sendRequestDataPage;
exports.setDeviceExclusionList = setDeviceExclusionList;
exports.setLowPrioirtySearch = setLowPrioirtySearch;

exports.parseManufacturerInfo = parseManufacturerInfo;
exports.parseProductInfo = parseProductInfo;
exports.parseIrtExtraInfo = parseIrtExtraInfo;

exports.MESG_MAX_SIZE_VALUE = MESG_MAX_SIZE_VALUE;
exports.ANT_STANDARD_DATA_PAYLOAD_SIZE = ANT_STANDARD_DATA_PAYLOAD_SIZE; 
exports.MANUFACTURER_PAGE = MANUFACTURER_PAGE;
exports.PRODUCT_PAGE = PRODUCT_PAGE;
exports.REQUEST_DATA_PAGE = REQUEST_DATA_PAGE;