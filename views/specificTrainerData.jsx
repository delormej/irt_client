'use babel';

import React from 'react';
import RideDataComponent from '../views/rideDataComponent.jsx';

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
            target_power_status: data.target_power_status,
            feState: data.feState
        });
    }

    render() {
        return (
            <RideDataComponent class="trainerPower" label="WATTS"
                value={this.state.instantPower} />
        );
    }
}
