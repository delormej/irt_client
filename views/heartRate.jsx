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
            r = 0;
            g = 255;
        } else if (percentOfMax >= .75) {
            r = 255;
            g = Math.floor(255 * (1-(percentOfMax-0.75)/0.25));
        } else if (percentOfMax >= 0.50) {
            r = Math.floor(255 * ((percentOfMax-0.5)/0.25));
            g = 255;
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
