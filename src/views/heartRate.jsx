'use babel';

import React from 'react';
import RideDataComponent from '../views/rideDataComponent';
import DeviceSettings from '../views/deviceSettings';
import ColorStyle from '../lib/ant/ts/colorScale';

export default class HeartRate extends DeviceSettings {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <RideDataComponent class="heartRate" label="BPM" 
                style={ColorStyle.getColorStyle(this.state.heartRateBpm, this.props.maxHeartRateBpm)}
                value={this.state.heartRateBpm} />      
        );
    }    
}
