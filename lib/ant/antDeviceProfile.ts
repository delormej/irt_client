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
            this.createChannelConfig();
        }

        openChannel(deviceId?: number) : number {
            antlib.init();
            if (!deviceId) 
                this.config.deviceId = deviceId;
            
            this.channelId = antlib.openChannel(this.config);     
            return this.channelId;
        }

        closeChannel() {
            throw new Error("Not implemented!");
        }

        protected abstract createChannelConfig() : ChannelConfig;
        
    }
}