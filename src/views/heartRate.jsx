'use babel';

import React from 'react';
import RideDataComponent from '../views/rideDataComponent';
import ColorStyle from '../lib/ant/ts/colorScale';

export default class HeartRate extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <RideDataComponent class="heartRate" label="BPM" 
                style={ColorStyle.getColorStyle(this.props.ComputedHeartRate, this.props.maxHeartRateBpm)}
                value={this.props.ComputedHeartRate} />      
        );
    }    
}
