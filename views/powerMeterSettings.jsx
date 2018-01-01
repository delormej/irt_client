'use babel';

import React from 'react';
import antlib from '../lib/ant/antlib.js';
import DeviceSettings from '../views/deviceSettings.jsx'

const INVALID_POWER_METER = 65535;

export default class PowerMeterSettings extends DeviceSettings {
    constructor(props) {
        super(props);
        this.onDisconnectDevice = props.onDisconnectDevice;
        this.fec = props.fec;
        this.handlePairToPowerMeterChange = this.handlePairToPowerMeterChange.bind(this);
        this.onIrtSettingsPowerAdjust = this.onIrtSettingsPowerAdjust.bind(this);
        this.onIrtExtraInfo = this.onIrtExtraInfo.bind(this);
        this.state = {
            deviceId: 0,
            powerMeterId: 0,
            pairToPowerMeter: true,
            powerMeterAverageSeconds: 0,
            resistanceAdjustSeconds: 0,
            minAdjustSpeedMph: 0,
            servoSmoothingSteps: 0,
            saveToFlashEnabled: true
        }
    }

    componentDidMount() {
        this.fec.on('irtExtraInfo', this.onIrtExtraInfo);
        this.fec.on('irtSettingsPowerAdjust', this.onIrtSettingsPowerAdjust);
        this.fec.getSettings();
    }

    componentWillUnmount() {
        this.fec.removeListener('irtExtraInfo', this.onIrtExtraInfo);
        this.fec.removeListener('irtSettingsPowerAdjust', this.onIrtSettingsPowerAdjust);
    }    

    onIrtExtraInfo(data, timestamp) {

    }

    onIrtSettingsPowerAdjust(data, timestamp) {
        this.setState( {
            powerMeterId: data.powerMeterId,
            powerMeterAverageSeconds: data.powerAverageSeconds,
            resistanceAdjustSeconds: data.powerAdjustSeconds,
            minAdjustSpeedMph: this.convertToMph(data.minAdjustSpeedMps),
            servoSmoothingSteps: data.servoSmoothingSteps
        });
    }

    handleInputChange(event) {
        super.handleInputChange(event, this);
    }

    handlePairToPowerMeterChange(event) {
        const target = event.target;
        const value = (target.value == 'true');
        const name = target.name;

        this.setState( {
            [name] : value
        });
    }

    onShowAdvanced() {
        console.log("Show advanced...");
    }

    convertToMps(mph) {
        const mph_to_mps = 4.4704;
        let value = (mph * mph_to_mps).toFixed(0);
        return value;
    }

    convertToMph(mps) {
        const mps_to_mph = 2.23694 / 10;
        let value = (mps * mps_to_mph).toFixed(1);
        return value;
    }

    onSave() {
        console.log("Saving...");
        this.fec.setIrtPowerAdjustSettings(
            this.state.pairToPowerMeter ? this.state.powerMeterId : INVALID_POWER_METER, 
            this.state.resistanceAdjustSeconds, 
            this.state.powerMeterAverageSeconds, 
            this.state.servoSmoothingSteps, 
            this.convertToMps(this.state.minAdjustSpeedMph), 
            this.state.saveToFlashEnabled
        );
    }

    render() {
        return (
            <div>
                <div className="deviceTitle">Configure Power Meter</div>
                <button onClick={() => this.onDisconnectDevice(antlib.BIKE_POWER_DEVICE_TYPE)}>Disconnect</button>
                <div>
                    Device ID: {this.state.powerMeterId}<br/>
                </div>                        
                <div id="powerMeterSettings">
                    Pair to rollers to adjust resistance based on power meter.<br/>
                    <label>
                        <input type="radio" name="pairToPowerMeter" 
                            checked={this.state.pairToPowerMeter === true}
                            value={true}
                            onChange={this.handlePairToPowerMeterChange} />
                        Power Meter Id
                    </label>
                    <input type="textbox" name="powerMeterId" 
                        value={this.state.powerMeterId}
                        onChange={this.handleInputChange} /><br/>
                    <label>
                        <input type="radio" name="pairToPowerMeter" 
                            checked={this.state.pairToPowerMeter === false}
                            value={false}
                            onChange={this.handlePairToPowerMeterChange} />
                        Do not pair with power meter
                    </label>
                </div>
                <button onClick={() => this.onShowAdvanced()}>Advanced</button><br/>
                <div id="advancedPowerMeterSettings">
                    <div className="label">Power Meter Average Seconds</div>
                    <input type="textbox" name="powerMeterAverageSeconds" 
                        value={this.state.powerMeterAverageSeconds}
                        onChange={this.handleInputChange} />
                    <div className="label">Resistance Adjust Seconds</div>
                    <input type="textbox" name="resistanceAdjustSeconds" 
                        value={this.state.resistanceAdjustSeconds}
                        onChange={this.handleInputChange} />
                    <div className="label">Minimum Adjust Speed (mph)</div>
                    <input type="textbox" name="minAdjustSpeedMph" 
                        value={this.state.minAdjustSpeedMph}
                        onChange={this.handleInputChange} />
                    <div className="label">Servo Smoothing Steps</div>
                    <input type="textbox" name="servoSmoothingSteps" 
                        value={this.state.servoSmoothingSteps}
                        onChange={this.handleInputChange} />
                    <input name="saveToFlashEnabled" type="checkbox" 
                        checked={this.state.saveToFlashEnabled} 
                        onChange={this.handleInputChange}/>
                    <div className="label">Save to Flash</div>                        
                </div>
                <button onClick={() => this.onSave()}>Save</button>
            </div>
        );
    }
}
