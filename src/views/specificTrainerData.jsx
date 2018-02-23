'use babel';

import React from 'react';
import RideDataComponent from './rideDataComponent';
import TargetPowerStatus from '../views/targetPowerStatus.jsx';

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
            targetPowerLimits: 0,
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
            feState: data.state.feState,
            targetPowerLimits: data.targetPowerLimits
        });
    }

    render() {
        return null;   
    }
}
