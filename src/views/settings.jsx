/*
    This is a highlevel wrapper for the settings page which allows a user to list all
    available sensors, pair the appropriate Bike Power, FEC and Heart Rate Monitor.

    The settings page also hosts a control that allow the user to issue commands to 
    configure the FeC device.
*/

import React from 'react';
import TrainerSettings from '../views/trainerSettings.jsx';
import AdvancedTrainerSettings from '../views/advancedTrainerSettings';
import PowerMeterSettings from '../views/powerMeterSettings.jsx';
import AdvancedPowerMeterSettings from '../views/advancedPowerMeterSettings.jsx';
import ElectronSettings from 'electron-settings';
import HeartRateConnected from '../views/heartRateConnected.jsx';
import DeviceSettings from '../views/deviceSettingsWrapper';
import { hocAntMessage } from '../containers/hocAntMessage';
import { AntContext } from '../lib/ant/antProvider';
import { DeviceType } from '../lib/ant/ts/ant';

const WrappedHeartRateConnected = hocAntMessage(HeartRateConnected, 'hbData');
const WrappedTrainerSettings = hocAntMessage(TrainerSettings, 'fitnessData');
const WrappedPowerMeterSettings = hocAntMessage(PowerMeterSettings, 'powerData');

// function hocAntMessage(WrappedComponent, message) {
//     class HocAntMessage extends React.Component {
//         constructor(props) {
//             super(props);
//             this.state = {
//                 message: message
//             };
//             this.onData = this.onData.bind(this);
//         }

//         onData(data) {
//             this.setState( { ...data, } );
//         }

//         render() {
//             // const { ant, ...passThroughProps } = this.props;
//             console.log('wrapping message:', message);
//             return (
//                 <WrappedComponent  />
//             );
//         }
//     }

//     HocAntMessage.displayName = `hocAntMessage(${WrappedComponent.name})`;

//     return HocAntMessage;
// }


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
            showAdvanced: false,
            hrmDeviceId: 0,
            bpDeviceId: 0,
            fecDeviceId: 0
        }

        this.onSelectBp = this.onSelectBp.bind(this);
        this.onSelectFec = this.onSelectFec.bind(this);
        this.onSelectHrm = this.onSelectHrm.bind(this);
        this.onConnect = this.onConnect.bind(this);
    }

    componentDidMount() {
        if (this.props.firstLoad == true) 
            this.tryLastConnections();
    }

    componentWillUnmount() {
        this.saveSettings();
    }

    onSelectHrm(deviceId) {
        this.setState( {
            hrmDeviceId: deviceId
        });
    }

    onSelectFec(deviceId) {
        this.setState( {
            fecDeviceId: deviceId
        });
    }

    onSelectBp(deviceId) {
        this.setState( {
            bpDeviceId: deviceId
        });
    }

    onConnect() {
        if (this.state.fecDeviceId === 0 &&
            this.state.bpDeviceId === 0 &&
            this.state.hrmDeviceId === 0) {
                console.log('nothing to connect to');
                return;
        }

        this.context.connectAll(this.state.fecDeviceId, 
            this.state.bpDeviceId,
            this.state.hrmDeviceId);
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
    
    onShowAdvanced() {
        this.setState( {
            showAdvanced: true
        });
    }

    render() {
        return (
            <div className="settings">
                <div>
                    <strong>Selected Devices:</strong> <hr/>
                    HRM: {this.state.hrmDeviceId}<br/>
                    BP: {this.state.bpDeviceId}<br/>
                    FEC: {this.state.fecDeviceId}<br/>
                    <button onClick={this.onConnect}>Connect</button>
                </div>
                <DeviceSettings {...this.props} 
                        availableDevices={this.context.fecDevicesAvailable}>
                    <WrappedTrainerSettings 
                        ant={this.context.ant.fec}
                        onConnectDevice={(deviceType, deviceId) => this.onSelectFec(deviceId)}
                        onDisconnectDevice={() => this.context.disconnectDevice(DeviceType.FEC_DEVICE_TYPE)}  />                    
                    { /*<ToggleAdvancedTrainerSettings 
                            showAdvanced={this.state.showAdvanced} 
                            onShowAdvanced={() => this.onShowAdvanced()} /> */ }
                </DeviceSettings>
                <div className="powerMeter">
                    <DeviceSettings {...this.props}
                            availableDevices={this.context.bpDevicesAvailable}>
                        <WrappedPowerMeterSettings
                            ant={this.context.ant.bp}
                            ftp={this.props.ftp}
                            onChange={this.props.onChange} 
                            onConnectDevice={(deviceType, deviceId) => this.onSelectBp(deviceId)}
                            onDisconnectDevice={() => this.context.disconnectDevice(DeviceType.BIKE_POWER_DEVICE_TYPE)} />
                    </DeviceSettings>
                    {/*this.state.showAdvanced && <AdvancedPowerMeterSettings 
                        fec={this.fec} onChange={this.props.onChange} /> */}
                </div>
                <DeviceSettings {...this.props}
                        availableDevices={this.context.hrmDevicesAvailable}>
                    <WrappedHeartRateConnected
                        ant={this.context.ant.hrm}
                        maxHeartRateBpm={this.props.maxHeartRateBpm}
                        onConnectDevice={(deviceType, deviceId) => this.onSelectHrm(deviceId)}
                        onDisconnectDevice={() => this.context.disconnectDevice(DeviceType.HEART_RATE_DEVICE_TYPE)} 
                        onChange={this.props.onChange} /> 
                </DeviceSettings>
            </div>
        );
    }
}  

Settings.contextType = AntContext;