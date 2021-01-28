import * as React from 'react';
import RideDataComponent from './rideDataComponent';

interface DistanceTravelledProps {
    Distance: number;
}

export default class DistanceTravelled extends React.Component<DistanceTravelledProps> {
    constructor(props) {
      super(props);
    }

    render(): JSX.Element {
        const METERS_TO_MILES = 0.000621371;
        let meters: number = this.props.Distance;
        let miles: string = (meters * METERS_TO_MILES).toFixed(2);   
        return (
            <RideDataComponent class="distance" label="MILES"
                value={miles} />
        );
    }
}