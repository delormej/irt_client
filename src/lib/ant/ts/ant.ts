import { GarminStick3, BicyclePowerSensor, HeartRateSensor, FitnessEquipmentSensor } from 'ant-plus';

export enum DeviceType {
  BIKE_POWER_DEVICE_TYPE = 0x0B,
  FEC_DEVICE_TYPE = 0x11,
  HEART_RATE_DEVICE_TYPE = 0x78
}

export enum DeviceChannel {
  ANT_BG_CHANNEL_ID = 0,
  ANT_FEC_CHANNEL_ID = 1,
  ANT_BP_CHANNEL_ID = 2,
  ANT_HRM_CHANNEL_ID = 3
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