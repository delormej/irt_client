'use babel';

import React from 'react';
import TrainerSettings from '../views/trainerSettings.jsx';
import SetServo from '../views/SetServo';

export default class AdvancedTrainerSettings extends React.Component {
    constructor(props) {
        super(props);
        this.fec = props.fec;
        this.onIrtExtraInfo = this.onIrtExtraInfo.bind(this);
        this.onBatteryStatus = this.onBatteryStatus.bind(this);
        this.onIrtSettings = this.onIrtSettings.bind(this);        
        this.onSetServo = this.onSetServo.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.state = {
            deviceId: props.deviceId,
            rawSettings: undefined,
            servoOffset: undefined,
            drag: undefined,
            rr: undefined,
            saveToFlashEnabled: true,
            servo: 0
        };        
    }

    componentDidMount() {
        this.fec.on('irtExtraInfo', this.onIrtExtraInfo);
        this.fec.on('batteryStatus', this.onBatteryStatus);
        this.fec.on('irtSettings', this.onIrtSettings);
        this.fec.getSettings();
    }

    componentWillUnmount() {
        this.fec.removeListener('irtExtraInfo', this.onIrtExtraInfo);
        this.fec.removeListener('batteryStatus', this.onBatteryStatus);
        this.fec.removeListener('irtSettings', this.onIrtSettings);
    }    

    onIrtExtraInfo(data, timestamp) {
        this.setState( {
            servo: data.servoPosition,
            flywheelRevs: data.flywheelRevs
        })
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

    onEnableDFU() {
        this.fec.setDfuMode();
    }

    onSave() {
        console.log("Sending settings to FE-C...");
        this.fec.setIrtSettings(this.state.drag, this.state.rr, this.state.servoOffset, 
            this.state.rawSettings, this.state.saveToFlashEnabled);
    }

    onSetServo(position) {
        console.log("Setting servo to: " + position);
        this.fec.setServoPosition(position);
    }

    onRefresh() {
        this.fec.getSettings();
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
            <div className="advancedTrainerSettings">
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
                <div className="label">Save to Flash</div>
                <input name="saveToFlashEnabled" type="checkbox" 
                    checked={this.state.saveToFlashEnabled} 
                    onChange={this.handleInputChange}/>
                <button onClick={() => this.onSave()}>Save</button>
                <button onClick={() => this.onRefresh()}>Refresh</button>
                <SetServo servo={this.state.servo} onSetServo={this.onSetServo} />
            </div>
        );
    }
}