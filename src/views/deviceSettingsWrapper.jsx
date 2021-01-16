'use babel';

import DeviceType from '../scripts/deviceType.js';

//
// TODO: filename should be changed to deviceSettings.jsx when we remove the 
// deviceSettings inheritance currently being used.
//

import React from 'react';
import antlib from '../lib/ant/antlib.js';
import AvailableDevices from './availableDevices';

function CancelSearch(props) {
    let className = "cancel " +
        DeviceType.getDeviceClassName(props.deviceType);
    return (
        <div className={className}>
            <div>Attempting to connect...</div>
            <button onClick={() => props.onDisconnectDevice(props.deviceType)}>Cancel</button>
        </div>
    );
}

export default class DeviceSettings extends React.Component {
    constructor(props) {
        super(props);
    }

    getChannelStatus(ant, deviceType) {
        // let device = null;
        // switch (deviceType) {
        //     case antlib.BIKE_POWER_DEVICE_TYPE:
        //         device = ant.bp;
        //         break;
        //     case antlib.FEC_DEVICE_TYPE:
        //         device = ant.fec;
        //         break;
        //     case antlib.HEART_RATE_DEVICE_TYPE:
        //         device = ant.hrm;
        //         break;
        //     default:
        //         throw new Error("Invalid device type.");
        // }
        // let channelStatus = device.getChannelStatus();
        // return channelStatus;
        return 0;
    }
    
    getDeviceTypeFromElement(element) {
        let name = element.type.name;
        if (name === "TrainerSettings")
            return antlib.FEC_DEVICE_TYPE;
        else if (name === "PowerMeterSettings")
            return antlib.BIKE_POWER_DEVICE_TYPE;
        else if (name === "HeartRateConnected")
            return antlib.HEART_RATE_DEVICE_TYPE;
        else
            throw new Error("Invalid element, can't determine device type.");
    }
    
    getChildElement(element) {
        if (element.length != undefined)
            return element[0];
        else 
            return element;
    }

    render() 
    {
        let child = this.getChildElement(this.props.children);
        let deviceType = this.getDeviceTypeFromElement(child);
        let channelStatus = this.getChannelStatus(this.props.ant, deviceType);
        switch (channelStatus) {
            case antlib.STATUS_TRACKING_CHANNEL:
                return this.props.children;
            case antlib.STATUS_SEARCHING_CHANNEL:
                return (
                    <CancelSearch deviceType={deviceType} 
                        onDisconnectDevice={child.props.onDisconnectDevice} />);
            default:        
                return ( /*bgScanner={this.props.ant.bgScanner}*/
                    <AvailableDevices deviceType={deviceType}
                        onConnectDevice={child.props.onConnectDevice} />
                );
        }
    }    
}

