'use babel';

import React from 'react';
import antManufacturers from '../lib/ant/ant_manufacturers.js';
import antlib from '../lib/ant/antlib.js';
import deviceType from '../scripts/deviceType.js';

function AvailableDevice(props) {
    let deviceInfo = props.deviceInfo;
    return (
        <div className="deviceInfo" 
            onClick={() => props.onClick(deviceInfo.deviceId)}>
            {deviceInfo.manufacturerName}: {deviceInfo.deviceId}<br/>
            <button>Connect</button>
        </div>
    );
}

export default class AvailableDevices extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            availableDevices: []
        };
        this.selectedDeviceId = null;
        this.onConnectDevice = props.onConnectDevice;
        this.deviceType = props.deviceType;
        this.bgScanner = props.bgScanner;

        this.onDeviceInfo = this.onDeviceInfo.bind(this);
    }

    onDeviceInfo(deviceInfo) {
        if (deviceInfo.deviceType == this.deviceType)
            this.addOrUpdateAvailableDevice(deviceInfo);
    }

    componentDidMount() {
        // this.bgScanner.on('deviceInfo', this.onDeviceInfo);
    }

    componentWillUnmount() {
        // this.bgScanner.removeListener('deviceInfo', this.onDeviceInfo);
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
        if (dirty)
            this.setState({ availableDevices: availableDevices });
    }

    onSelectDevice(deviceId) {
        this.selectedDeviceId = deviceId;
        this.onConnectDevice(this.deviceType, this.selectedDeviceId);
    }

    render() {
        const listItems = this.state.availableDevices.map((deviceInfo) =>
            <AvailableDevice key={deviceInfo.deviceId} deviceInfo={deviceInfo} 
                onClick={(deviceId) => this.onSelectDevice(deviceId)}/>);
        let className = "availableDevices " + deviceType.getDeviceClassName(this.deviceType);
        return (
            <div className={className}>
                <div className="deviceTitle">Select {deviceType.getDeviceTypeName(this.deviceType)}</div>
                {listItems.length > 0 ? ( 
                    <div>
                        {listItems}
                    </div>
                ) : (<div>Searching for devices...</div>)}
            </div>
        );      
    }
}
