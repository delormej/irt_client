'use babel';

import React from 'react';
import antlib from '../lib/ant/antlib.js';
import DeviceSettings from '../views/deviceSettings.jsx'

export default class PowerMeterSettings extends DeviceSettings {
    constructor(props) {
        super(props);
        this.onDisconnectDevice = props.onDisconnectDevice;
        this.state = {
            deviceId: 0,
            powerMeterId: 0
        }
    }

    handleInputChange(event) {
        super.handleInputChange(event, this);
    }

    onShowAdvanced() {
        console.log("Show advanced...");
    }

    render() {
        return (
            <div>
                <div className="deviceTitle">Configure Power Meter</div>
                <button onClick={() => this.onDisconnectDevice(antlib.BIKE_POWER_DEVICE_TYPE)}>Disconnect</button>
                <div>
                    Device ID: {this.state.powerMeterId}<br/>
                </div>                        
                <button onClick={() => this.onShowAdvanced()}>Advanced</button><br/>
                <div className="label">Power Meter Id</div>
                    <input name="powerMeterId" type="textbox" 
                        value={this.state.powerMeterId} 
                        onChange={this.handleInputChange}/>                                    
            </div>
        );
    }
}
