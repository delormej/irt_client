'use babel';

import React from 'react';
import antlib from '../lib/ant/antlib.js';
import DeviceSettings from '../views/deviceSettings.jsx'
import DeviceType from '../scripts/deviceType.js';

const INVALID_POWER_METER = 65535;

export default class AdvancedPowerMeterSettings extends DeviceSettings {
    constructor(props) {
        super(props);
        this.fec = props.fec;
        this.handlePairToPowerMeterChange = this.handlePairToPowerMeterChange.bind(this);
        this.onIrtSettingsPowerAdjust = this.onIrtSettingsPowerAdjust.bind(this);
        this.onIrtExtraInfo = this.onIrtExtraInfo.bind(this);
        this.state = {
            powerMeterId: 0,
            pairToPowerMeter: true,
            powerMeterAverageSeconds: 0,
            resistanceAdjustSeconds: 0,
            minAdjustSpeedMph: 0,
            servoSmoothingSteps: 0,
            powerMeterConnected: false,
            saveToFlashEnabled: true
        }
    }

    componentDidMount() {
        this.fec.on('irtExtraInfo', this.onIrtExtraInfo);
        this.fec.on('irtSettingsPowerAdjust', this.onIrtSettingsPowerAdjust);
        if (this.fec.getChannelStatus() == antlib.STATUS_TRACKING_CHANNEL)
            this.fec.getSettings();
    }

    componentWillUnmount() {
        this.fec.removeListener('irtExtraInfo', this.onIrtExtraInfo);
        this.fec.removeListener('irtSettingsPowerAdjust', this.onIrtSettingsPowerAdjust);
    }    

    onIrtExtraInfo(data, timestamp) {
        this.setState( {
            powerMeterConnected: data.powerMeterConnected
        })
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
        if (event.target.name === "ftp")
            this.props.onChange("ftp", event.target.value);
        else
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
        let className = "advancedPowerMeterSettings " + 
            DeviceType.getDeviceClassName(antlib.BIKE_POWER_DEVICE_TYPE);
        return (
            <div className={className}>
                <div className="description">Pair to rollers to adjust resistance based on power meter.</div>
                <label>
                    <input type="radio" name="pairToPowerMeter" 
                        checked={this.state.pairToPowerMeter === true}
                        value={true}
                        onChange={this.handlePairToPowerMeterChange} />
                    Power Meter Id
                </label>
                <input type="textbox" name="powerMeterId" 
                    value={this.state.powerMeterId}
                    onChange={this.handleInputChange} />
                <label>
                    <input type="radio" name="pairToPowerMeter" 
                        checked={this.state.pairToPowerMeter === false}
                        value={false}
                        onChange={this.handlePairToPowerMeterChange} />
                    Do not pair with power meter
                </label>
                <div className="label">...</div>
                <div className="label">Connected to rollers: {this.state.powerMeterConnected.toString()}</div>       
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
                <div className="label">Save to Flash</div>       
                <input name="saveToFlashEnabled" type="checkbox" 
                    checked={this.state.saveToFlashEnabled} 
                    onChange={this.handleInputChange}/>
                <button onClick={() => this.onSave()}>Save</button>    
            </div>
        );
    }
}
