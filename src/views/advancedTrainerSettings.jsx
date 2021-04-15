'use babel';

import React from 'react';
import SetResistance from '../views/setResistance';
import { AntContext } from '../lib/ant/antProvider';

export default class AdvancedTrainerSettings extends React.Component {
    constructor(props) {
        super(props);

        this.onRefresh = this.onRefresh.bind(this);
        this.onSave = this.onSave.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSetResistance = this.handleSetResistance.bind(this);

        this.state = {
            deviceId: props.DeviceId,
            rawSettings: props.Settings,
            servoOffset: props.ServoOffset,
            drag: props.Drag,
            rr: props.RR,
            saveToFlashEnabled: true,
            powerMeterConnected: props.PowerMeterConnected,
            resistance: 0,
            grade: 0,
            target: 0,
            servo: 0
        };        
    }

    componentDidMount() {
        // this.fec.on('irtExtraInfo', this.onIrtExtraInfo);
        // this.fec.on('batteryStatus', this.onBatteryStatus);
        // this.fec.on('irtSettings', this.onIrtSettings);
        // this.fec.on('commandStatus', this.onCommandStatus);
        // this.context.ant.fec.getSettings();
    }

    componentWillUnmount() {
        // this.fec.removeListener('irtExtraInfo', this.onIrtExtraInfo);
        // this.fec.removeListener('batteryStatus', this.onBatteryStatus);
        // this.fec.removeListener('irtSettings', this.onIrtSettings);
        // this.fec.removeListener('commandStatus', this.onCommandStatus);
    }    

    onCommandStatus(data, timestamp) {
        const BASIC_RESISTANCE_PAGE = 0x30;
        const TARGET_POWER_PAGE = 0x31;
        const WIND_RESISTANCE_PAGE = 0x32;
        const TRACK_RESISTANCE_PAGE = 0x33;        
        let name; 
        let value;;
        switch (data.lastCommand) {
            case BASIC_RESISTANCE_PAGE:
                name = "resistance";
                value = data.resistance;
                break;
            case TARGET_POWER_PAGE:
                name = "target";
                value = data.targetPower;
                break;
            case WIND_RESISTANCE_PAGE:
                // data.windCoeff = buffer[6];
                // data.windSpeed = buffer[7];
                // data.draftFactor = buffer[8]; 
                name = "wind";
                value = data.windSpeed;
                break;
            case TRACK_RESISTANCE_PAGE:
                name = "grade";
                value = data.slope;
                break;
            default:
                return;
        }
        console.log("got command status: ", name, value);
        this.setState( {
            [name]: value
        });
    }

    onBatteryStatus(data, timestamp) {
    }

    onEnableDFU() {
        // this.fec.setDfuMode();
    }

    onSave() {
        console.log("Sending settings to FE-C...");
        // this.fec.setIrtSettings(this.state.drag, this.state.rr, this.state.servoOffset, 
        //     this.state.rawSettings, this.state.saveToFlashEnabled);
    }

    handleSetResistance(resistanceType, value) {
        switch (resistanceType) {
            case "servo":
                // this.fec.setServoPosition(value);
                break;
            case "target":
                // this.fec.setTargetPower(value);
                break;
            case "resistance":
                // this.fec.setBasicResistance(value);
                break;
            case "grade":
                // this.fec.setTrackResistance(value);
                break;
            default:
                break;
        }
        this.setState({
            [resistanceType]: value
        });
    }

    onRefresh() {
        // this.fec.getSettings();
        // this.fec.requestLastCommand();
        this.context.ant.fec.getSettings();
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
                    value={this.state.Settings} 
                    onChange={this.handleInputChange}/>
                <div className="label">Servo Offset</div>
                <input name="servoOffset" type="textbox" 
                    value={this.state.ServoOffset} 
                    onChange={this.handleInputChange}/>
                <div className="label">Drag</div>
                <input name="drag" type="textbox" 
                    value={this.state.Drag} 
                    onChange={this.handleInputChange}/>                    
                <div className="label">Rolling Resistance</div>
                <input name="rr" type="textbox" 
                    value={this.state.RR} 
                    onChange={this.handleInputChange}/>                           
                <div className="label">Save to Flash</div>
                <input name="saveToFlashEnabled" type="checkbox" 
                    checked={this.state.saveToFlashEnabled} 
                    onChange={this.handleInputChange}/>
                <button onClick={() => this.onSave()}>Save</button>
                <button onClick={() => this.onRefresh()}>Refresh</button>
                <SetResistance servo={this.state.servo} grade={this.state.grade} 
                    target={this.state.target} resistance={this.state.resistance}
                    onSetResistance={this.handleSetResistance} />
            </div>
        );
    }
}

AdvancedTrainerSettings.contextType = AntContext;