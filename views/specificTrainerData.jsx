'use babel';

import React from 'react';
import RideDataComponent from '../views/rideDataComponent.jsx';
import TargetPowerStatus from '../views/targetPowerStatus.jsx';

function FeState(props) {
    // Formats the fitness equipment state field into a user string.
    function formatFeState(feState) {
        var value = "";
        switch (feState) {
            case 1: /*FE_ASLEEP_OFF*/
                value = "Off";
                break;
            case 2: /*FE_READY*/
                value = "Ready";
                break;
            case 3: /*FE_IN_USE*/
                value = "In use"
                break;
            case 4: /*FE_FINISHED_PAUSED*/
                value = "Finished or Paused.";
                break;
            default:
                value = "Not set.";
                break;
        }
        return value;
    }

    return (
        <div className="feState">{formatFeState(props.value)}</div>
    );
}

function TrainerStatus(props) {
    // Does nothing right now...
    // var status = {
    //         powerCalibrationRequired : (bits & 0x1),
    //         resistanceCalibrationRequired : (bits & 0x2),
    //         userConfigRequired : (bits & 0x4)
    //     };
    //     return status;
    return (<div />);
}

export default class SpecificTrainerData extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            instantPower: 0,
            trainerStatus: 0,
            target_power_status: 0,
            feState: 0
        }
        this.fec = props.fec;
        this.onSpecificTrainerData = this.onSpecificTrainerData.bind(this);
    }   

    componentDidMount() {
        this.fec.on('specificTrainerData', this.onSpecificTrainerData);
    }

    componentWillUnmount() {
        this.fec.removeListener('specificTrainerData', this.onSpecificTrainerData);
    }

    onSpecificTrainerData(data, timestamp) {
        this.setState({
            instantPower: data.instantPower,
            trainerStatus: data.trainerStatus,
            targetPowerStatus: data.target_power_status,
            feState: data.feState
        });
    }

    render() {
        return (
            <div>
                <RideDataComponent class="trainerPower" label="WATTS"
                    value={this.state.instantPower} />
                <TrainerStatus value={this.state.trainerStatus} />
                <TargetPowerStatus value={this.state.targetPowerStatus} />
                <FeState value={this.state.feState} />
            </div>
        );
    }
}
