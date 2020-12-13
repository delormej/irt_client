'use babel';

import React from 'react';

export default class BatteryStatus extends React.Component {
    constructor(props) {
        super(props);
        this.antDevice = props.ant;
        this.state = {
            operatingHours: 0,
            status: 0,
            voltage: 0
        }
        this.onBatteryStatus = this.onBatteryStatus.bind(this);
    }
    
    onBatteryStatus(data, timestamp) {
        this.setState({
            operatingHours: data.operatingHours,
            status: data.status,
            voltage: data.voltage
        });
    }

    componentDidMount() {
        this.antDevice.on('batteryStatus', this.onBatteryStatus);
    }

    componentWillUnmount() {
        this.antDevice.removeListener('batteryStatus', this.onBatteryStatus);
    }

    getStatusDescription(status) {
        const description = [ "New", "Good", "Ok", "Low", "Critical" ];
        if (status > description.length-1)
            return "";
        return description[status];
    }

    render() {
        return (
            <div className="batteryStatus">
                Battery: {this.getStatusDescription(this.state.status)}
            </div>
        );
    }
}
