'use babel';

import React from 'react';
import TrainerSettings from '../views/trainerSettings.jsx';
import AdvancedTrainerSettings from '../views/advancedTrainerSettings';
import PowerMeterSettings from '../views/powerMeterSettings.jsx';
import AdvancedPowerMeterSettings from '../views/advancedPowerMeterSettings.jsx';
import antlib from '../lib/ant/antlib.js';
import ElectronSettings from 'electron-settings';
import HeartRateConnected from '../views/heartRateConnected.jsx';
import DeviceSettings from '../views/deviceSettingsWrapper';
import AvailableDevices from './availableDevices';

const ANT_BG_CHANNEL_ID = 0;
const ANT_FEC_CHANNEL_ID = 1;
const ANT_BP_CHANNEL_ID = 2;
const ANT_HRM_CHANNEL_ID = 3;

function ToggleAdvancedTrainerSettings(props) {
    let showAdvanced;
    if (props.showAdvanced)
        showAdvanced = <AdvancedTrainerSettings fec={props.fec} />;
    else 
        showAdvanced = <button onClick={() => props.onShowAdvanced()}>Advanced</button>;
    return showAdvanced;
}

export default class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showAdvanced: false
        }
        this.fec = props.ant.fec;
        this.bp = props.ant.bp;
        this.hrm = props.ant.hrm;
        this.bgScanner = props.ant.bgScanner;
        this.stick = props.stick;
    }

    componentDidMount() {
        this.bgScanner.openChannel();
        if (this.props.firstLoad == true) 
            this.tryLastConnections();
    }

    componentWillUnmount() {
        this.bgScanner.closeChannel();
        this.saveSettings();
    }

    tryLastConnections() {
        if (ElectronSettings.has('fecDeviceId') &&
                this.fec.status != antlib.STATUS_TRACKING_CHANNEL) {
            let fecDeviceId = ElectronSettings.get('fecDeviceId')
            if (fecDeviceId) 
                this.onConnectDevice(antlib.FEC_DEVICE_TYPE, fecDeviceId);
        }
        if (ElectronSettings.has('bpDeviceId') &&
                this.bp.status != antlib.STATUS_TRACKING_CHANNEL) {
            let bpDeviceId = ElectronSettings.get('bpDeviceId');
            if (bpDeviceId) 
                this.onConnectDevice(antlib.BIKE_POWER_DEVICE_TYPE, bpDeviceId);
        }        
        if (ElectronSettings.has('hrmDeviceId') &&
                this.hrm.status != antlib.STATUS_TRACKING_CHANNEL) {
            let hrmDeviceId = ElectronSettings.get('hrmDeviceId');
            if (hrmDeviceId) 
                this.onConnectDevice(antlib.HEART_RATE_DEVICE_TYPE, hrmDeviceId);
        }
    }

    saveSettings() {
        if (this.fec.status == antlib.STATUS_TRACKING_CHANNEL) {
            let deviceId = this.fec.getDeviceId();
            ElectronSettings.set('fecDeviceId', deviceId);
        }
        if (this.bp.status == antlib.STATUS_TRACKING_CHANNEL) {
            let deviceId = this.bp.getDeviceId();
            ElectronSettings.set('bpDeviceId', deviceId);
        }        
        if (this.hrm.status == antlib.STATUS_TRACKING_CHANNEL) {
            let deviceId = this.hrm.getDeviceId();
            ElectronSettings.set('hrmDeviceId', deviceId);
        }
        ElectronSettings.set("maxHeartRateBpm", this.props.maxHeartRateBpm);
        ElectronSettings.set("ftp", this.props.ftp);
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
            this.setState( {
                showAdvanced: false
            });
            this.fec.closeChannel();
        }
        else if (deviceType == antlib.HEART_RATE_DEVICE_TYPE) {
            this.hrm.closeChannel();
        }
    }
    
    onShowAdvanced() {
        this.setState( {
            showAdvanced: true
        });
    }

    render() {
        return (
            <div className="settings">
                <DeviceSettings ant={this.props.ant}>
                    <TrainerSettings fec={this.fec} 
                        deviceId={this.fec.getDeviceId()}
                        onConnectDevice={(deviceType, deviceId) => this.onConnectDevice(deviceType, deviceId)}
                        onDisconnectDevice={() => this.onDisconnectDevice(antlib.FEC_DEVICE_TYPE)}  />           
                    <ToggleAdvancedTrainerSettings 
                            showAdvanced={this.state.showAdvanced} 
                            onShowAdvanced={() => this.onShowAdvanced()}
                            fec={this.fec}  />                            
                </DeviceSettings>
                <div className="powerMeter">
                    <DeviceSettings ant={this.props.ant}>
                        <PowerMeterSettings
                            deviceId={this.bp.getDeviceId()} 
                            ftp={this.props.ftp}
                            onChange={this.props.onChange} 
                            onConnectDevice={(deviceType, deviceId) => this.onConnectDevice(deviceType, deviceId)}
                            onDisconnectDevice={() => this.onDisconnectDevice(antlib.BIKE_POWER_DEVICE_TYPE)} />
                    </DeviceSettings>
                    {this.state.showAdvanced && <AdvancedPowerMeterSettings 
                        fec={this.fec} onChange={this.props.onChange} /> }
                </div>
                {/* <DeviceSettings ant={this.props.ant}> */}
                    <HeartRateConnected deviceId={0/*this.hrm.getDeviceId()*/}
                        stick={this.stick}
                        maxHeartRateBpm={this.props.maxHeartRateBpm}
                        onConnectDevice={(deviceType, deviceId) => this.onConnectDevice(deviceType, deviceId)}
                        onDisconnectDevice={() => this.onDisconnectDevice(antlib.HEART_RATE_DEVICE_TYPE)} 
                        onChange={this.props.onChange} />                
                {/* </DeviceSettings> */}
            </div>
        );
    }
}  
