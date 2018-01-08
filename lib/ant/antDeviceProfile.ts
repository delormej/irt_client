import { EventEmitter } from 'events';
const antlib = require('./antlib.js');

    enum ChannelStatus {
        STATUS_UNASSIGNED_CHANNEL = 0x00,
        STATUS_ASSIGNED_CHANNEL,
        STATUS_SEARCHING_CHANNEL,
        STATUS_TRACKING_CHANNEL,
    }
    
    interface ChannelEventFunc {
        (channelId: number, eventId: number, timestamp: number)
    }
    
    interface ChannelConfig {
        channelType: number; 
        deviceId: number; 
        deviceType: number; 
        transmissionType: number;
        frequency: number;
        channelPeriod: number;
        channelCallback: ChannelEventFunc;
        buffer: Buffer;
        status: ChannelStatus;  
    }

    abstract class DeviceProfile extends EventEmitter {
        protected responseBuffer: Buffer;
        protected config: ChannelConfig;
        public channelId: number;
        
        constructor() {
            super();
            this.responseBuffer = new Buffer(antlib.MESG_MAX_SIZE_VALUE);
            this.internalCreateChannelConfig();
        }

        openChannel(deviceId?: number) : number {
            antlib.init();
            if (deviceId) 
                this.config.deviceId = deviceId;
            this.channelId = antlib.openChannel(this.config);     
            return this.channelId;
        }

        closeChannel() {
            throw new Error("Not implemented!");
        }

        protected abstract createChannelConfig() : ChannelConfig;
        protected abstract onMessage(messageId: number, timestamp: number);

        private onChannelEvent(channelId: number, eventId: number, timestamp: number) {
            switch(eventId) {
                case antlib.EVENT_RX_BROADCAST:
                case antlib.EVENT_RX_FLAG_BROADCAST:
                    let messagedId = this.responseBuffer[1];
                    this.onMessage(messagedId, timestamp);
                    break;
                case antlib.MESG_CHANNEL_STATUS_ID:
                    this.config.status = this.responseBuffer[1] & 0x3;
                    this.emit('channel_status', this.config.status, this.config.deviceId, 
                        timestamp);
                    break;
                default: // eventId
                    console.log('Unrecognized event.', eventId);
                    break;                                    
            }            
        }
        
        private internalCreateChannelConfig() : void {
            this.config = this.createChannelConfig();
            this.config.channelCallback = this.onChannelEvent;
            this.config.buffer = this.responseBuffer;
        }
    }

    export default class HeartRateMonitor extends DeviceProfile {
        constructor() {
            super();
        }

        protected createChannelConfig(): ChannelConfig {
            let config: ChannelConfig = {
                channelType: 0x00, 
                deviceId: 0, 
                deviceType: 0x78, 
                transmissionType: 0,
                frequency: 0x39,
                channelPeriod: 8070,
                channelCallback: null,
                buffer: null,
                status: ChannelStatus.STATUS_UNASSIGNED_CHANNEL  
            };
            return config;
        }

        protected onMessage(messageId: number, timestamp: number) {
            console.log("hrm message: ", messageId, this.responseBuffer);
        }
    }
