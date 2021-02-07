'use babel';

//
// TODO: filename should be changed to deviceSettings.jsx when we remove the 
// deviceSettings inheritance currently being used.
//

import React from 'react';
import antlib from '../lib/ant/antlib.js';
import AvailableDevices from './availableDevices';
import { connect } from 'tls';
import { AntContext } from '../lib/ant/antProvider';
import DeviceType from '../scripts/deviceType.js';

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
        // pity that ?? null coalescing operator isn't available until Node 14+.
        let name = element.type.displayName;
        if (!name)
            name = element.type.name;

        console.log('getDeviceTypeFromElement', name);

        if (name === "hocAntMessage(TrainerSettings)")
            return antlib.FEC_DEVICE_TYPE;
        else if (name === "hocAntMessage(PowerMeterSettings)")
            return antlib.BIKE_POWER_DEVICE_TYPE;
        else if (name === "hocAntMessage(HeartRateConnected)")
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
        console.log('isDeviceConnected?', deviceType);
        switch (deviceType) {
            case antlib.HEART_RATE_DEVICE_TYPE:
                return this.context.hrmConnected;
            case antlib.FEC_DEVICE_TYPE:
                return this.context.fecConnected;
            case antlib.BIKE_POWER_DEVICE_TYPE:
                return this.context.bpConnected;
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
                <AvailableDevices deviceType={deviceType}
                    onConnectDevice={child.props.onConnectDevice}
                    availableDevices={this.props.availableDevices} />
            );
        }

        /* Searching is not a state that is currently tracked by the ant-plus node library.
                        return (
                    <CancelSearch deviceType={deviceType} 
                        onDisconnectDevice={child.props.onDisconnectDevice} />);
        */
    }    
}

DeviceSettings.contextType = AntContext;