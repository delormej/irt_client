'use babel';

import React from 'react';
import RideDataComponent from './rideDataComponent';

export default class PowerAverage extends React.Component {
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
