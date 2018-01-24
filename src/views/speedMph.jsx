'use babel';

import React from 'react';
import GeneralFEData from '../views/generalFEData.jsx';
import RideDataComponent from '../views/rideDataComponent.jsx';

export default class SpeedMph extends GeneralFEData {
    constructor(props) {
      super(props);
    }

    calculateMph(mps) {
        const MPS_TO_MPH = 2.23694;
        return (mps * MPS_TO_MPH).toFixed(1);
    }

    render() {
        return (
            <RideDataComponent class="speed" label="MPH"
                value={this.calculateMph(this.state.speedMps)} />
          );      
    }
}  
