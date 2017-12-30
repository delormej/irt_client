'use babel';

import React from 'react';
import MountAwareReactComponent from '../scripts/mountAwareReactComponent.js';
import AvailableDevices from '../views/AvailableDevices.jsx';
import antlib from '../lib/ant/antlib.js';

const BIKE_POWER_DEVICE_TYPE = 0x0B;
const FEC_DEVICE_TYPE = 0x11;
const HEART_RATE_DEVICE_TYPE = 0x78;

function DeviceSettings(props) {
    return (
        <div>
            <div>Settings</div>
            <button onClick={() => props.onDisconnectDevice(props.deviceType)} >Disconnect</button>
        </div>
    );
}

function CancelSearch(props) {
    return (
        <div>
            <div>Attempting to connect...</div>
            <button onClick={() => props.onDisconnectDevice(props.deviceType)} >Cancel</button>
        </div>
    );
}

export default class Settings extends MountAwareReactComponent {
    constructor(props) {
        super(props);
        this.fec = props.ant.fec;
        this.bp = props.ant.bp;
        this.bgScanner = props.ant.bgScanner;
    }

    componentDidMount() {
        super.componentDidMount();
        this.bgScanner.openChannel();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.bgScanner.closeChannel();
    }

    onConnectDevice(deviceType, deviceId) {
        console.log("Attempting to connect to: ", deviceId);
        if (deviceId == null || deviceId == "")
            throw new Error("Invalid device ID, cannot connect.");
        
        if (deviceType == BIKE_POWER_DEVICE_TYPE) {
            if (this.bp.getChannelStatus() != antlib.STATUS_TRACKING_CHANNEL)
                this.bp.openChannel(deviceId);
            else 
                throw new Error("Bike Power channel already assigned.");
        }
        else if (deviceType == FEC_DEVICE_TYPE) {
            let channelStatus = this.fec.getChannelStatus();
            if (channelStatus != antlib.STATUS_TRACKING_CHANNEL)
                this.fec.openChannel(deviceId);
            else 
                throw new Error("Trainer (FE-C) channel already assigned.");            
        }
        else if (deviceType == HEART_RATE_DEVICE_TYPE) {
            // not implemented yet.
        }
    }

    onDisconnectDevice(deviceType) {
        if (deviceType == BIKE_POWER_DEVICE_TYPE) {
            this.bp.closeChannel();
        }
        else if (deviceType == FEC_DEVICE_TYPE) {
            this.fec.closeChannel();
        }
        else if (deviceType == HEART_RATE_DEVICE_TYPE) {
            // not implemented yet.
            // this.hrm.closeChannel();
        }
    }

    renderForChannelStatus(deviceType, channelStatus) {
        if (channelStatus == antlib.STATUS_TRACKING_CHANNEL) {
            return (
                <DeviceSettings deviceType={deviceType} 
                    onDisconnectDevice={(deviceType) => this.onDisconnectDevice(deviceType)} />
            );
        }
        else if(channelStatus == antlib.STATUS_SEARCHING_CHANNEL) {
            return (
                <CancelSearch  deviceType={deviceType} 
                    onDisconnectDevice={(deviceType) => this.onDisconnectDevice(deviceType)} />
            );
        }
        else {
            return (
                <AvailableDevices bgScanner={this.bgScanner} deviceType={deviceType}
                    onConnectDevice={(deviceType, deviceId) => this.onConnectDevice(deviceType, deviceId)} />
            );
        }
    }

    renderPowerMeter() {
        let channelStatus = this.bp.getChannelStatus();
        return this.renderForChannelStatus(BIKE_POWER_DEVICE_TYPE, channelStatus);
    }

    renderTrainer() {
        let channelStatus = this.fec.getChannelStatus();
        return this.renderForChannelStatus(FEC_DEVICE_TYPE, channelStatus);        
    }

    renderHeartRate() {
        let channelStatus = antlib.STATUS_UNASSIGNED_CHANNEL; /*this..getChannelStatus();*/
        return this.renderForChannelStatus(HEART_RATE_DEVICE_TYPE, channelStatus);        
    }

    render() {
        return (
            <div>
                {this.renderPowerMeter()}
                {this.renderTrainer()}
                {this.renderHeartRate()}
            </div>
        );
    }
}  
