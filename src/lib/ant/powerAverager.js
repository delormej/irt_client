
const PowerAverager = function(bp) { 
    var powerEvents = [];
    var eventCount = 0;
    bp.on('standardPowerOnly', onBikePower);
    bp.on('ctfMainPage', onBikePower);

    function onBikePower(data, timestamp) {
        powerEvents.push( {
            eventCount: eventCount++,
            power: data.instantPower,
            timestamp: timestamp
        });
    }

    function findIndexOfOldest(startIndex, oldestTimestamp) {
        for (var i = startIndex; i > 0; i--) {
            if (powerEvents[i].timestamp < oldestTimestamp)
                return i;
        }
        return 0;
    }

    function calculateAveragePower(powerEventSeries) {
        var accumulatedPower = 0;
        powerEventSeries.forEach(function(element) { 
            accumulatedPower += element.power; 
        });
        var averagePower = (accumulatedPower / powerEventSeries.length).toFixed(0);
        return averagePower;
    }

    function getAverage(seconds) {
        const reducer = (accumulator, currentValue) => accumulator + currentValue.power;
        const lastIndex = powerEvents.length - 1;
        if (lastIndex <= 0)
            return 0;
        var lastTimestamp = powerEvents[lastIndex].timestamp;
        var oldestIndex = 0;
        if (seconds < lastTimestamp)
            oldestIndex = findIndexOfOldest(lastIndex, lastTimestamp - seconds);
        var powerEventSeries = powerEvents.slice(oldestIndex, lastIndex);
        return calculateAveragePower(powerEventSeries);
    }

    PowerAverager.prototype.getAverage = getAverage;
};

module.exports = PowerAverager;
