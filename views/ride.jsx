'use babel';

import React from 'react';
import SpeedMph from '../views/speedMph.jsx';
import DistanceTravelled from '../views/distanceTravelled.jsx';
import ElapsedTime from '../views/elapsedTime.jsx';
import TrainerPower from '../views/trainerPower.jsx';
import PowerMeter from '../views/powerMeter.jsx';
import AveragePower from '../views/averagePower.jsx';
import TargetPower from '../views/targetPower.jsx';
import Cadence from '../views/cadence.jsx';
import SpecificTrainerData from '../views/specificTrainerData.jsx';
import PowerMeterConnected from '../views/powerMeterConnected.jsx';

export default class Ride extends React.Component {
    constructor(props) {
      super(props);
      this.fec = this.props.ant.fec;
      this.bp = this.props.ant.bp;
      this.bpAverager = this.props.ant.bpAverager;
      this.bgScanner = this.props.ant.bgScanner;
      this.state = {
        averageSeconds: 10
      };
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
              <PowerMeterConnected fec={this.fec} />
              <AveragePower bp={this.bp} bpAverager={this.bpAverager} seconds={this.state.averageSeconds} />
            </div>
          );      
    }
}  
  