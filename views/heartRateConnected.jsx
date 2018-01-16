'use babel';

import React from 'react';
import HeartRate from '../views/heartRate';
import antlib from '../lib/ant/antlib.js';

export default class HeartRateConnected extends HeartRate {
    constructor(props) {
        super(props);
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
                    <input type="textbox" name="maxHeartRate" 
                        value={this.state.maxHeartRate}
                        onChange={this.handleInputChange} />                                
                </div>                
            </div>
        );
    }
}
