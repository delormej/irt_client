import { EventEmitter } from 'events';
const antlib = require('./antlib.js');

    enum ChannelStatus {
        STATUS_UNASSIGNED_CHANNEL = 0x00,
        STATUS_ASSIGNED_CHANNEL,
        STATUS_SEARCHING_CHANNEL,
        STATUS_TRACKING_CHANNEL,
    }
    
    /* Called on any RF event for the channel */
    interface ChannelEventFunc {
        (channelId: number, eventId: number, timestamp?: number)
    }

    interface ChannelStatusFunc {
        (channelId: number, status: ChannelStatus)
    }

    interface ChannelDevice {
        deviceId: number; 
        deviceType: number;
        transmissionType: number;
    }

    interface ChannelIdFunc {
        ( channelId: number, channelDevice: ChannelDevice )
    }

    interface ChannelConfig {
        channelType: number; 
        deviceId: number; 
        deviceType: number; 
        transmissionType: number;
        frequency: number;
        channelPeriod: number;
        channelCallback: ChannelEventFunc;
        channelStatusCallback: ChannelStatusFunc;
        channelIdCallback: ChannelIdFunc;
        buffer: Buffer;
    }    

    abstract class DeviceProfile extends EventEmitter {
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
            antlib.openChannel(channelId, this._channelConfig);
        }

        public closeChannel() {
            throw new Error("Not implemented!");
        }

        public getChannelDevice(): ChannelDevice {
            let device: ChannelDevice = {
                deviceId: this._channelConfig.deviceId,
                deviceType: this._channelConfig.deviceType,
                transmissionType: this._channelConfig.transmissionType
            }
            return device;
        }

        protected abstract updateChannelConfig(config: ChannelConfig);
        protected abstract onMessage(messageId: number, timestamp: number);

        private onChannelStatus(channelId: number, status: ChannelStatus) {
            if (this._channelStatus != status) {
                this._channelStatus = status;
                this.raiseChannelStatus();
            }
        }
        
        private onChannelId(channelId: number, channelDevice: ChannelDevice) {
            if (this._channelConfig.deviceId != channelDevice.deviceId) {
                this._channelConfig.deviceId = channelDevice.deviceId;
                this._channelConfig.deviceType = channelDevice.deviceType;
                this._channelConfig.transmissionType = channelDevice.transmissionType;
                this.raiseChannelStatus();
            }
        }

        private onChannelEvent(channelId: number, eventId: number, timestamp?: number) {
            switch(eventId) {
                case antlib.EVENT_RX_BROADCAST:
                case antlib.EVENT_RX_FLAG_BROADCAST:
                    this.onMessage(this.getMessageId(), timestamp);
                    break;
                case antlib.EVENT_RX_FAIL_GO_TO_SEARCH:
                case antlib.EVENT_RX_SEARCH_TIMEOUT:
                case antlib.EVENT_CHANNEL_CLOSED:
                    // Do we want to do something here?
                    break;
                default: // eventId
                    console.log('Unrecognized event.', eventId);
                    break;                                    
            }
        }
        
        private getMessageId(): number {
            return this._channelConfig.buffer[1]; 
        }

        private raiseChannelStatus() {
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
                channelStatusCallback: null,
                channelIdCallback: null,
                buffer: null
            }
            this.updateChannelConfig(this._channelConfig);
            this._channelConfig.buffer = new Buffer(antlib.MESG_MAX_SIZE_VALUE);
            /* NOTE the syntax for assigning channelCallback which is required to handle 'this':
                https://github.com/Microsoft/TypeScript/wiki/'this'-in-TypeScript */
            this._channelConfig.channelCallback = (channelId, eventId, timestamp) => 
                { this.onChannelEvent(channelId, eventId, timestamp) };
            this._channelConfig.channelStatusCallback = (channelId, status) => 
                { this.onChannelStatus(channelId, status) };
            this._channelConfig.channelIdCallback = (channelId, channelDevice) =>
                { this.onChannelId(channelId, channelDevice) };
        }
    }

    export default class HeartRateMonitor extends DeviceProfile {
        constructor() {
            super();
        }

        protected updateChannelConfig(config: ChannelConfig) {
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
