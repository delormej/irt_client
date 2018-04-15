import * as React from 'react';
import { SpeedMph, SpeedProps } from './speedMph';
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
import { AntObjects } from './main';
import { hocAntMessage } from '../containers/hocAntMessage';
import { hocChartEvents } from '../containers/hocChartEvent';
import DebugEvents from './debugEvents';

const powerMessages = ['standardPowerOnly', 'ctfMainPage'];
const SpeedMphFromAnt = hocAntMessage(['generalFEData'])(SpeedMph);
const PowerMeterFromAnt = hocAntMessage(powerMessages)(PowerMeter);
const AveragePowerFromAnt = hocAntMessage(powerMessages)(AveragePower);
const CadenceFromAnt = hocAntMessage(powerMessages)(Cadence);
const TrainerPowerFromAnt = hocAntMessage(['specificTrainerData'])(TrainerPower);
const ResistanceLevelFromAnt = hocAntMessage(['generalSettings'])(ResistanceLevel);
const ElapsedTimeFromAnt = hocAntMessage(['generalFEData'])(ElapsedTime);
const TargetPowerFromAnt = hocAntMessage(['irtExtraInfo'])(TargetPower);
const DistanceTravelledFromAnt = hocAntMessage(['generalFEData'])(DistanceTravelled);
//const RideChartFromEvents = hocChartEvents()(RideChart);
const RideChartFromEvents = hocChartEvents()(DebugEvents);

interface RideProps {
    ant: AntObjects;
    averageSeconds: number;
    maxHeartRateBpm: number;
    ftp: number;
}

export default class Ride extends React.Component<RideProps> {
    constructor(props) {
      super(props);
    }

    render() {
        return (
            <div className="ride">
              <SpeedMphFromAnt ant={this.props.ant.fec} speedMps={0} />
              <HeartRate hrm={this.props.ant.hrm} maxHeartRateBpm={this.props.maxHeartRateBpm} />
              <DistanceTravelledFromAnt ant={this.props.ant.fec} distanceTravelled={0} />
              <ElapsedTimeFromAnt ant={this.props.ant.fec} elapsedTime={0} />
              <TrainerPowerFromAnt ant={this.props.ant.fec} />
              <PowerMeterFromAnt ant={this.props.ant.bp} ftp={this.props.ftp} instantPower={0} instantCadence={0} />
              <TargetPowerFromAnt ant={this.props.ant.fec} target="0" />
              <CadenceFromAnt ant={this.props.ant.bp} />
              <AveragePowerFromAnt ant={this.props.ant.bp} bpAverager={this.props.ant.bpAverager} 
                averageSeconds={this.props.averageSeconds} />
              <ResistanceLevelFromAnt ant={this.props.ant.fec} resistanceLevel={0} />
              <RideChartFromEvents bp={this.props.ant.bp} hrm={this.props.ant.hrm} fec={this.props.ant.fec} 
                bpAverager={this.props.ant.bpAverager} averageSeconds={this.props.averageSeconds} />
            </div>
        );      
    }
}  
