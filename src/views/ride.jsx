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

const HrmData = ['hbData'];
const FecData = ['fitnessData'];
const BpData = ['powerData'];

const HeartRateFromAnt = hocAntMessage(HrmData)(HeartRate); 
const SpeedMphFromAnt = hocAntMessage(FecData)(SpeedMph);
/*const DistanceTravelledFromAnt = hocAntMessage(FecData)(DistanceTravelled);
const ElapsedTimeFromAnt = hocAntMessage(FecData)(ElapsedTime);
const TrainerPowerFromAnt = hocAntMessage(FecData)(TrainerPower);
const PowerMeterFromAnt = hocAntMessage(BpData)(PowerMeter);


const AveragePowerFromAnt = hocAntMessage(powerMessages)(AveragePower);
const CadenceFromAnt = hocAntMessage(powerMessages)(Cadence);

const ResistanceLevelFromAnt = hocAntMessage(['generalSettings'])(ResistanceLevel);

const TargetPowerFromAnt = hocAntMessage(['irtExtraInfo'])(TargetPower);
*/

export default class Ride extends React.Component {

    constructor(props) {
      super(props);
    }

    render() {
        return (
            <div className="ride">
              <SpeedMphFromAnt ant={this.context.ant.fec} RealSpeed={0} />
              <HeartRateFromAnt ant={this.context.ant.hrm} maxHeartRateBpm={this.props.maxHeartRateBpm} />
              {/*<DistanceTravelledFromAnt ant={this.context.ant.fec} Distance={0} />
              <ElapsedTimeFromAnt ant={this.context.ant.fec} ElapsedTime={0} />
              <TrainerPowerFromAnt ant={this.context.ant.fec} />
              <PowerMeterFromAnt ant={this.context.ant.bp} ftp={this.props.ftp} instantPower={0} instantCadence={0} />
              <TargetPowerFromAnt ant={this.context.ant.fec} target="0" />
              <CadenceFromAnt ant={this.context.ant.bp} />
              <AveragePowerFromAnt ant={this.context.ant.bp} bpAverager={this.context.ant.bpAverager} 
                averageSeconds={this.props.averageSeconds} />
              <ResistanceLevelFromAnt ant={this.context.ant.fec} resistanceLevel={0} />
              <RideChart bp={this.context.ant.bp} hrm={this.context.ant.hrm} fec={this.context.ant.fec} 
                bpAverager={this.context.ant.bpAverager} averageSeconds={this.props.averageSeconds} /> */}
            </div>
        );      
    }
}  

Ride.contextType = AntContext;
