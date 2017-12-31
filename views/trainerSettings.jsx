'use babel';

import React from 'react';
import antlib from '../lib/ant/antlib.js';

export default class TrainerSettings extends React.Component {
    constructor(props) {
        super(props);
        this.fec = props.fec;
        this.onDisconnectDevice = props.onDisconnectDevice;
        this.state = {
            rawSettings: 65535,
            servoOffset: 481,
            drag: 1.1,
            rr: 13.4,
            riderWeightKg: 80.1,
            bikeWeightKg: 7.0,
            saveToFlashEnabled: true
        };
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
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
        console.log("Refresh...");
    }

    onShowAdvanced() {
        console.log("Show advanced...");
    }

    render() {
        return (
            <div>
                <div className="deviceTitle">Configure Trainer</div>
                <button onClick={() => this.onDisconnectDevice(antlib.FEC_DEVICE_TYPE)}>Disconnect</button>
                <div>
                    Device ID: xxxxx<br/>
                    Firmware vx.x.x 
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
