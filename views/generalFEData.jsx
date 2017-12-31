'use babel';

import React from 'react';
import SpeedMph from '../views/speedMph.jsx';

export default class GeneralFEData extends React.Component {
    constructor(props) {
        super(props);
        this.fec = props.fec;
        this.state = {
            speedMps: 0,
            distanceTravelled: 0,
            elapsedTime: 0,
            distanceTravelledEnabled: false,
            fecState: 0
        }
        this.onGeneralFEData = this.onGeneralFEData.bind(this);
    }
    
    onGeneralFEData(data, timestamp) {
        this.setState({
            speedMps: data.speedMps,
            distanceTravelled: data.distanceTravelled,
            elapsedTime: data.elapsedTime,
            distanceTravelledEnabled: data.distanceTravelledEnabled,
            fecState: data.state
        });
    }

    componentDidMount() {
        this.fec.on('generalFEData', this.onGeneralFEData);
    }

    componentWillUnmount() {
        this.fec.removeListener('generalFEData', this.onGeneralFEData);
    }

    render() {
        return (
            <SpeedMph mps={this.state.speedMps} />
        );
    }
}
