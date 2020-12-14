const stepController = require("./stepController.js");

//import stepController from 'stepController.js';

const stepControllerTest = function() { 

    steps = [
        { duration: 8 },
        { duration: 12 },
        { duration: 2 },
        { duration: 1 }
    ];

    function onStep(step) {
        if (step == null)
            console.log("Done!");
        else
            console.log('got: ' + step.duration);
    }

    function test() {
        var sc = new stepController(steps, onStep);
        sc.start();
    }

    stepControllerTest.prototype.test = test;
};

module.exports = stepControllerTest;

test = new stepControllerTest();
test.test();
setTimeout(function() { console.log("timeout")}, 100000);