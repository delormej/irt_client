'use babel';

import React from 'react';
import antlib from '../lib/ant/antlib.js';
import deviceType from '../scripts/deviceType.js';
import BatteryStatus from './batteryStatus';
import { AntContext } from '../lib/ant/antProvider';

export default class TrainerSettings extends React.Component {
    constructor(props) {
        super(props);

        this.handleInputChange = this.handleInputChange.bind(this);
        this.onDisconnectDevice = props.onDisconnectDevice;
        
        this.state = {
            deviceId: 0,
            swRevision: '',
            serial: '',
            riderWeightKg: undefined,
            bikeWeightKg: undefined
        };
    }

    componentDidMount() {
        this.fec = this.context.ant.fec;
        // this.fec.getUserConfiguration();
    }

    componentWillUnmount() {

    }    

    onIdentify() {
        throw 'not implemented';
        // TODO: this needs to be implemented in custom IrtFitnessEquipmentSensor.
        // this.fec.blinkLed();
    }

    onSave() {
        throw 'not implemented!';
        // TODO: Validate the parameters to this method.
        // console.log("Sending settings to FE-C...");
        // this.fec.setUserConfiguration(this.state.riderWeightKg, 
        //     this.state.bikeWeightKg, null, null);
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
                    Device ID: {this.state.DeviceID}<br/>
                    Firmware v{this.state.SwVersion}<br/>
                    Serial No: {this.state.SerialNumber}<br/>
                    {/*<BatteryStatus ant={this.fec} /> */}
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

TrainerSettings.contextType = AntContext;