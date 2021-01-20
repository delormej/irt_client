import { EventEmitter } from 'events';
import { GarminStick3, BicyclePowerSensor, HeartRateSensor, FitnessEquipmentSensor } from 'ant-plus';

export enum DeviceType {
  BIKE_POWER_DEVICE_TYPE = 0x0B,
  FEC_DEVICE_TYPE = 0x11,
  HEART_RATE_DEVICE_TYPE = 0x78
}

export interface AntObjects {
    stick: GarminStick3;
    fec: FitnessEquipmentSensor; 
    bp: BicyclePowerSensor;
    bpAverager: Object;
    hrm: HeartRateSensor;
}

export interface DeviceInfo {
    deviceId: number;
    deviceType: number;
    manufacturerId: number;
    manufacturerName: string;
    timestamp: any; // not used... remove in the future
}

/*
  Emits the following events; ('initialized'), ('deviceConnected', [deviceInfo]), ('deviceDisconnected', [deviceInfo])
*/
export class AntContext extends EventEmitter {

  private readonly ANT_BG_CHANNEL_ID = 0;
  private readonly  ANT_FEC_CHANNEL_ID = 1;
  private readonly  ANT_BP_CHANNEL_ID = 2;
  private readonly  ANT_HRM_CHANNEL_ID = 3;

  stick: GarminStick3;
  fec: FitnessEquipmentSensor; 
  bp: BicyclePowerSensor;
  bpAverager: Object;
  hrm: HeartRateSensor;

  initializing: boolean;
  fecConnected: boolean;
  bpConnected: boolean;
  hrmConnected: boolean;

  constructor() {
    super();

    this.initializing = true;
    this.stick = new GarminStick3();

    this.fecConnected = false;
    this.bpConnected = false;
    this.hrmConnected = false;

    this.onStartup = this.onStartup.bind(this);
    this.onRead = this.onRead.bind(this);
    this.onDeviceConnected = this.onDeviceConnected.bind(this);
    this.onDeviceDisconnected = this.onDeviceDisconnected.bind(this);

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

  connectDevice(deviceType: number, deviceId: number) {
    switch (deviceType) {
      case DeviceType.HEART_RATE_DEVICE_TYPE:
        this.hrm.attach(this.ANT_BP_CHANNEL_ID, deviceId);
        break;
      default:
        console.log("ERROR: connectDevice, invalid deviceType!");
    }
    console.log("connected to: " + deviceId);
    this.emit('deviceConnected', deviceType);
  }

  disconnectDevice(deviceType: number) {
    if (deviceType === DeviceType.HEART_RATE_DEVICE_TYPE) {
      console.log('disconnecting hrm.');
      this.hrm.detach();
    }
  }

  private onStartup(): void { 
    console.log('Stick present', this.stick.is_present());

    this.fec = new FitnessEquipmentSensor(this.stick);
    this.bp = new BicyclePowerSensor(this.stick);
    this.bpAverager = null; //new PowerAverager(bp),
    this.hrm = new HeartRateSensor(this.stick);

    this.hrm.on('attached', () => { this.onDeviceConnected(DeviceType.HEART_RATE_DEVICE_TYPE) });
    this.bp.on('attached', this.onDeviceConnected); // (DeviceType.BIKE_POWER_DEVICE_TYPE));
    this.fec.on('attached', this.onDeviceConnected); // (DeviceType.FEC_DEVICE_TYPE));

    this.hrm.on('detached', () => { this.onDeviceDisconnected(DeviceType.HEART_RATE_DEVICE_TYPE) });
    this.bp.on('detached', this.onDeviceDisconnected); // (DeviceType.BIKE_POWER_DEVICE_TYPE));
    this.fec.on('detached', this.onDeviceDisconnected); // (DeviceType.FEC_DEVICE_TYPE));

    this.initializing = false;
    this.emit('initialized');
  }

  private onRead(data): void {
    // console.log("data", data);
  }

  private onDeviceConnected(deviceType: number): void {
    console.log('device connected of type: ', deviceType);

    switch (deviceType) {
      case DeviceType.HEART_RATE_DEVICE_TYPE:
        this.hrmConnected = true;  
        this.emit('deviceConnected', DeviceType.HEART_RATE_DEVICE_TYPE);
        break;
      default:
        console.log("deviceType NOT implemented");
    }
  }

  private onDeviceDisconnected(deviceType: number): void {
    console.log('device disconnected of type: ', deviceType);
    this.emit('deviceDisconnected', deviceType);
  }
}