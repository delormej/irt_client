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
import { hocAntMessage } from '../containers/hocAntMessage';
import { AntContext } from '../lib/ant/antProvider';

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

interface RideProps {
    averageSeconds: number;
    maxHeartRateBpm: number;
    ftp: number;
}

export default class Ride extends React.Component<RideProps> {
    static contextType = AntContext;

    constructor(props) {
      super(props);
    }

    render() {
        return (
            <div className="ride">
              <SpeedMphFromAnt ant={this.context.ant.fec} RealSpeed={0} />
              <HeartRate hrm={this.context.ant.hrm} maxHeartRateBpm={this.props.maxHeartRateBpm} />
              <DistanceTravelledFromAnt ant={this.context.ant.fec} distanceTravelled={0} />
              <ElapsedTimeFromAnt ant={this.context.ant.fec} elapsedTime={0} />
              <TrainerPowerFromAnt ant={this.context.ant.fec} />
              <PowerMeterFromAnt ant={this.context.ant.bp} ftp={this.props.ftp} instantPower={0} instantCadence={0} />
              <TargetPowerFromAnt ant={this.context.ant.fec} target="0" />
              <CadenceFromAnt ant={this.context.ant.bp} />
              <AveragePowerFromAnt ant={this.context.ant.bp} bpAverager={this.context.ant.bpAverager} 
                averageSeconds={this.props.averageSeconds} />
              <ResistanceLevelFromAnt ant={this.context.ant.fec} resistanceLevel={0} />
              <RideChart bp={this.context.ant.bp} hrm={this.context.ant.hrm} fec={this.context.ant.fec} 
                bpAverager={this.context.ant.bpAverager} averageSeconds={this.props.averageSeconds} />
            </div>
        );      
    }
}  
