'use babel';

import React from 'react';
import SpeedMph from '../views/speedMph';
import PowerMeter from '../views/powerMeter';
import DistanceTravelled from '../views/distanceTravelled.jsx';
import ElapsedTime from '../views/elapsedTime.jsx';
import TrainerPower from '../views/trainerPower.jsx';
import AveragePower from '../views/averagePower.jsx';
import TargetPower from '../views/targetPower.jsx';
import Cadence from '../views/cadence.jsx';
import ResistanceLevel from '../views/resistanceLevel.jsx';
import HeartRate from '../views/heartRate.jsx';
import RideChart from '../views/rideChart';
import { hocAntMessage } from '../containers/hocAntMessage';

const powerMessages = ['standardPowerOnly', 'ctfMainPage'];
const SpeedMphFromAnt = hocAntMessage('generalFEData')(SpeedMph);
const PowerMeterFromAnt = hocAntMessage(powerMessages)(PowerMeter);
const AveragePowerFromAnt = hocAntMessage(powerMessages)(AveragePower);
const CadenceFromAnt = hocAntMessage(powerMessages)(Cadence);

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
              <SpeedMphFromAnt ant={this.fec} />
              <HeartRate hrm={this.hrm} maxHeartRateBpm={this.props.maxHeartRateBpm} />
              <DistanceTravelled fec={this.fec} />
              <ElapsedTime fec={this.fec} />
              <TrainerPower fec={this.fec} />
              <PowerMeterFromAnt ant={this.bp} ftp={this.props.ftp} />
              <TargetPower fec={this.fec} />
              <CadenceFromAnt ant={this.bp} />
              <AveragePowerFromAnt ant={this.bp} bpAverager={this.bpAverager} 
                seconds={this.props.averageSeconds} />
              <ResistanceLevel fec={this.fec} />
              <RideChart bp={this.bp} hrm={this.hrm} fec={this.fec} 
                bpAverager={this.bpAverager} averageSeconds={this.props.averageSeconds} />
            </div>
        );      
    }
}  
  