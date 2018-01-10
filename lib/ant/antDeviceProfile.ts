import { EventEmitter } from 'events';
const antlib = require('./antlib.js');

export enum ChannelStatus {
    STATUS_UNASSIGNED_CHANNEL = 0x00,
    STATUS_ASSIGNED_CHANNEL,
    STATUS_SEARCHING_CHANNEL,
    STATUS_TRACKING_CHANNEL,
}

/* Called on any RF event for the channel */
interface ChannelEventFunc {
    (channelId: number, eventId: number, timestamp?: number)
}

interface ChannelDevice {
    deviceId: number;
    deviceType: number;
    transmissionType: number;
}

interface ChannelIdFunc {
    ( channelId: number, channelDevice: ChannelDevice )
}

export interface ChannelConfig {
    channelType: number; 
    deviceId: number; 
    deviceType: number; 
    transmissionType: number;
    frequency: number;
    channelPeriod: number;
    channelCallback: ChannelEventFunc;
    channelIdCallback: ChannelIdFunc;
    buffer: Buffer;
}    

export abstract class DeviceProfile extends EventEmitter {
    private _channelConfig: ChannelConfig;
    protected _channelId: number;
    protected _channelStatus: ChannelStatus;          
    
    constructor() {
        super();
        this._channelStatus = ChannelStatus.STATUS_UNASSIGNED_CHANNEL;
        this.internalCreateChannelConfig();
    }

    public openChannel(channelId: number, deviceId?: number) {
        antlib.init();
        if (deviceId) 
            this._channelConfig.deviceId = deviceId;
        this._channelId = channelId;
        this._channelStatus = ChannelStatus.STATUS_ASSIGNED_CHANNEL;
        antlib.openChannel(channelId, this._channelConfig);
    }

    public closeChannel() {
        antlib.closeChannel(this._channelId);
    }

    public getChannelDevice(): ChannelDevice {
        let device: ChannelDevice = {
            deviceId: this._channelConfig.deviceId,
            deviceType: this._channelConfig.deviceType,
            transmissionType: this._channelConfig.transmissionType
        }
        return device;
    }

    public getChannelStatus(): ChannelStatus {
        return this._channelStatus.valueOf();
    }

    protected abstract updateChannelConfig(config: ChannelConfig);
    protected abstract onMessage(messageId: number, timestamp: number);

    private onChannelStatus(channelId: number, status: ChannelStatus) {
        if (this._channelStatus != status) {
            this.updateChannelStatus(status);
        }
    }
    
    private onChannelId(channelId: number, channelDevice: ChannelDevice) {
        this._channelConfig.deviceId = channelDevice.deviceId;
        this._channelConfig.deviceType = channelDevice.deviceType;
        this._channelConfig.transmissionType = channelDevice.transmissionType;
        this.updateChannelStatus(ChannelStatus.STATUS_TRACKING_CHANNEL);
    }

    private onChannelEvent(channelId: number, eventId: number, timestamp?: number) {
        switch(eventId) {
            case antlib.EVENT_RX_BROADCAST:
            case antlib.EVENT_RX_FLAG_BROADCAST:
                this.ensureDeviceTracking();
                this.onMessage(this.getMessageId(), timestamp);
                break;
            case antlib.EVENT_RX_FAIL_GO_TO_SEARCH:
            case antlib.EVENT_RX_SEARCH_TIMEOUT:
                this.updateChannelStatus(ChannelStatus.STATUS_SEARCHING_CHANNEL);
                break;
            case antlib.EVENT_CHANNEL_CLOSED:
                this.updateChannelStatus(ChannelStatus.STATUS_ASSIGNED_CHANNEL);
                break;
            default: // eventId
                console.log('Unrecognized event.', eventId);
                break;                                    
        }
    }
    
    private ensureDeviceTracking() {
        if (this._channelStatus != ChannelStatus.STATUS_TRACKING_CHANNEL) 
            antlib.requestChannelId(this._channelId);
    }

    private getMessageId(): number {
        return this._channelConfig.buffer[1]; 
    }

    private updateChannelStatus(status: ChannelStatus) {
        console.log('channel_status updated: ', status);
        this._channelStatus = status;
        this.emit('channel_status', this._channelStatus, this._channelConfig.deviceId);            
    }

    private internalCreateChannelConfig() : void {
        this._channelConfig = {
            channelType: 0, 
            deviceId: 0,
            deviceType: 0, 
            transmissionType: 0,
            frequency: 0,
            channelPeriod: 0,
            channelCallback: null,
            channelIdCallback: null,
            buffer: null
        }
        this.updateChannelConfig(this._channelConfig);
        this._channelConfig.buffer = new Buffer(antlib.MESG_MAX_SIZE_VALUE);
        /* NOTE the syntax for assigning channelCallback which is required to handle 'this':
            https://github.com/Microsoft/TypeScript/wiki/'this'-in-TypeScript */
        this._channelConfig.channelCallback = (channelId, eventId, timestamp) => 
            { this.onChannelEvent(channelId, eventId, timestamp) };
        this._channelConfig.channelIdCallback = (channelId, channelDevice) =>
            { this.onChannelId(channelId, channelDevice) };
    }
}
