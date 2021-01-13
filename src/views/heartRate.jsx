'use babel';

import React from 'react';
import RideDataComponent from '../views/rideDataComponent';
import DeviceSettings from '../views/deviceSettings';
import ColorStyle from '../lib/ant/ts/colorScale';
import { HeartRateSensor } from 'ant-plus';

export default class HeartRate extends DeviceSettings {

    constructor(props) {
        super(props);

        var sensor = new HeartRateSensor(props.stick); 

        if (!props.stick.open()) {
            console.log("Stick not open!");
        }
        else {
            console.log("Stick open!");
        }        

        props.stick.on('startup', function () {
            sensor.attach(0, 0);
            console.log('attached.');
        });

        this.state = { 
            heartRateBpm: 0,
            sensor: sensor,
            deviceId: 0
        };
        this.onHeartRate = this.onHeartRate.bind(this);
    }

    onHeartRate(data) {
        this.setState( {
            heartRateBpm: data.ComputedHeartRate,
            deviceId: data.DeviceID
        });
    }

    componentDidMount() {
        // this.hrm.on('heartRate', this.onHeartRate);

        this.state.sensor.on('hbData', this.onHeartRate);
    }

    componentWillUnmount() {
        // this.hrm.removeListener('heartRate', this.onHeartRate);
        this.state.sensor.detach();
    }

    render() {
        return (
            <RideDataComponent class="heartRate" label="BPM" 
                style={ColorStyle.getColorStyle(this.state.heartRateBpm, this.props.maxHeartRateBpm)}
                value={this.state.heartRateBpm} />      
        );
    }    
}
