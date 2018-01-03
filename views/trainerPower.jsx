'use babel';

import React from 'react';
import SpecificTrainerData from '../views/specificTrainerData.jsx';
import RideDataComponent from '../views/rideDataComponent.jsx';

export default class TrainerPower extends SpecificTrainerData {
    constructor(props) {
      super(props);
    }

    render() {
        return (
            <RideDataComponent class="trainerPower" label="WATTS"
                    value={this.state.instantPower} />
          );
    }
}  
