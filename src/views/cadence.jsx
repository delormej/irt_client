'use babel';

import React from 'react';
import PowerMeter from '../views/powerMeter';
import RideDataComponent from './rideDataComponent';

export default class Cadence extends PowerMeter {
    constructor(props) {
      super(props);
    }

    render() {
        return (
            <RideDataComponent class="cadence" label="RPM"
                value={this.props.instantCadence} />
          );      
    }
}  
