'use babel';

import React from 'react';
import antManufacturers from '../lib/ant/ant_manufacturers.js';
import deviceType from '../scripts/deviceType.js';
import { HeartRateScanner, FitnessEquipmentScanner, BicyclePowerSensor, BicyclePowerScanner } from 'ant-plus';
import { AntContext } from '../lib/ant/antProvider';
import { DeviceType } from '../lib/ant/ts/ant';

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
        this.onDeviceInfo = this.onDeviceInfo.bind(this);
    }

    onDeviceInfo(data) {
        let deviceInfo = {
            deviceId: data.DeviceID,
            manufacturerId: data.ManId
        };

        console.log("found", deviceInfo.deviceId, deviceInfo.manufacturerId);
        this.addOrUpdateAvailableDevice(deviceInfo);
    }

    componentDidMount() {

        switch (this.deviceType)
        {
            case DeviceType.BIKE_POWER_DEVICE_TYPE:
                this.scanner = new BicyclePowerScanner(this.context.ant.stick);
                this.scanner.on('powerData', this.onDeviceInfo);
                break;
            case DeviceType.FEC_DEVICE_TYPE:
                this.scanner = new FitnessEquipmentScanner(this.context.ant.stick);
                this.scanner.on('fitnessData', this.onDeviceInfo);
                break;
            case DeviceType.HEART_RATE_DEVICE_TYPE:
                this.scanner = new HeartRateScanner(this.context.ant.stick);
                this.scanner.on('hbData', this.onDeviceInfo);
                break;
            default:
                throw 'Unrecognized deviceType';
        }

        if (this.scanner) {
            this.scanner.scan();
            console.log('scanner opened', this.deviceType);
        } 
        else {
            console.log('No scanner.');
        }
    }

    componentWillUnmount() {
    }

    addOrUpdateAvailableDevice(deviceInfo) {
        let availableDevices = this.state.availableDevices;
        let dirty = false;
        var element = availableDevices.find(function(value) {
            return value.deviceId == deviceInfo.deviceId;
        });
        if (element != null) {
            if (deviceInfo.manufacturerId) {
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
        // this.scanner.detach();
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

AvailableDevices.contextType = AntContext;