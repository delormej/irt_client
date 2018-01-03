'use babel';

import React from 'react';
import IrtExtraInfo from '../views/irtExtraInfo.jsx';
import RideDataComponent from '../views/rideDataComponent.jsx';

export default class PowerMeterConnected extends IrtExtraInfo {
    constructor(props) {
      super(props);
    }

    render() {
        return (
            <div>
                {this.state.powerMeterConnected ? 
                (<div>Power Meter Connected</div>) :
                (<div>Power Meter Not Connected</div>)}
            </div>
        );      
    }
}  
