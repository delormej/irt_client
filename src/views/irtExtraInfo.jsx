'use babel';

import React from 'react';

export default class IrtExtraInfo extends React.Component {
    constructor(props) {
        super(props);
        this.fec = props.fec;
        this.state = {
            servoPosition: 0,
            target: 0,
            flywheelRevs: 0,
            temperature: 0,
            powerMeterConnected: false
        }
        this.onIrtExtraInfo = this.onIrtExtraInfo.bind(this);
    }
    
    onIrtExtraInfo(data, timestamp) {
        this.setState({
            servoPosition: data.servoPosition,
            target: data.target,
            flywheelRevs: data.flywheelRevs,
            temperature: data.temperature,
            powerMeterConnected: data.powerMeterConnected
        });
    }

    componentDidMount() {
        this.fec.on('irtExtraInfo', this.onIrtExtraInfo);
    }

    componentWillUnmount() {
        this.fec.removeListener('irtExtraInfo', this.onIrtExtraInfo);
    }
}
