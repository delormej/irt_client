'use babel';

import React from 'react';
import PowerMeter from '../views/powerMeter.jsx'
import RideDataComponent from '../views/rideDataComponent.jsx';

export default class PowerAverage extends PowerMeter {
    constructor(props) {
      super(props);
      this.bpAverager = props.bpAverager;
      this.averageSeconds = props.seconds;
    }

    render() {
        return(<div>{this.bpAverager.getAverage(this.averageSeconds)}</div>);
    }
}
