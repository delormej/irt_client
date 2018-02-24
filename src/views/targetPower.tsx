import * as React from 'react';
import RideDataComponent from './rideDataComponent';

interface TargetPowerProps {
    target: string;
}
export default class TargetPower extends React.Component<TargetPowerProps> {
    constructor(props) {
      super(props);
    }

    render() {
        return (
            <RideDataComponent class="targetPower" label="TARGET"
                value={this.props.target} />
          );      
    }
}  
