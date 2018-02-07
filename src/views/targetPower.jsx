'use babel';

import React from 'react';
import IrtExtraInfo from '../views/irtExtraInfo.jsx';
import RideDataComponent from '../views/rideDataComponent.jsx';

export default class TargetPower extends IrtExtraInfo {
    constructor(props) {
      super(props);
    }

    render() {
        return (
            <RideDataComponent class="targetPower" label="TARGET"
                value={this.state.target} />
          );      
    }
}  