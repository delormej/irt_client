import * as React from 'react';
import RideDataComponent from './rideDataComponent';

interface PowerAverageProps {
    bpAverager: any;
    averageSeconds: number;
}

export default class PowerAverage extends React.Component<PowerAverageProps> {
    constructor(props) {
      super(props);
    }

    render() {
        let label = this.props.averageSeconds + "s AVERAGE";
        return (
            <RideDataComponent class="bikePowerAverage" label={label}
                value={this.props.bpAverager.getAverage(this.props.averageSeconds)} />
        );
    }
}
