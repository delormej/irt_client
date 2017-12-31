'use babel';

import React from 'react';
import antlib from '../lib/ant/antlib.js';

export default class TrainerSettings extends React.Component {
    constructor(props) {
        super(props);
        this.fec = props.fec;
        this.onDisconnectDevice = props.onDisconnectDevice;
        this.state = {
            foo: ""
        };
    }

    onIdentify() {
        this.fec.blinkLed();
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
            </div>
        )
    }
}
