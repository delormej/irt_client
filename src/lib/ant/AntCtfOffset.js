/*
The transmitted offset value should be averaged over at least 5 samples during the coasting period. The standard deviation
between the previous and current sample should be within +/- 4Hz. If the standard deviation of the received messages is
within this +/- 4Hz range, the display shall save the sampled average as the new offset value.
*/
const AntCtfOffset = function() { 
    var self = this;

    var previousSampledAvg = 0;
    var lastTimestamp = 0;
    var offsetSamples = [];

    function standardDeviation(values) {
        var avg = average(values);
        
        var squareDiffs = values.map(function(value) {
          var diff = value - avg;
          var sqrDiff = diff * diff;
          return sqrDiff;
        });
        
        var avgSquareDiff = average(squareDiffs);
      
        var stdDev = Math.sqrt(avgSquareDiff);
        return stdDev;
      }
      
    function average(data) {
        var sum = data.reduce(function(sum, value){
            return sum + value;
        }, 0);
        
        var avg = sum / data.length;
        return avg;
    }

    /**
     * Returns whether there are enough samples. 
     */
    function hasValidSampleSize() {
        return offsetSamples.length >= 5;
    }

    function resetSamples() {
        offsetSamples = [];
    }

    /**
     * Adds sample to the array if the timestamp is not more than 5 seconds since the last timestamp.
     *  and determines if this sample is valid by:
     *  1. Ensuring there is an adequate sample size (>=5).
     *  2. Ensuring the stddev of the sampling is +/-4.
     *  3. The average of the sampling is +/-4 of the last valid sample.
     * @param value         A CTF Offset Sample sent from the power meter.
     * @param timestamp     Timestamp of the event
     */
    function isValidSample(value, timestamp) {
        // Has it been more than 5 seconds since last sample received.  
        if (timestamp > lastTimestamp+5) {
            resetSamples();
        }

        offsetSamples.push(value);
        lastTimestamp = timestamp;
        
        if (hasValidSampleSize()) {
            var stdDev = standardDeviation(offsetSamples);
            if (Math.abs(stdDev) <= 4) {
                var avg = average(offsetSamples);

                // Ensure it's a small change before saving.
                if (Math.abs(avg - previousSampledAvg) <= 4) {
                    previousSampledAvg = avg;
                    return true;
                }
            }
        }

        return false;
    }

    function getOffset() {
        return previousSampledAvg;
    }

    AntCtfOffset.prototype.isValidSample = isValidSample;
    AntCtfOffset.prototype.getOffset = getOffset;
};

module.exports = AntCtfOffset;
