import { DeviceProfile } from "./antDeviceProfile";
import { EventEmitter } from "events";
import PowerAverage from "../../../views/averagePower";

interface PowerEvent {
    eventCount: number;
    power: number;
    timestamp: number;
}

export default class PowerAverager  
{
    private powerEvents: Array<PowerEvent> = new Array<PowerEvent>();
    private eventCount = 0; 
    private bp: EventEmitter;

    constructor(bp: EventEmitter){
        this.onBikePower = this.onBikePower.bind(this);
        this.bp = bp;
        this.bp.on('standardPowerOnly', this.onBikePower);
        this.bp.on('ctfMainPage', this.onBikePower);
    }

    private onBikePower(data, timestamp) {
        this.powerEvents.push( {
            eventCount: this.eventCount++,
            power: data.instantPower,
            timestamp: timestamp
        });
    }

    private findIndexOfOldest(startIndex, oldestTimestamp) {
        for (var i = startIndex; i > 0; i--) {
            if (this.powerEvents[i].timestamp < oldestTimestamp)
                return i;
        }
        return 0;
    }

    private calculateAveragePower(powerEventSeries) : number {
        let accumulatedPower : number = 0;
        powerEventSeries.forEach(function(element) { 
            accumulatedPower += element.power; 
        });
        let averagePower : number = (accumulatedPower / powerEventSeries.length);
        return averagePower;
    }

    public getAverage(seconds) : string {
        const reducer = (accumulator, currentValue) => accumulator + currentValue.power;
        const lastIndex = this.powerEvents.length - 1;
        if (lastIndex <= 0)
            return "0";
        var lastTimestamp = this.powerEvents[lastIndex].timestamp;
        var oldestIndex = 0;
        if (seconds < lastTimestamp)
            oldestIndex = this.findIndexOfOldest(lastIndex, lastTimestamp - seconds);
        var powerEventSeries = this.powerEvents.slice(oldestIndex, lastIndex);
        return this.calculateAveragePower(powerEventSeries).toFixed(0);
    }
};
