'use babel';

import React from 'react';
import antlib from '../lib/ant/antlib.js';

export default class TrainerSettings extends React.Component {
    constructor(props) {
        super(props);
        this.fec = props.fec;
        this.onDisconnectDevice = props.onDisconnectDevice;
        this.onUserConfig = this.onUserConfig.bind(this);
        this.onManufacturerInfo = this.onManufacturerInfo.bind(this);
        this.onProductInfo = this.onProductInfo.bind(this);
        this.onIrtExtraInfo = this.onIrtExtraInfo.bind(this);
        this.onBatteryStatus = this.onBatteryStatus.bind(this);
        this.onIrtSettings = this.onIrtSettings.bind(this);        
        this.handleInputChange = this.handleInputChange.bind(this);
        this.state = {
            swRevision: '',
            serial: '',
            rawSettings: 0,
            servoOffset: 0,
            drag: 0,
            rr: 0,
            riderWeightKg: 0,
            bikeWeightKg: 0,
            saveToFlashEnabled: true
        };
    }

    componentDidMount() {
        this.fec.on('userConfig', this.onUserConfig);
        this.fec.on('manufacturerInfo', this.onManufacturerInfo);
        this.fec.on('productInfo', this.onProductInfo);
        this.fec.on('irtExtraInfo', this.onIrtExtraInfo);
        this.fec.on('batteryStatus', this.onBatteryStatus);
        this.fec.on('irtSettings', this.onIrtSettings);
        this.fec.getSettings();
    }

    componentWillUnmount() {
        this.fec.removeListener('userConfig', this.onUserConfig);
        this.fec.removeListener('manufacturerInfo', this.onManufacturerInfo);
        this.fec.removeListener('productInfo', this.onProductInfo);
        this.fec.removeListener('irtExtraInfo', this.onIrtExtraInfo);
        this.fec.removeListener('batteryStatus', this.onBatteryStatus);
        this.fec.removeListener('irtSettings', this.onIrtSettings);
    }    

    onUserConfig(data, timestamp) {
        this.setState( {
            riderWeightKg: data.userWeightKg.toFixed(1),
            bikeWeightKg: data.bikeWeightKg.toFixed(1)
        });
    }

    onManufacturerInfo(data, timestamp) {

    }

    onProductInfo(data, timestamp) {
        this.setState( {
            swRevision: data.swRevision,
            serial: data.serial
        });
    }

    onIrtExtraInfo(data, timestamp) {

    }

    onBatteryStatus(data, timestamp) {

    }

    onIrtSettings(data, timestamp) {
        this.setState( {
            drag: data.drag,
            rr: data.rr,
            servoOffset: data.servoOffset,
            rawSettings: data.settings
        });
    }

    onIdentify() {
        this.fec.blinkLed();
    }

    onEnableDFU() {
        this.fec.setDfuMode();
    }

    onSave() {
        console.log("Sending settings to FE-C...");
    }

    onRefresh() {
        this.fec.getIrtSettings();
        setTimeout(function () {
            this.fec.getUserConfiguration();
            }, 300);
    }

    onShowAdvanced() {
        console.log("Show advanced...");
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
        return (
            <div>
                <div className="deviceTitle">Configure Trainer</div>
                <button onClick={() => this.onDisconnectDevice(antlib.FEC_DEVICE_TYPE)}>Disconnect</button>
                <div>
                    Device ID: {this.state.deviceId}<br/>
                    Firmware v{this.state.swRevision}<br/>
                    Serial No: {this.state.serial}<br/>
                </div>                        
                <button onClick={() => this.onIdentify()}>Identify</button><br/>
                <button onClick={() => this.onShowAdvanced()}>Advanced</button><br/>
                <div className="trainerAdvancedSettings">
                    <button onClick={() => this.onEnableDFU()}>Firmware Update</button>                    
                    <div className="label">Settings</div>
                    <input name="rawSettings" type="textbox" 
                        value={this.state.rawSettings} 
                        onChange={this.handleInputChange}/>
                    <div className="label">Servo Offset</div>
                    <input name="servoOffset" type="textbox" 
                        value={this.state.servoOffset} 
                        onChange={this.handleInputChange}/>
                    <div className="label">Drag</div>
                    <input name="drag" type="textbox" 
                        value={this.state.drag} 
                        onChange={this.handleInputChange}/>                    
                    <div className="label">Rolling Resistance</div>
                    <input name="rr" type="textbox" 
                        value={this.state.rr} 
                        onChange={this.handleInputChange}/>                           
                    <div className="label">Rider Weight (kg)</div>
                    <input name="riderWeightKg" type="textbox" 
                        value={this.state.riderWeightKg} 
                        onChange={this.handleInputChange}/>                    
                    <div className="label">Bike Weight (kg)</div>
                    <input name="bikeWeightKg" type="textbox" 
                        value={this.state.bikeWeightKg} 
                        onChange={this.handleInputChange}/>     
                    <input name="saveToFlashEnabled" type="checkbox" 
                        checked={this.state.saveToFlashEnabled} 
                        onChange={this.handleInputChange}/>
                    <div className="label">Save to Flash</div>
                    <br/>
                    <button onClick={() => this.onSave()}>Save</button><br/>
                    <button onClick={() => this.onRefresh()}>Refresh</button>
                </div>              
            </div>
        )
    }
}
