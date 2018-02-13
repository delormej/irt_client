'use babel';

import React from 'react';
import PowerMeter from '../views/powerMeter.jsx'
import RideDataComponent from './rideDataComponent';

export default class PowerAverage extends PowerMeter {
    constructor(props) {
      super(props);
      this.bpAverager = props.bpAverager;
      this.averageSeconds = props.seconds;
    }

    render() {
        let label = this.averageSeconds + "s AVERAGE";
        return (
            <RideDataComponent class="bikePowerAverage" label={label}
                value={this.bpAverager.getAverage(this.averageSeconds)} />
        );
    }
}
