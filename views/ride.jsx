'use babel';

import React from 'react';
import SpeedMph from '../views/speedMph.jsx';
import DistanceTravelled from '../views/distanceTravelled.jsx';
import ElapsedTime from '../views/elapsedTime.jsx';
import TrainerPower from '../views/trainerPower.jsx';
import PowerMeter from '../views/powerMeter.jsx';
import TargetPower from '../views/targetPower.jsx';
import Cadence from '../views/cadence.jsx';
import SpecificTrainerData from '../views/specificTrainerData.jsx';

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
              <ElapsedTime fec={this.fec} />
              <TrainerPower fec={this.fec} />
              <PowerMeter bp={this.bp} />
              <TargetPower fec={this.fec} />
              <Cadence bp={this.bp} />
              <SpecificTrainerData fec={this.fec} />              
            </div>
          );      
    }
}  
  