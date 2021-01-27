import React from "react";
import { GarminStick3, BicyclePowerSensor, HeartRateSensor, FitnessEquipmentSensor } from 'ant-plus';
import { DeviceType, DeviceChannel } from './ts/ant';

const AntContext = React.createContext();

// This context provider is passed to any component requiring the context
class AntProvider extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = {
      antInitialized: false,
      fecConnected: false,
      bpConnected: false,
      hrmConnected: false
    }

    this.onStartup = this.onStartup.bind(this);
    this.onRead = this.onRead.bind(this);
    this.onDeviceConnected = this.onDeviceConnected.bind(this);
    this.onDeviceDisconnected = this.onDeviceDisconnected.bind(this);

    this.stick = new GarminStick3();
    this.stick.on('startup', this.onStartup);
    this.stick.on('read', this.onRead);

    this.stick.openAsync( (err) => {
      if (err) {
        console.log("Error trying to open Garmin stick:", err);
        return;
      }
      console.log("stick open");
    });
  }

  onStartup() {
    console.log("stick startup");

    this.ant = {
      stick: this.stick,
      fec: new FitnessEquipmentSensor(this.stick),
      bp: new BicyclePowerSensor(this.stick),
      bpAverager: null, //new PowerAverager(bp),
      hrm: new HeartRateSensor(this.stick)
    }

    this.ant.hrm.on('attached', () => { this.onDeviceConnected(DeviceType.HEART_RATE_DEVICE_TYPE) });
    this.ant.bp.on('attached', () => { this.onDeviceConnected(DeviceType.BIKE_POWER_DEVICE_TYPE) });
    this.ant.fec.on('attached', () => { this.onDeviceConnected(DeviceType.FEC_DEVICE_TYPE) });

    this.ant.hrm.on('detached', () => { this.onDeviceDisconnected(DeviceType.HEART_RATE_DEVICE_TYPE) });
    this.ant.bp.on('detached', () => { this.onDeviceDisconnected(DeviceType.BIKE_POWER_DEVICE_TYPE) });
    this.ant.fec.on('detached', () => { this.onDeviceDisconnected(DeviceType.FEC_DEVICE_TYPE) });

    this.setState( { 
      antInitialized: true
    })
  }

  onDeviceConnected(deviceType) {
    if (deviceType === DeviceType.HEART_RATE_DEVICE_TYPE) {
      this.setState( {
        hrmConnected: true
      });
      console.log('hrm connected to main.tsx');
    }
  }

  onDeviceDisconnected(deviceType) {
    if (deviceType === DeviceType.HEART_RATE_DEVICE_TYPE) {
      this.setState( {
        hrmConnected: false
      });
      console.log('hrm disconnected from main.tsx');
    }
  }

  componentDidMount() {
  }

  componentWillUnmount() {    
    this.ant.stick.close();
  }

  onRead(data) {
    // console.log("data", data);
  }
  
  connectDevice(deviceType, deviceId) {
    switch (deviceType) {
      case DeviceType.HEART_RATE_DEVICE_TYPE:
        this.ant.hrm.attach(DeviceChannel.ANT_HRM_CHANNEL_ID, deviceId);
        break;
      default:
        console.log("ERROR: connectDevice, invalid deviceType!");
    }
    console.log("connected to: " + deviceId);
  }

  disconnectDevice(deviceType) {
    if (deviceType === DeviceType.HEART_RATE_DEVICE_TYPE) {
      console.log('disconnecting hrm.');
      this.ant.hrm.detach();
    }
  }

  render() {
    return (
      <AntContext.Provider
        value={{
          ant: this.ant,
          antInitialized: this.state.antInitialized,
          fecConnected: this.state.fecConnected,
          bpConnected: this.state.bpConnected,
          hrmConnected: this.state.hrmConnected,
          connectDevice: this.connectDevice,
          disconnectDevice: this.disconnectDevice
        }}
      >
        {this.props.children}
      </AntContext.Provider>
    );
  }
}

export { AntContext, AntProvider };