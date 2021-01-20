/*
    This is a highlevel wrapper for the settings page which allows a user to list all
    available sensors, pair the appropriate Bike Power, FEC and Heart Rate Monitor.

    The settings page also hosts a control that allow the user to issue commands to 
    configure the FeC device.
*/
'use babel';

import React from 'react';
import TrainerSettings from '../views/trainerSettings.jsx';
import AdvancedTrainerSettings from '../views/advancedTrainerSettings';
import PowerMeterSettings from '../views/powerMeterSettings.jsx';
import AdvancedPowerMeterSettings from '../views/advancedPowerMeterSettings.jsx';
import ElectronSettings from 'electron-settings';
import HeartRateConnected from '../views/heartRateConnected.jsx';
import DeviceSettings from '../views/deviceSettingsWrapper';
import { hocAntMessage } from '../containers/hocAntMessage';
import antlib from '../lib/ant/antlib.js';
import { AntContext } from '../lib/ant/ts/ant';

const WrappedHeartRateConnected = hocAntMessage(['hbData'])(HeartRateConnected);

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
        this.ant = props.ant;
        this.state = {
            showAdvanced: false,
        }
    }

    componentDidMount() {
        if (this.props.firstLoad == true) 
            this.tryLastConnections();
    }

    componentWillUnmount() {
        this.saveSettings();
    }

    tryLastConnections() {
        // if (ElectronSettings.has('fecDeviceId') &&
        //         this.fec.status != antlib.STATUS_TRACKING_CHANNEL) {
        //     let fecDeviceId = ElectronSettings.get('fecDeviceId')
        //     if (fecDeviceId) 
        //         this.onConnectDevice(antlib.FEC_DEVICE_TYPE, fecDeviceId);
        // }
        // if (ElectronSettings.has('bpDeviceId') &&
        //         this.bp.status != antlib.STATUS_TRACKING_CHANNEL) {
        //     let bpDeviceId = ElectronSettings.get('bpDeviceId');
        //     if (bpDeviceId) 
        //         this.onConnectDevice(antlib.BIKE_POWER_DEVICE_TYPE, bpDeviceId);
        // }        
        // if (ElectronSettings.has('hrmDeviceId') &&
        //         this.hrm.status != antlib.STATUS_TRACKING_CHANNEL) {
        //     let hrmDeviceId = ElectronSettings.get('hrmDeviceId');
        //     if (hrmDeviceId) 
        //         this.onConnectDevice(antlib.HEART_RATE_DEVICE_TYPE, hrmDeviceId);
        // }
    }

    saveSettings() {
        // if (this.fec.status == antlib.STATUS_TRACKING_CHANNEL) {
        //     let deviceId = this.fec.getDeviceId();
        //     ElectronSettings.set('fecDeviceId', deviceId);
        // }
        // if (this.bp.status == antlib.STATUS_TRACKING_CHANNEL) {
        //     let deviceId = this.bp.getDeviceId();
        //     ElectronSettings.set('bpDeviceId', deviceId);
        // }        
        // if (this.hrm.status == antlib.STATUS_TRACKING_CHANNEL) {
        //     let deviceId = this.hrm.getDeviceId();
        //     ElectronSettings.set('hrmDeviceId', deviceId);
        // }
        ElectronSettings.set("maxHeartRateBpm", this.props.maxHeartRateBpm);
        ElectronSettings.set("ftp", this.props.ftp);
    }

    onConnectDevice(deviceType, deviceId) {
        console.log("Attempting to connect to: ", deviceId);
        if (!deviceId)
            throw new Error("Invalid device ID, cannot connect.");
        
        this.ant.connectDevice(deviceType, deviceId);
    }

    onDisconnectDevice(deviceType) {
        console.log("Attempting to disconnect device.");
        this.ant.disconnectDevice(deviceType);
    }
    
    onShowAdvanced() {
        this.setState( {
            showAdvanced: true
        });
    }

    render() {
        return (
            <div className="settings">
                <div>Connected? {this.props.hrmConnected ? "true" : "false" }</div>
                {/* <DeviceSettings ant={this.props.ant}>
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
                </div> */}
                <DeviceSettings ant={this.props.ant} {...this.props}>
                    <WrappedHeartRateConnected 
                        ant={this.props.ant.hrm}
                        maxHeartRateBpm={this.props.maxHeartRateBpm}
                        onConnectDevice={(deviceType, deviceId) => this.onConnectDevice(deviceType, deviceId)}
                        onDisconnectDevice={() => this.onDisconnectDevice(antlib.HEART_RATE_DEVICE_TYPE)} 
                        onChange={this.props.onChange} /> 
                </DeviceSettings>
            </div>
        );
    }
}  
