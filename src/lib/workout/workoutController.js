const WorkoutController = function(fec, powerMeterId) { 

    var workoutObj = null;
    var stepController = new StepController();

    function StepController() {
        this.queue = [];
        this.ready = true;
    }
    
    StepController.prototype.send = function(duration, cb, arg) {
        cb(arg);
    };

    StepController.prototype.exec = function() {
        this.queue.push(arguments); /* duration, callback, args */
        this.process();
    };
    
    StepController.prototype.process = function() {
        if (this.queue.length === 0) return;
        if (!this.ready) return;
        var self = this;
        this.ready = false;
        var step = this.queue.shift();
        this.send.apply(this, step);
        setTimeout(function () {
        self.ready = true;
        self.process();
        }, step[0] * 1000);
    };
    
    function readWorkout(filename) {
        var fs = require('fs');
        var contents = fs.readFileSync(filename);
        var jsonContent = JSON.parse(contents);
        workoutObj = jsonContent;
    }

    function setTarget(watts) {
        console.log("Setting target to: ", watts);
        fec.setTargetPower(watts);
    }

    function setFecSettings(segment) {
        var minAdjustSpeedMps = 4;
        var persist = false;

        fec.setIrtPowerAdjustSettings(powerMeterId, 
            segment.adjustSeconds, 
            segment.averageSeconds, 
            segment.smoothSteps, 
            minAdjustSpeedMps, 
            persist);        
    }

    function getTotalDuration(steps) {
        function getSum(total, step) {
            return total + step.duration;
        }
        return steps.reduce(getSum, 0) / 60;
    }

    function getInterval(intervalName) {
        var match = null;
        workoutObj.intervals.forEach( function(interval) {
            if (interval.name === intervalName) {
                match = interval;
                return;
            }
        });

        return match;
    }

    function executeSteps(steps) {
        steps.forEach( function(step) {
            stepController.exec(step.duration, setTarget, step.target);       
        });
    }

    function executeSegment(segment) {
        var interval = getInterval(segment.interval);   
        //console.log(interval, getTotalDuration(interval.steps));
        stepController.exec(0.25, setFecSettings, segment);
        executeSteps(interval.steps);
    }

    function executeWorkout(file) {
        console.log("start workout module");
        
        readWorkout(file);
        if (workoutObj.workout != null)
            workoutObj.workout.segments.forEach( function(segment) { 
                executeSegment(segment) 
            } );
    }

    WorkoutController.prototype.Execute = executeWorkout;
};

module.exports = WorkoutController;
