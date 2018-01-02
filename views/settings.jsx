'use babel';

import React from 'react';
import MountAwareReactComponent from '../scripts/mountAwareReactComponent.js';
import AvailableDevices from '../views/AvailableDevices.jsx';
import TrainerSettings from '../views/trainerSettings.jsx';
import PowerMeterSettings from '../views/powerMeterSettings.jsx';
import antlib from '../lib/ant/antlib.js';

function CancelSearch(props) {
    return (
        <div>
            <div>Attempting to connect...</div>
            <button onClick={() => props.onDisconnectDevice(props.deviceType)}>Cancel</button>
        </div>
    );
}

export default class Settings extends MountAwareReactComponent {
    constructor(props) {
        super(props);
        this.fec = props.ant.fec;
        this.bp = props.ant.bp;
        this.bgScanner = props.ant.bgScanner;
        this.onFecChannelStatus = this.onFecChannelStatus.bind(this);
        this.onBpChannelStatus = this.onBpChannelStatus.bind(this);
    }

    componentDidMount() {
        super.componentDidMount();
        this.fec.on('channel_status', this.onFecChannelStatus);
        this.bp.on('channel_status', this.onBpChannelStatus);
        this.bgScanner.openChannel();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.fec.removeListener('channel_status', this.onFecChannelStatus);
        this.bp.removeListener('channel_status', this.onBpChannelStatus);
        this.bgScanner.closeChannel();
    }

    onChannelStatus(deviceType, status, deviceId, timestamp) {
        // hack for the moment.
        console.log(deviceType, ' channel status updated...', deviceId, status);
        this.forceUpdate();
    }

    onBpChannelStatus(status, deviceId, timestamp) {
        this.onChannelStatus(antlib.BIKE_POWER_DEVICE_TYPE, status, deviceId, timestamp);
    }

    onFecChannelStatus(status, deviceId, timestamp) {
        this.onChannelStatus(antlib.FEC_DEVICE_TYPE, status, deviceId, timestamp);
    }

    onConnectDevice(deviceType, deviceId) {
        console.log("Attempting to connect to: ", deviceId);
        if (deviceId == null || deviceId == "")
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
            // not implemented yet.
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
            // not implemented yet.
            // this.hrm.closeChannel();
        }
    }

    renderForChannelStatus(deviceType, channelStatus) {
        if (channelStatus == antlib.STATUS_TRACKING_CHANNEL) {
            if (deviceType == antlib.BIKE_POWER_DEVICE_TYPE) {
                return (
                    <PowerMeterSettings fec={this.fec}
                        onDisconnectDevice={(deviceType) => this.onDisconnectDevice(deviceType)} />
                );
            }
            else if (deviceType == antlib.FEC_DEVICE_TYPE) {
                return (
                    <TrainerSettings fec={this.fec}
                        onDisconnectDevice={(deviceType) => this.onDisconnectDevice(deviceType)} />
                );
            }
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
            <div>
                {this.renderTrainer()}
                {this.renderPowerMeter()}
                {this.renderHeartRate()}
            </div>
        );
    }
}  
