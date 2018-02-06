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
        this.fec.on('batteryStatus', this.onBatteryStatus);
    }

    componentWillUnmount() {
        this.fec.removeListener('batteryStatus', this.onBatteryStatus);
    }

    getStatusDescription(status) {
        let description;
        switch (status) {
            case 0x01:
                description = "New";
                break;
            case 0x02:
                description = "Good";
                break;
            case 0x03:
                description = "Ok";
                break;
            case 0x04:
                description = "Low"
                break;
            case 0x05:
                description = "Critical";
                break;
            default:
                description = "";
                break;
        }
        return description;
    }

    render() {
        return (
            <div className="batteryStatus">
                {getStatusDescription(this.state.status)}
            </div>
        );
    }
}
