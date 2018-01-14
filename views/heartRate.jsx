'use babel';

import React from 'react';
import RideDataComponent from '../views/rideDataComponent';
import ColorStyle from '../lib/ant/ts/colorScale';

export default class HeartRate extends React.Component {
    constructor(props) {
        super(props);
        this.hrm = props.hrm;
        this.onHeartRate = this.onHeartRate.bind(this);
        this.state = { 
            heartRateBpm: 0,
            maxHeartRateBpm: 180 /*props.maxHeartRateBpm*/
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
                style={ColorStyle.getColorStyle(this.state.heartRateBpm, this.state.maxHeartRateBpm)}
                value={this.state.heartRateBpm} />      
        );
    }    
}
