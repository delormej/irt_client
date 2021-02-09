import * as React from 'react';
import RideDataComponent from  './rideDataComponent';

export class SpeedMph extends React.Component {
    constructor(props) {
      super(props);
      this.calculateMphAndFormat = this.calculateMphAndFormat.bind(this);
    }

    calculateMphAndFormat(mps) {
        const MPS_TO_MPH = 2.23694;
        if (isNaN(mps))
            mps = 0;
        console.log('calculated speed', mps);
        return (mps * MPS_TO_MPH).toFixed(1);
    }

    render() {
        return (
            <RideDataComponent class="speed" label="MPH"
                value={this.calculateMphAndFormat(this.props.RealSpeed)} />
          );      
    }
}  
