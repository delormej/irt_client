'use babel';

import React from 'react';
import IrtExtraInfo from '../views/irtExtraInfo.jsx';
import RideDataComponent from './rideDataComponent';

export default class PowerMeterConnected extends IrtExtraInfo {
    constructor(props) {
      super(props);
    }

    render() {
        return (
            <div className="powerMeterConnectedStatus">
                {this.state.powerMeterConnected ? 
                (<div>Power Meter Connected</div>) :
                (<div>Power Meter Not Connected</div>)}
            </div>
        );      
    }
}  
