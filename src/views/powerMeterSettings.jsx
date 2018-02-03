'use babel';

import React from 'react';
import antlib from '../lib/ant/antlib.js';
import DeviceSettings from './deviceSettings';
import InputHelper from '../lib/ant/ts/inputHelpers';
import DeviceType from '../scripts/deviceType.js';

const INVALID_POWER_METER = 65535;

export default class PowerMeterSettings extends DeviceSettings {
    constructor(props) {
        super(props);
        this.state = {
            deviceId: props.deviceId
        }
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(event) {
        if (event.target.name === "ftp")
            this.props.onChange(event.target.name, event.target.value);
    }

    render() {
        let className = "powerMeterSettings " + 
            DeviceType.getDeviceClassName(antlib.BIKE_POWER_DEVICE_TYPE);
        return (
            <div className={className}>
                <div className="deviceTitle">Configure Power Meter</div>
                <button onClick={this.props.onDisconnectDevice}>Disconnect</button>
                <div>Device ID: {this.state.deviceId}</div>
                <div className="label">Functional Threshold Power</div>
                <input type="textbox" name="ftp" 
                    value={this.props.ftp}
                    onChange={this.handleInputChange} />
                             
            </div>
        );
    }
}
