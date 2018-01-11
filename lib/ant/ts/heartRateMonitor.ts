import * as Ant from './antDeviceProfile';

export default class HeartRateMonitor extends Ant.DeviceProfile {
    private _lastHrm: number = 0;
    constructor() {
        super();
    }

    protected updateChannelConfig(config: Ant.ChannelConfig) {
        config.channelType = 0x00;
        config.deviceType = 0x78;
        config.transmissionType = 0;
        config.frequency = 0x39;
        config.channelPeriod = 8070;
    }

    protected onMessage(messageId: number, timestamp: number) {
        let pageChange: boolean = (messageId & 0x80) == 1;
        let pageNumber: number =  (messageId & 0x7F);
        this.interpretGeneralHrmData(this._eventBuffer);
        this.emit('heartRate', this._lastHrm, timestamp);
    }

    private interpretGeneralHrmData(buffer: Buffer) : number {
        let hbEventTime: number = buffer[6] | buffer[7] << 8;
        let hbCount: number = buffer[8];
        let computedHeartRate: number = buffer[8];
        if (computedHeartRate != 0) {
            this._lastHrm = computedHeartRate;
        }
        return this._lastHrm;
    }
}
