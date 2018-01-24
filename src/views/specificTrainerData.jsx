'use babel';

import React from 'react';
import RideDataComponent from '../views/rideDataComponent.jsx';
import TargetPowerStatus from '../views/targetPowerStatus.jsx';
import FeState from '../views/feState.jsx';

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
                <TrainerStatus value={this.state.trainerStatus} />
                <TargetPowerStatus value={this.state.targetPowerStatus} />
                <FeState value={this.state.feState} />
            </div>
        );
    }
}
