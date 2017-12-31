'use babel';

import React from 'react';
import antlib from '../lib/ant/antlib.js';

export default class TrainerSettings extends React.Component {
    constructor(props) {
        super(props);
        this.fec = props.fec;
        this.onDisconnectDevice = props.onDisconnectDevice;
        this.state = {
            rawState: 65535,
            servoOffset: 481,
            drag: 1.1,
            rr: 13.4,
            riderWeightKg: 80.1,
            bikeWeightKg: 7.0,
            saveToFlash: true
        };
    }

    onIdentify() {
        this.fec.blinkLed();
    }

    onEnableDFU() {
        this.fec.setDfuMode();
    }

    onSave() {
        console.log("Sending settings to FE-C...")
    }

    onRefresh() {
        console.log("Refresh...")
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
                <button onClick={() => this.onIdentify()}>Identify</button>
                <button onClick={() => this.onEnableDFU()}>Firmware Update</button>
            </div>
        )
    }
}
