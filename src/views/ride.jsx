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
import ResistanceLevel from '../views/resistanceLevel.jsx';
import HeartRate from '../views/heartRate.jsx';
import RideChart from '../views/rideChart.jsx';

export default class Ride extends React.Component {
    constructor(props) {
      super(props);
      this.fec = this.props.ant.fec;
      this.bp = this.props.ant.bp;
      this.hrm = this.props.ant.hrm;
      this.bpAverager = this.props.ant.bpAverager;
      this.bgScanner = this.props.ant.bgScanner;
    }

    render() {
        return (
            <div className="ride">
              <SpeedMph fec={this.fec} />
              <HeartRate hrm={this.hrm} maxHeartRateBpm={this.props.maxHeartRateBpm} />
              <DistanceTravelled fec={this.fec} />
              <ElapsedTime fec={this.fec} />
              <TrainerPower fec={this.fec} />
              <PowerMeter bp={this.bp} ftp={this.props.ftp} />
              <TargetPower fec={this.fec} />
              <Cadence bp={this.bp} />
              <AveragePower bp={this.bp} bpAverager={this.bpAverager} 
                seconds={this.props.averageSeconds} />
              <ResistanceLevel fec={this.fec} />
              <RideChart bp={this.bp} hrm={this.hrm} />
            </div>
        );      
    }
}  
  