'use babel';

import React from 'react';
import deviceType from '../scripts/deviceType.js';
import BatteryStatus from './batteryStatus';
import { AntContext } from '../lib/ant/antProvider';
import { DeviceType } from '../lib/ant/ts/ant';

export default class TrainerSettings extends React.Component {
    constructor(props) {
        super(props);

        this.handleInputChange = this.handleInputChange.bind(this);
        this.onDisconnectDevice = props.onDisconnectDevice;
        
        this.state = {
            riderWeightKg: undefined,
            bikeWeightKg: undefined
        };
    }

    componentDidMount() {
        this.context.ant.fec.getUserConfiguration();
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
            deviceType.getDeviceClassName(DeviceType.FEC_DEVICE_TYPE);
        return (
            <div className={className}>
                <div className="deviceTitle">Configure Trainer</div>
                <button onClick={() => this.onDisconnectDevice(DeviceType.FEC_DEVICE_TYPE)}>Disconnect</button><br/>
                <button onClick={() => this.onIdentify()}>Identify</button><br/>
                <div>
                    Device ID: {this.props.DeviceID}<br/>
                    Firmware v{this.props.SwVersion}<br/>
                    Serial No: {this.props.SerialNumber}<br/>
                    {/*<BatteryStatus ant={this.fec} /> */}<br/>
                    DistanceTravelled: { this.props.Distance }<br/>
                    Resistance: { this.props.Resistance }<br/>
                </div>                        
                <div className="advancedTrainerSettings">
                    <div className="label">Rider Weight (kg)</div>
                    <input name="riderWeightKg" type="textbox" 
                        value={this.props.UserWeight} 
                        onChange={this.handleInputChange}/>                    
                    <div className="label">Bike Weight (kg)</div>
                    <input name="bikeWeightKg" type="textbox" 
                        value={this.props.BikeWeight} 
                        onChange={this.handleInputChange}/>     
                </div>
                <button onClick={() => this.onSave()}>Save</button><br/>
            </div>
        )
    }
}

TrainerSettings.contextType = AntContext;