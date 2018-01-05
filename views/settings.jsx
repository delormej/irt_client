'use babel';

import React from 'react';
import AvailableDevices from '../views/AvailableDevices.jsx';
import TrainerSettings from '../views/trainerSettings.jsx';
import PowerMeterSettings from '../views/powerMeterSettings.jsx';
import antlib from '../lib/ant/antlib.js';
import ElectronSettings from 'electron-settings';

function CancelSearch(props) {
    return (
        <div>
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
        this.bgScanner = props.ant.bgScanner;
        this.onFecChannelStatus = this.onFecChannelStatus.bind(this);
        this.onBpChannelStatus = this.onBpChannelStatus.bind(this);
        this.state = {
            fecDeviceId: this.fec.getDeviceId(),
            bpDeviceId: this.bp.getDeviceId(),
            fecChannelStatus: 0,
            bpChannelStatus: 0
        }
    }

    componentDidMount() {
        this.fec.on('channel_status', this.onFecChannelStatus);
        this.bp.on('channel_status', this.onBpChannelStatus);
        this.bgScanner.openChannel();
        this.tryLastConnections();
    }

    componentWillUnmount() {
        this.fec.removeListener('channel_status', this.onFecChannelStatus);
        this.bp.removeListener('channel_status', this.onBpChannelStatus);
        this.bgScanner.closeChannel();
    }

    tryLastConnections() {
        if (ElectronSettings.has('fecDeviceId') &&
                this.fec.getChannelStatus() != antlib.STATUS_TRACKING_CHANNEL) {
            let fecDeviceId = ElectronSettings.get('fecDeviceId')
            if (fecDeviceId) 
                this.onConnectDevice(antlib.FEC_DEVICE_TYPE, fecDeviceId);
        }
        if (ElectronSettings.has('bpDeviceId') &&
                this.bp.getChannelStatus() != antlib.STATUS_TRACKING_CHANNEL) {
            let bpDeviceId = ElectronSettings.get('bpDeviceId');
            if (bpDeviceId) 
                this.onConnectDevice(antlib.BIKE_POWER_DEVICE_TYPE, bpDeviceId);
        }        
    }

    onChannelStatus(deviceType, status, deviceId, timestamp) {
        console.log(deviceType, ' channel status updated...', deviceId, status);
        if (status == antlib.STATUS_TRACKING_CHANNEL) {
            if (deviceType == antlib.FEC_DEVICE_TYPE)
                this.setState( {
                    fecDeviceId: deviceId
                });
            else if (deviceType == antlib.BIKE_POWER_DEVICE_TYPE)
                this.setState( {
                    bpDeviceId: deviceId
                });
        }
    }

    onBpChannelStatus(status, deviceId, timestamp) {
        this.onChannelStatus(antlib.BIKE_POWER_DEVICE_TYPE, status, deviceId, timestamp);
        if (status == antlib.STATUS_TRACKING_CHANNEL) 
            ElectronSettings.set('bpDeviceId', deviceId);
        this.setState( {
            bpDeviceId: deviceId,
            bpChannelStatus: status
        });            
    }

    onFecChannelStatus(status, deviceId, timestamp) {
        this.onChannelStatus(antlib.FEC_DEVICE_TYPE, status, deviceId, timestamp);
        if (status == antlib.STATUS_TRACKING_CHANNEL) 
            ElectronSettings.set('fecDeviceId', deviceId); 
        this.setState( {
            fecDeviceId: deviceId,
            fecChannelStatus: status
        });                        
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
            this.setState( {
                bpDeviceId: 0
            });
        }
        else if (deviceType == antlib.FEC_DEVICE_TYPE) {
            this.fec.closeChannel();
            this.setState( {
                fecDeviceId: 0
            });
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
                    <PowerMeterSettings fec={this.fec} deviceId={this.state.bpDeviceId}
                        onDisconnectDevice={(deviceType) => this.onDisconnectDevice(deviceType)} />
                );
            }
            else if (deviceType == antlib.FEC_DEVICE_TYPE) {
                return (
                    <TrainerSettings fec={this.fec} deviceId={this.state.fecDeviceId}
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
            <div>
                {this.renderTrainer()}
                {this.renderPowerMeter()}
                {this.renderHeartRate()}
            </div>
        );
    }
}  
