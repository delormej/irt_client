const stepController = function(steps, cbStep) { 
    var startTime = Date.now();
    var executedDuration = 0;
    var stepIndex = 0;
    var timedSteps = [];

    function findStep() {
        var now = (Date.now() - startTime) / 1000;
        
        if (steps[stepIndex] == null)
            return null;

        if (now >= steps[stepIndex].duration + executedDuration) {
            executedDuration += steps[stepIndex].duration;

            if (++stepIndex >= steps.length)
                return null;
        }

        return steps[stepIndex];
    }

    function start() {
        // every second send the current command
        var timer = setInterval( function() {
            var step = findStep();
            if (step == null) {
                clearInterval(timer);
                console.log("clr");
            }            
            cbStep(step);
        }, 1000);
    }

    stepController.prototype.start = start;
};

module.exports = stepController;

