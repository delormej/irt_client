'use babel';

import React from 'react';
import MountAwareReactComponent from '../scripts/mountAwareReactComponent.js';

function TrainerPower(props) {
    return (
        <div className="trainerPower">{props.watts}</div>
    );
}

export default class SpecificTrainerData extends MountAwareReactComponent {
    constructor(props) {
        super(props);
        this.state = {
            instantPower: 0,
            trainerStatus: 0,
            target_power_status: 0,
            feState: 0
        }
        let fec;
        fec = props.fec;
        fec.on('specificTrainerData', (data, timestamp) => {
            if (this.mounted) {
                this.setState({
                    instantPower: data.instantPower,
                    trainerStatus: data.trainerStatus,
                    target_power_status: data.target_power_status,
                    feState: data.feState
                });
            }
        });
    }   

    render() {
        return (
            <TrainerPower watts={this.state.instantPower} />
        );
    }
}
