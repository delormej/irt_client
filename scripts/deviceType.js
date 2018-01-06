
import antlib from '../lib/ant/antlib.js';

function getDeviceTypeName(deviceTypeId) {
    let name = "";
    switch (deviceTypeId)
    {
        case antlib.BIKE_POWER_DEVICE_TYPE:
            name = "Power Meter";
            break;
        case antlib.FEC_DEVICE_TYPE:
            name = "Trainer (FE-C)";
            break;
        case antlib.HEART_RATE_DEVICE_TYPE:
            name = "Heart Rate Monitor";
            break;
        default:
            name = "Unrecognized";
            break;
    }
    return name;        
}

function getDeviceClassName(deviceTypeId) {
    let name = "";
    switch (deviceTypeId)
    {
        case antlib.BIKE_POWER_DEVICE_TYPE:
            name = "powerMeter";
            break;
        case antlib.FEC_DEVICE_TYPE:
            name = "trainer";
            break;
        case antlib.HEART_RATE_DEVICE_TYPE:
            name = "heartRate";
            break;
        default:
            name = "";
            break;
    }
    return "availableDevices " + name;                
}

exports.getDeviceClassName = getDeviceClassName;
exports.getDeviceTypeName = getDeviceTypeName;
