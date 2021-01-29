const { DeviceType } = require("../lib/ant/ts/ant");

function getDeviceTypeName(deviceTypeId) {
    let name = "";
    switch (deviceTypeId)
    {
        case DeviceType.BIKE_POWER_DEVICE_TYPE:
            name = "Power Meter";
            break;
        case DeviceType.FEC_DEVICE_TYPE:
            name = "Trainer (FE-C)";
            break;
        case DeviceType.HEART_RATE_DEVICE_TYPE:
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
        case DeviceType.BIKE_POWER_DEVICE_TYPE:
            name = "powerMeter";
            break;
        case DeviceType.FEC_DEVICE_TYPE:
            name = "trainer";
            break;
        case DeviceType.HEART_RATE_DEVICE_TYPE:
            name = "heartRate";
            break;
        default:
            name = "";
            break;
    }
    return name;                
}

exports.getDeviceClassName = getDeviceClassName;
exports.getDeviceTypeName = getDeviceTypeName;
