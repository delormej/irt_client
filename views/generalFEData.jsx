'use babel';

import React from 'react';
import MountAwareReactComponent from '../scripts/mountAwareReactComponent.js';
import SpeedMph from '../views/speedMph.jsx';

export default class GeneralFEData extends MountAwareReactComponent {
    constructor(props) {
        super(props);
        this.state = {
            speedMps: 0,
            distanceTravelled: 0,
            elapsedTime: 0,
            distanceTravelledEnabled: false,
            fecState: 0
        }
        let fec;
        fec = props.fec;
        fec.on('generalFEData', (data, timestamp) => {
            if (this.mounted) {
                this.setState({
                    speedMps: data.speedMps,
                    distanceTravelled: data.distanceTravelled,
                    elapsedTime: data.elapsedTime,
                    distanceTravelledEnabled: data.distanceTravelledEnabled,
                    fecState: data.state
                });
            }
        });
    }   

    render() {
        return (
            <SpeedMph mps={this.state.speedMps} />
        );
    }
}
