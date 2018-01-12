'use babel';

import React from 'react';
import HeartRate from '../views/heartRate';

export default class HrmConnected extends HeartRate {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="heartRate">
                <div className="deviceTitle">Heart Rate Monitor</div>
                <button onClick={() => this.props.onDisconnectDevice(antlib.HEART_RATE_DEVICE_TYPE)}>Disconnect</button>
                <div>Device ID: {this.props.deviceId}<br/></div>
                <div>Heart Rate: {this.state.heartRateBpm}</div>
            </div>
        );
    }
}
