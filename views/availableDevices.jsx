'use babel';

import React from 'react';
import antManufacturers from '../lib/ant/ant_manufacturers.js';
import antlib from '../lib/ant/antlib.js';
import MountAwareReactComponent from '../scripts/mountAwareReactComponent.js';

function AvailableDevice(props) {
    let deviceInfo = props.deviceInfo;
    return (
        <div className="deviceInfo" 
            onClick={() => props.onClick(deviceInfo.deviceId)}>
            {deviceInfo.manufacturerName}: {deviceInfo.deviceId}
        </div>
    );
}

export default class AvailableDevices extends MountAwareReactComponent {
    constructor(props) {
        super(props);
        this.state = {
            availableDevices: []
        };
        this.selectedDeviceId = null;
        this.onConnectDevice = props.onConnectDevice;
        this.deviceType = props.deviceType;
        this.bgScanner = props.bgScanner;
    }

    componentDidMount() {
        super.componentDidMount();
        this.bgScanner.on('deviceInfo', (deviceInfo) => {
            if (deviceInfo.deviceType == this.deviceType)
                this.addOrUpdateAvailableDevice(deviceInfo);
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        // Must remove all listeners for this event, because it's not possible to specify
        // the instance. Using an anonymous method registered in ..DidMount() is required
        // to have context to 'this' as the callback is invoked in a seperate context. 
        this.bgScanner.removeAllListeners('deviceInfo');
    }

    addOrUpdateAvailableDevice(deviceInfo) {
        let availableDevices = this.state.availableDevices;
        let dirty = false;
        var element = availableDevices.find(function(value) {
            return value.deviceId == deviceInfo.deviceId;
        });
        if (element != null) {
            if (deviceInfo.manufacturerId != 0) {
                element.manufacturerId = deviceInfo.manufacturerId;
                element.manufacturerName = 
                    antManufacturers.getAntManufacturerNameById(deviceInfo.manufacturerId);
            }
            element.timestamp = deviceInfo.timestamp;
            dirty = true;
        }
        else {
            availableDevices.push(deviceInfo);
            dirty = true;
        }  
        if (dirty && this.mounted)
            this.setState({ availableDevices: availableDevices });
    }

    getDeviceTypeName(deviceTypeId) {
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

    onSelectDevice(deviceId) {
        this.selectedDeviceId = deviceId;
    }

    render() {
        const listItems = this.state.availableDevices.map((deviceInfo) =>
            <AvailableDevice key={deviceInfo.deviceId} deviceInfo={deviceInfo} 
                onClick={(deviceId) => this.onSelectDevice(deviceId)}/>);

        return (
            <div>
                <div className="deviceTitle">Select {this.getDeviceTypeName(this.deviceType)}</div>
                {listItems}
                <button 
                    onClick={() => this.onConnectDevice(this.deviceType, this.selectedDeviceId)}>
                    Connect
                </button> 
            </div>
        );      
    }
}
