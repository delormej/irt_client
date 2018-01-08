import { EventEmitter } from 'events';
import antlib from './antlib.js';

namespace Ant {
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
        private receiveBuffer: Buffer;
        private sendBuffer: Buffer;
        protected config: ChannelConfig;
        public channelId: number;
        
        constructor() {
            super();
            this.receiveBuffer = new Buffer(antlib.MESG_MAX_SIZE_VALUE);
            this.sendBuffer = new Buffer(antlib.MESG_MAX_SIZE_VALUE);
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
                    let messagedId = this.receiveBuffer[1];
                    this.onMessage(messagedId, timestamp);
                    break;
                case antlib.MESG_CHANNEL_STATUS_ID:
                    console.log('Channel status changed:', this.config);
                    this.emit('channel_status', FEC_CHANNEL_CONFIG.status,
                        FEC_CHANNEL_CONFIG.deviceId, timestamp);
                    
                    break;
                default: // eventId
                    console.log('Unrecognized event.', eventId);
                    break;                                    

            }
                    
        }
        
        private internalCreateChannelConfig() : void {
            this.config = this.createChannelConfig();
            this.config.channelCallback = this.onChannelEvent;   
        }
    }
}