'use babel';

import React from 'react';
import antlib from '../lib/ant/antlib.js';
import deviceType from '../scripts/deviceType.js';
import AdvancedTrainerSettings from '../views/advancedTrainerSettings.jsx';

export default class TrainerSettings extends React.Component {
    constructor(props) {
        super(props);
        this.fec = props.fec;
        this.onDisconnectDevice = props.onDisconnectDevice;
        this.onManufacturerInfo = this.onManufacturerInfo.bind(this);
        this.onProductInfo = this.onProductInfo.bind(this);
        this.state = {
            deviceId: props.deviceId,
            swRevision: '',
            serial: '',
            showAdvanced: false
        };
    }

    componentDidMount() {
        this.fec.on('manufacturerInfo', this.onManufacturerInfo);
        this.fec.on('productInfo', this.onProductInfo);
        this.fec.getSettings();
    }

    componentWillUnmount() {
        this.fec.removeListener('manufacturerInfo', this.onManufacturerInfo);
        this.fec.removeListener('productInfo', this.onProductInfo);
    }    

    onManufacturerInfo(data, timestamp) {
    }

    onProductInfo(data, timestamp) {
        this.setState( {
            swRevision: data.swRevision,
            serial: data.serial
        });
    }

    onIdentify() {
        this.fec.blinkLed();
    }

    onShowAdvanced() {
        this.setState( {
            showAdvanced: true
        });
    }

    renderAdvanced() {
        let showAdvanced = null;
        if (this.state.showAdvanced)
            showAdvanced = <AdvancedTrainerSettings fec={this.fec} />;
        else 
            showAdvanced = <button onClick={() => this.onShowAdvanced()}>Advanced</button>;
        return showAdvanced;
    }

    render() {
        let className = "trainerSettings " + 
            deviceType.getDeviceClassName(antlib.FEC_DEVICE_TYPE);
        return (
            <div className={className}>
                <div className="deviceTitle">Configure Trainer</div>
                <button onClick={() => this.onDisconnectDevice(antlib.FEC_DEVICE_TYPE)}>Disconnect</button>
                <div>
                    Device ID: {this.state.deviceId}<br/>
                    Firmware v{this.state.swRevision}<br/>
                    Serial No: {this.state.serial}<br/>
                </div>                        
                <button onClick={() => this.onIdentify()}>Identify</button><br/>
                {this.renderAdvanced()}
            </div>
        )
    }
}
