import * as React from 'react';
import RideDataComponent from  './rideDataComponent';

export interface SpeedProps {
    speedMps: number;
}

export class SpeedMph extends React.Component<SpeedProps> {
    constructor(props: SpeedProps) {
      super(props);
    }

    calculateMphAndFormat(mps: number): string {
        const MPS_TO_MPH = 2.23694;
        if (isNaN(mps))
            mps = 0;
        return (mps * MPS_TO_MPH).toFixed(1);
    }

    render(): JSX.Element {
        return (
            <RideDataComponent class="speed" label="MPH"
                value={this.calculateMphAndFormat(this.props.speedMps)} />
          );      
    }
}  
