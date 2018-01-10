import * as Ant from './antDeviceProfile';

export default class HeartRateMonitor extends Ant.DeviceProfile {
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
        console.log("hrm message: ", messageId);
    }
}
