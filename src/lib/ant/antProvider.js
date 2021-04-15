import React from "react";
import { GarminStick3, BicyclePowerSensor, HeartRateSensor, IrtFitnessEquipmentSensor } from  'ant-plus';
import { DeviceType, DeviceChannel } from './ts/ant';
import antManufacturers from './ant_manufacturers';
import { ScannerService } from "./scannerService";

const AntContext = React.createContext();

// This context provider is passed to any component requiring the context
class AntProvider extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = {
      antInitialized: false,
      fecConnected: false,
      bpConnected: false,
      hrmConnected: false,
      fecDevicesAvailable: [],
      bpDevicesAvailable: [],
      hrmDevicesAvailable: [],
      fecDeviceId: 0,
      bpDeviceId: 0,
      hrmDeviceId: 0      
    }

    this.openStick = this.openStick.bind(this);
    this.onStartup = this.onStartup.bind(this);
    this.onRead = this.onRead.bind(this);
    this.setConnected = this.setConnected.bind(this);
    this.onDeviceConnected = this.onDeviceConnected.bind(this);
    this.onDeviceDisconnected = this.onDeviceDisconnected.bind(this);
    this.onDeviceAvailable = this.onDeviceAvailable.bind(this);
    this.addOrUpdateAvailableDevice = this.addOrUpdateAvailableDevice.bind(this);
    this.connectAll = this.connectAll.bind(this);
    this.clearAvailableDevices = this.clearAvailableDevices.bind(this);
    this.disconnectDevice = this.disconnectDevice.bind(this);

    this.openStick();
  }

  openStick() {
    const DEBUG_LEVEL3 = 3;
    this.stick = new GarminStick3(DEBUG_LEVEL3);
    this.stick.on('startup', this.onStartup);
    this.stick.on('read', this.onRead);

    this.stick.openAsync( (err) => {
      if (err) {
        console.log("Error trying to open Garmin stick:", err);
        return;
      }
      console.log("stick open");
    });

    this.scanner = new ScannerService(this.stick);
  }

  onStartup() {
    console.log("stick startup");

    this.ant = {
      fec: new IrtFitnessEquipmentSensor(this.stick),
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

    this.scanner.on('deviceInfo', this.onDeviceAvailable);
    this.scanner.start();

    this.setState( { 
      antInitialized: true
    })
  }

  onDeviceAvailable(deviceInfo) {
    let key = "";
    switch (deviceInfo.deviceType) {
      case DeviceType.HEART_RATE_DEVICE_TYPE:
        key = 'hrmDevicesAvailable';
        break;
      case DeviceType.FEC_DEVICE_TYPE:
        key = 'fecDevicesAvailable';
        break;
      case DeviceType.BIKE_POWER_DEVICE_TYPE:
        key = 'bpDevicesAvailable';
        break;
      default:
        console.log('unrecognized deviceType', deviceInfo.deviceType);
    }    

    let availableDevices = this.state[key];
 
    if (this.addOrUpdateAvailableDevice(availableDevices, deviceInfo))
      this.setState({ [key]: availableDevices });
  }

  addOrUpdateAvailableDevice(availableDevices, deviceInfo) {
    let dirty = false;
    var element = availableDevices.find(function(value) {
        return value.deviceId == deviceInfo.deviceId;
    });
    if (element != null) {
        if (deviceInfo.manufacturerId) {
            element.manufacturerId = deviceInfo.manufacturerId;
            element.manufacturerName = 
                antManufacturers.getAntManufacturerNameById(deviceInfo.manufacturerId);
        }
        element.timestamp = deviceInfo.timestamp;
        dirty = true;
    }
    else {
        availableDevices.push(deviceInfo);
        dirty = true;
    }     
    return dirty;
  }

  clearAvailableDevices() {
    this.setState( {
      hrmDevicesAvailable: [],
      bpDevicesAvailable: [],
      fecDevicesAvailable: []
    });
  }

  setConnected(deviceType, connected) {
    switch (deviceType) {
      case DeviceType.HEART_RATE_DEVICE_TYPE:
        this.setState( {
          hrmConnected: connected
        });
        break;
      case DeviceType.FEC_DEVICE_TYPE:
        this.setState( {
          fecConnected: connected
        });
        break;
      case DeviceType.BIKE_POWER_DEVICE_TYPE:
        this.setState( {
          bpConnected: connected
        });
        break;
      default:
        throw 'unrecognized deviceType';
    }
  }
  
  onDeviceConnected(deviceType) {
    this.setConnected(deviceType, true);
  }

  onDeviceDisconnected(deviceType) {
    this.setConnected(deviceType, false);
    console.log('disconnected', deviceType);
    
    // Retry connection.
    var deviceId = this.getDeviceId(deviceType);
    if (deviceId > 0)
      this.connectDevice(deviceType, deviceId);
  }

  componentDidMount() {
  }

  componentWillUnmount() {    
    this.stick.close();
  }

  onRead(data) {
    // console.log("data", data);
  }
  
  getDeviceId(deviceType) {
    var deviceId = 0;
    switch (deviceType) {
      case DeviceType.FEC_DEVICE_TYPE:
        deviceId = this.state.fecDeviceId;
        break;
      case DeviceType.BIKE_POWER_DEVICE_TYPE:
        deviceId = this.state.bpDeviceId;
        break;
      case DeviceType.HEART_RATE_DEVICE_TYPE:
        deviceId = this.state.hrmDeviceId;
        break;
      default:
        break;
    }
    return deviceId;
  }

  connectAll(fecDeviceId, bpDeviceId, hrmDeviceId) {
    if (this.stick.isScanning()) {
      // this.scanner.stop();
      this.stick.detach_all();
      this.clearAvailableDevices();
    }

    this.setState( { 
      hrmDeviceId: hrmDeviceId,
      fecDeviceId: fecDeviceId,
      bpDeviceId: bpDeviceId
     });

    if (fecDeviceId > 0) {
      this.connectDevice(DeviceType.FEC_DEVICE_TYPE, fecDeviceId);
    }
    if (bpDeviceId > 0) {
        this.connectDevice(DeviceType.BIKE_POWER_DEVICE_TYPE, bpDeviceId);
    }
    if (hrmDeviceId > 0) {
        this.connectDevice(DeviceType.HEART_RATE_DEVICE_TYPE, hrmDeviceId);
    }    
  }

  connectDevice(deviceType, deviceId) {
    let sensor = null;
    let channel = 0;

    try {
      switch (deviceType) {
        case DeviceType.HEART_RATE_DEVICE_TYPE:
          sensor = this.ant.hrm;
          channel = DeviceChannel.ANT_HRM_CHANNEL_ID;
          break;
        case DeviceType.FEC_DEVICE_TYPE:
          sensor = this.ant.fec;
          channel = DeviceChannel.ANT_FEC_CHANNEL_ID;
          break;
        case DeviceType.BIKE_POWER_DEVICE_TYPE:
          sensor = this.ant.bp;
          channel = DeviceChannel.ANT_BP_CHANNEL_ID;
          break;
        default:
          console.log("ERROR: connectDevice, invalid deviceType!");
          return;
      }

      if (sensor && deviceId > 0) {
        sensor.attach(channel, deviceId);
      }
    }
    catch (e) {
      console.log('error trying to connect:', e);
    }
  }

  disconnectDevice(deviceType) {
    let sensor = null;
    switch (deviceType) {
      case DeviceType.HEART_RATE_DEVICE_TYPE:
        sensor = this.ant.hrm;
        this.setState( { hrmDeviceId: 0 } );
        break;
      case DeviceType.FEC_DEVICE_TYPE:
        sensor = this.ant.fec;
        this.setState( { fecDeviceId: 0 } );
        break;
      case DeviceType.BIKE_POWER_DEVICE_TYPE:
        sensor = this.ant.bp;
        this.setState( { bpDeviceId: 0 } );
        break;
      default:
        throw 'invalid device, cannot disconnect';
    }
    if (sensor)
      sensor.detach();
  }

  render() {
    /* TODO:
      - Rather than expose ant here, antProvider could catch all events and
        re-emit them.  Investigate this, could clean up hocAntMessage() and
        eliminate need to pass ant={x} to each control.  
      - Could get messy though as we can't have multiple inheritance (extends EventEmitter)
    */
    return (
      <AntContext.Provider
        value={{
          ant: this.ant, 
          antInitialized: this.state.antInitialized,
          fecConnected: this.state.fecConnected,
          bpConnected: this.state.bpConnected,
          hrmConnected: this.state.hrmConnected,
          connectAll: this.connectAll,
          connectDevice: this.connectDevice,
          disconnectDevice: this.disconnectDevice,
          fecDevicesAvailable: this.state.fecDevicesAvailable,
          bpDevicesAvailable: this.state.bpDevicesAvailable,
          hrmDevicesAvailable: this.state.hrmDevicesAvailable              
        }}
      >
        {this.props.children}
      </AntContext.Provider>
    );
  }
}

export { AntContext, AntProvider };