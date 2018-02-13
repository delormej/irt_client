'use babel';

import React from 'react';
import GeneralFEData from '../views/generalFEData.jsx';
import RideDataComponent from './rideDataComponent';

export default class DistanceTravelled extends GeneralFEData {
    constructor(props) {
      super(props);
    }

    render() {
        const METERS_TO_MILES = 0.000621371;
        let meters = this.state.distanceTravelled;
        let miles = (meters * METERS_TO_MILES).toFixed(2);   
        return (
            <RideDataComponent class="distance" label="MILES"
                value={miles} />
        );
    }
}