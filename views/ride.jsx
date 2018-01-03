'use babel';

import React from 'react';
import GeneralFEData from '../views/generalFEData.jsx';
import SpeedMph from '../views/speedMph.jsx';
import DistanceTravelled from '../views/distanceTravelled.jsx';
import SpecificTrainerData from '../views/specificTrainerData.jsx';
import TrainerPower from '../views/trainerPower.jsx';
import PowerMeter from '../views/powerMeter.jsx';
import Cadence from '../views/cadence.jsx';

export default class Ride extends React.Component {
    constructor(props) {
      super(props);
      this.fec = this.props.ant.fec;
      this.bp = this.props.ant.bp;
      this.bgScanner = this.props.ant.bgScanner;
    }

    render() {
        return (
            <div>
              <SpeedMph fec={this.fec} />
              <DistanceTravelled fec={this.fec} />
              <GeneralFEData fec={this.fec} />
              <TrainerPower fec={this.fec} />
              <PowerMeter bp={this.bp} />
              <Cadence bp={this.bp} />
              <SpecificTrainerData fec={this.fec} />              
            </div>
          );      
    }
}  
  