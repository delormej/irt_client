'use babel';

import React from 'react';
import AvailableDevices from '../views/AvailableDevices.jsx';
import TrainerSettings from '../views/trainerSettings.jsx';
import PowerMeterSettings from '../views/powerMeterSettings.jsx';
import antlib from '../lib/ant/antlib.js';
import deviceType from '../scripts/deviceType.js';
import ElectronSettings from 'electron-settings';

const ANT_BG_CHANNEL_ID = 0;
const ANT_FEC_CHANNEL_ID = 1;
const ANT_BP_CHANNEL_ID = 2;
const ANT_HRM_CHANNEL_ID = 3;

function CancelSearch(props) {
    let className = "cancel " +
        deviceType.getDeviceClassName(props.deviceType);
    return (
        <div className={className}>
            <div>Attempting to connect...</div>
            <button onClick={() => props.onDisconnectDevice(props.deviceType)}>Cancel</button>
        </div>
    );
}

export default class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.fec = props.ant.fec;
        this.bp = props.ant.bp;
        this.hrm = props.ant.hrm;
        this.bgScanner = props.ant.bgScanner;
        this.state = {
            firstLoad: true
        }
    }

    componentDidMount() {
        this.bgScanner.openChannel();
        // if (this.state.firstLoad) {
        //     this.tryLastConnections();
        //     this.state.firstLoad = false;
        // }
    }

    componentWillUnmount() {
        this.bgScanner.closeChannel();
    }

    tryLastConnections() {
        if (ElectronSettings.has('fecDeviceId') &&
                this.props.fecDevice.status != antlib.STATUS_TRACKING_CHANNEL) {
            let fecDeviceId = ElectronSettings.get('fecDeviceId')
            if (fecDeviceId) 
                this.onConnectDevice(antlib.FEC_DEVICE_TYPE, fecDeviceId);
        }
        if (ElectronSettings.has('bpDeviceId') &&
                this.props.bpDevice.status != antlib.STATUS_TRACKING_CHANNEL) {
            let bpDeviceId = ElectronSettings.get('bpDeviceId');
            if (bpDeviceId) 
                this.onConnectDevice(antlib.BIKE_POWER_DEVICE_TYPE, bpDeviceId);
        }        
        if (ElectronSettings.has('hrmDeviceId') &&
                this.props.hrmDevice.status != antlib.STATUS_TRACKING_CHANNEL) {
            let hrmDeviceId = ElectronSettings.get('hrmDeviceId');
            if (hrmDeviceId) 
                this.onConnectDevice(antlib.HEART_RATE_DEVICE_TYPE, hrmDeviceId);
        }
    }

    onConnectDevice(deviceType, deviceId) {
        console.log("Attempting to connect to: ", deviceId);
        if (!deviceId)
            throw new Error("Invalid device ID, cannot connect.");
        
        if (deviceType == antlib.BIKE_POWER_DEVICE_TYPE) {
            if (this.bp.getChannelStatus() != antlib.STATUS_TRACKING_CHANNEL)
                this.bp.openChannel(deviceId);
            else 
                throw new Error("Bike Power channel already assigned.");
        }
        else if (deviceType == antlib.FEC_DEVICE_TYPE) {
            let channelStatus = this.fec.getChannelStatus();
            if (channelStatus != antlib.STATUS_TRACKING_CHANNEL)
                this.fec.openChannel(deviceId);
            else 
                throw new Error("Trainer (FE-C) channel already assigned.");            
        }
        else if (deviceType == antlib.HEART_RATE_DEVICE_TYPE) {
            let channelStatus = this.hrm.getChannelStatus();
            if (channelStatus != antlib.STATUS_TRACKING_CHANNEL)
                this.hrm.openChannel(ANT_HRM_CHANNEL_ID, deviceId);
            else 
                throw new Error("Heart Rate Monitor channel already assigned.");            
        }
    }

    onDisconnectDevice(deviceType) {
        if (deviceType == antlib.BIKE_POWER_DEVICE_TYPE) {
            this.bp.closeChannel();
        }
        else if (deviceType == antlib.FEC_DEVICE_TYPE) {
            this.fec.closeChannel();
        }
        else if (deviceType == antlib.HEART_RATE_DEVICE_TYPE) {
            this.hrm.closeChannel();
        }
    }

    renderForChannelStatus(deviceType, channelStatus) {
        if (channelStatus == antlib.STATUS_TRACKING_CHANNEL) {
            if (deviceType == antlib.BIKE_POWER_DEVICE_TYPE) {
                return (
                    <PowerMeterSettings fec={this.fec} 
                        deviceId={this.props.bpDevice.deviceId}
                        onDisconnectDevice={(deviceType) => this.onDisconnectDevice(deviceType)} />
                );
            }
            else if (deviceType == antlib.FEC_DEVICE_TYPE) {
                return (
                    <TrainerSettings fec={this.fec} 
                        deviceId={this.props.fecDevice.deviceId}
                        onDisconnectDevice={(deviceType) => this.onDisconnectDevice(deviceType)} />
                );
            }
        }
        else if(channelStatus == antlib.STATUS_SEARCHING_CHANNEL) {
            return (
                <CancelSearch deviceType={deviceType} 
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
        return this.renderForChannelStatus(antlib.BIKE_POWER_DEVICE_TYPE, channelStatus);
    }

    renderTrainer() {
        let channelStatus = this.fec.getChannelStatus();
        return this.renderForChannelStatus(antlib.FEC_DEVICE_TYPE, channelStatus);        
    }

    renderHeartRate() {
        let channelStatus = antlib.STATUS_UNASSIGNED_CHANNEL; /*this..getChannelStatus();*/
        return this.renderForChannelStatus(antlib.HEART_RATE_DEVICE_TYPE, channelStatus);        
    }

    render() {
        return (
            <div className="settings">
                {this.renderTrainer()}
                {this.renderPowerMeter()}
                {this.renderHeartRate()}
            </div>
        );
    }
}  
