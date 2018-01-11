'use babel';

import React from 'react';

export default class HrmConnected extends React.Component {
    constructor(props) {
        super(props);
        this.hrm = props.hrm;
        this.onHeartRate = this.onHeartRate.bind(this);
        this.state = { 
            heartRateBpm: 0
        };
    }

    onHeartRate(value, timestamp) {
        this.setState( {
            heartRateBpm: value
        });
    }

    componentDidMount() {
        this.hrm.on('heartRate', this.onHeartRate);
    }

    componentWillUnmount() {
        this.hrm.removeListener('heartRate', this.onHeartRate);
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
