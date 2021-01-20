'use babel';

import DeviceType from '../scripts/deviceType.js';

//
// TODO: filename should be changed to deviceSettings.jsx when we remove the 
// deviceSettings inheritance currently being used.
//

import React from 'react';
import antlib from '../lib/ant/antlib.js';
import AvailableDevices from './availableDevices';
import { connect } from 'tls';

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
    
    getDeviceTypeFromElement(element) {
        let name = element.type.name;
        console.log('getDeviceTypeFromElement', name);
        return antlib.HEART_RATE_DEVICE_TYPE; 

        if (name === "TrainerSettings")
            return antlib.FEC_DEVICE_TYPE;
        else if (name === "PowerMeterSettings")
            return antlib.BIKE_POWER_DEVICE_TYPE;
        else if (name === "WrappedHeartRateConnected")
            return antlib.HEART_RATE_DEVICE_TYPE;
        else
            throw new Error("Invalid element, can't determine device type: " + name);
    }
    
    getChildElement(element) {
        if (element.length != undefined)
            return element[0];
        else 
            return element;
    }

    isDeviceConnected(deviceType) {
        switch (deviceType) {
            case antlib.HEART_RATE_DEVICE_TYPE:
                return this.props.hrmConnected;
            case antlib.FEC_DEVICE_TYPE:
                return this.props.fecConnected;
            case antlib.BIKE_POWER_DEVICE_TYPE:
                return this.props.bpConnected;
            default:
                return false;
        }
    }

    render() 
    {
        let child = this.getChildElement(this.props.children);
        let deviceType = this.getDeviceTypeFromElement(child);
        let connected = this.isDeviceConnected(deviceType);

        console.log('Connected: ', connected);

        if (connected) {
            return this.props.children;
        }
        else {
            return (
                <AvailableDevices ant={this.props.ant} deviceType={deviceType}
                    onConnectDevice={child.props.onConnectDevice} />
            );
        }

        /* Searching is not a state that is currently tracked by the ant-plus node library.
                        return (
                    <CancelSearch deviceType={deviceType} 
                        onDisconnectDevice={child.props.onDisconnectDevice} />);
        */
    }    
}

