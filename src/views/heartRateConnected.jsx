'use babel';

import React from 'react';
import HeartRate from '../views/heartRate';
import antlib from '../lib/ant/antlib.js';

export default class HeartRateConnected extends HeartRate {
    constructor(props) {
        super(props);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(event) {
        if (event.target.name === "maxHeartRateBpm")
            this.props.onChange("maxHeartRateBpm", event.target.value);
    }

    render() {
        return (
            <div className="heartRate">
                <div className="deviceTitle">Heart Rate Monitor</div>
                <button onClick={() => this.props.onDisconnectDevice(antlib.HEART_RATE_DEVICE_TYPE)}>Disconnect</button>
                <div className="heartRateSettings">
                    <div className="label">Device ID: {this.props.deviceId}</div>
                    <div className="label">Heart Rate:</div>
                    <div className="heartRateBpm">{this.state.heartRateBpm}</div>
                    <div className="label">Maximum Heart Rate</div>
                    <input type="textbox" name="maxHeartRateBpm" 
                        value={this.props.maxHeartRateBpm}
                        onChange={this.handleInputChange} />                               
                </div>                
            </div>
        );
    }
}
