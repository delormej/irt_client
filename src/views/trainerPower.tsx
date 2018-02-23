import * as React from 'react';
import RideDataComponent from './rideDataComponent';

interface TrainerPowerProps {
    instantPower: string;
}

export default class TrainerPower extends React.Component<TrainerPowerProps> {
    constructor(props) {
      super(props);
    }

    render(): JSX.Element {
        return (
            <RideDataComponent class="trainerPower" label="TRAINER"
                    value={this.props.instantPower} />
          );
    }
}  
