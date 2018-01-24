'use babel';

import React from 'react';
import RideDataComponent from '../views/rideDataComponent';
import DeviceSettings from '../views/deviceSettings';
import ColorStyle from '../lib/ant/ts/colorScale';

export default class HeartRate extends DeviceSettings {
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
            <RideDataComponent class="heartRate" label="BPM" 
                style={ColorStyle.getColorStyle(this.state.heartRateBpm, this.props.maxHeartRateBpm)}
                value={this.state.heartRateBpm} />      
        );
    }    
}
