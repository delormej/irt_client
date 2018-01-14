'use babel';

import React from 'react';
import RideDataComponent from '../views/rideDataComponent';

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

    getHeartRateColor(heartRate) {
        let percentOfMax = heartRate / this.state.maxHeartRateBpm;
        let r = 0, g = 0, b = 0;
        if (percentOfMax < 0.50) {
            r = Math.floor((percentOfMax * 2) * 255);
            g = 255;
        } else if (percentOfMax >= 0.50) {
            r = 255;
            g =255 - Math.floor((((percentOfMax*2)*255))-255);
        }
        let rgb = [r, g, b];
        let color = { color: `rgb(${rgb})` };
        return color; 
    }

    round(value, decimals) {
        return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
    }    

    render() {
        return (
            <RideDataComponent class="heartRate" label="BPM" 
                style={this.getHeartRateColor(this.state.heartRateBpm)}
                value={this.state.heartRateBpm} />      
        );
    }    
}
