'use babel';

import React from 'react';
import PowerMeter from '../views/powerMeter.jsx';
import RideDataComponent from '../views/rideDataComponent.jsx';

export default class Cadence extends PowerMeter {
    constructor(props) {
      super(props);
    }

    render() {
        return (
            <RideDataComponent class="cadence" label="RPM"
                value={this.state.instantCadence} />
          );      
    }
}  
