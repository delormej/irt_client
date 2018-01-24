'use babel';

import React from 'react';
import GeneralFEData from '../views/generalFEData.jsx';
import RideDataComponent from '../views/rideDataComponent.jsx';
import util from 'util';
import zpad from 'zpad';

export default class ElapsedTime extends GeneralFEData {
    constructor(props) {
      super(props);
    }

    // Returns a string in hh:mm:ss format from seconds.
    formatTime(elapsedSeconds) {
        let hours = Math.floor(elapsedSeconds / 3600);       
        let minutes = Math.floor( ((elapsedSeconds - (hours * 3600)) / 60) );
        let seconds =  Math.floor(elapsedSeconds - ((hours * 3600) + (minutes * 60))); 
        return util.format('%s:%s:%s', 
            zpad(hours,2), 
            zpad(minutes, 2),
            zpad(seconds,2));
    }   

    render() {
        return (
            <RideDataComponent class="duration" label="DURATION"
                value={this.formatTime(this.state.elapsedTime)} />
        );
    }
}    
