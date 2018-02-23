'use babel';

import React from 'react';
import SpeedMph from './speedMph';
import PowerMeter from './powerMeter';
import DistanceTravelled from './distanceTravelled';
import ElapsedTime from './elapsedTime';
import TrainerPower from './trainerPower';
import AveragePower from './averagePower';
import TargetPower from './targetPower';
import Cadence from './cadence';
import ResistanceLevel from './resistanceLevel';
import HeartRate from './heartRate';
import RideChart from './rideChart';
import { hocAntMessage } from '../containers/hocAntMessage';

const powerMessages = ['standardPowerOnly', 'ctfMainPage'];
const SpeedMphFromAnt = hocAntMessage('generalFEData')(SpeedMph);
const PowerMeterFromAnt = hocAntMessage(powerMessages)(PowerMeter);
const AveragePowerFromAnt = hocAntMessage(powerMessages)(AveragePower);
const CadenceFromAnt = hocAntMessage(powerMessages)(Cadence);
const TrainerPowerFromAnt = hocAntMessage('specificTrainerData')(TrainerPower);

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
              <TrainerPowerFromAnt ant={this.fec} />
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
  