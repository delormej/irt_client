import { EventEmitter } from 'events';
import { HeartRateScanner, FitnessEquipmentScanner, BicyclePowerScanner } from 'ant-plus';
import { DeviceType } from './ts/ant';

export class ScannerService extends EventEmitter {
    constructor(stick) {
        super();

        this.onDeviceInfo = this.onDeviceInfo.bind(this);
        
        this.bpScanner = new BicyclePowerScanner(stick);
        this.fecScanner = new FitnessEquipmentScanner(stick);
        this.hrmScanner = new HeartRateScanner(stick);
    }

    onDeviceInfo(deviceType, data) {
        let deviceInfo = {
            deviceType: deviceType,
            deviceId: data.DeviceID,
            manufacturerId: data.ManId
        };

        console.log("found", deviceInfo.deviceId, deviceInfo.manufacturerId);
        this.emit('deviceInfo', deviceInfo);
    }
    
    start() {
        this.bpScanner.on('powerData', (data) => 
            this.onDeviceInfo(DeviceType.BIKE_POWER_DEVICE_TYPE, data) );
        this.bpScanner.scan();

        this.fecScanner.on('fitnessData', (data) => 
            this.onDeviceInfo(DeviceType.FEC_DEVICE_TYPE, data));
        this.fecScanner.scan();

        this.hrmScanner.on('hbData', (data) => 
            this.onDeviceInfo(DeviceType.HEART_RATE_DEVICE_TYPE, data));
        this.hrmScanner.scan();
    }
  
    stop() {
        this.bpScanner.removeAllListeners();
        this.fecScanner.removeAllListeners();
        this.hrmScanner.removeAllListeners();

        this.bpScanner.close();
        this.fecScanner.close();
        this.hrmScanner.close();
    }    
}