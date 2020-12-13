'use babel';

import React from 'react';
import antlib from '../lib/ant/antlib.js';
import deviceType from '../scripts/deviceType.js';
import BatteryStatus from './batteryStatus';

export default class TrainerSettings extends React.Component {
    constructor(props) {
        super(props);
        this.fec = props.fec;
        this.handleInputChange = this.handleInputChange.bind(this);
        this.onUserConfig = this.onUserConfig.bind(this);
        this.onDisconnectDevice = props.onDisconnectDevice;
        this.onManufacturerInfo = this.onManufacturerInfo.bind(this);
        this.onProductInfo = this.onProductInfo.bind(this);
        this.state = {
            deviceId: props.deviceId,
            swRevision: '',
            serial: '',
            riderWeightKg: undefined,
            bikeWeightKg: undefined
        };
    }

    componentDidMount() {
        this.fec.on('userConfig', this.onUserConfig);
        this.fec.on('manufacturerInfo', this.onManufacturerInfo);
        this.fec.on('productInfo', this.onProductInfo);
        this.fec.getUserConfiguration();
    }

    componentWillUnmount() {
        this.fec.removeListener('userConfig', this.onUserConfig);  
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

    onUserConfig(data, timestamp) {
        this.setState( {
            riderWeightKg: data.userWeightKg.toFixed(1),
            bikeWeightKg: data.bikeWeightKg.toFixed(1)
        });
    }

    onIdentify() {
        this.fec.blinkLed();
    }

    onSave() {
        console.log("Sending settings to FE-C...");
        this.fec.setUserConfiguration(this.state.riderWeightKg, 
                this.state.bikeWeightKg, null, null);
    }
    
    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    }

    render() {
        let className = "trainerSettings " + 
            deviceType.getDeviceClassName(antlib.FEC_DEVICE_TYPE);
        return (
            <div className={className}>
                <div className="deviceTitle">Configure Trainer</div>
                <button onClick={() => this.onDisconnectDevice(antlib.FEC_DEVICE_TYPE)}>Disconnect</button><br/>
                <button onClick={() => this.onIdentify()}>Identify</button><br/>
                <div>
                    Device ID: {this.state.deviceId}<br/>
                    Firmware v{this.state.swRevision}<br/>
                    Serial No: {this.state.serial}<br/>
                    <BatteryStatus ant={this.fec} />
                </div>                        
                <div className="advancedTrainerSettings">
                    <div className="label">Rider Weight (kg)</div>
                    <input name="riderWeightKg" type="textbox" 
                        value={this.state.riderWeightKg} 
                        onChange={this.handleInputChange}/>                    
                    <div className="label">Bike Weight (kg)</div>
                    <input name="bikeWeightKg" type="textbox" 
                        value={this.state.bikeWeightKg} 
                        onChange={this.handleInputChange}/>     
                </div>
                <button onClick={() => this.onSave()}>Save</button><br/>
            </div>
        )
    }
}
