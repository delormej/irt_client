'use babel';

import React from 'react';
import antlib from '../lib/ant/antlib.js';
import AvailableDevices from './availableDevices';

function CancelSearch(props) {
    let className = "cancel " +
        deviceType.getDeviceClassName(props.deviceType);
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
        let device = null;
        switch (deviceType) {
            case antlib.BIKE_POWER_DEVICE_TYPE:
                device = ant.bp;
                break;
            case antlib.FEC_DEVICE_TYPE:
                device = ant.fec;
                break;
            case antlib.HEART_RATE_DEVICE_TYPE:
                device = ant.hrm;
                break;
            default:
                throw new Error("Invalid device type.");
        }
        let channelStatus = device.getChannelStatus();
        return channelStatus;
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
    
    render() 
    {
        let deviceType = this.getDeviceTypeFromElement(this.props.children);
        let channelStatus = this.getChannelStatus(this.props.ant, deviceType);
        switch (channelStatus) {
            case antlib.STATUS_TRACKING_CHANNEL:
                return this.props.children;
            case antlib.STATUS_SEARCHING_CHANNEL:
                return (
                    <CancelSearch deviceType={deviceType} 
                        onDisconnectDevice={this.props.children.props.onDisconnectDevice} />);
            default:        
                return (
                    <AvailableDevices bgScanner={this.props.ant.bgScanner} deviceType={deviceType}
                        onConnectDevice={this.props.children.props.onConnectDevice} />
                );
        }
    }    
}

