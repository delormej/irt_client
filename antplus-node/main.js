const readline = require('readline')
var Ant = require('ant-plus');
var stick = new Ant.GarminStick3;
var sensor = new Ant.HeartRateSensor(stick);

sensor.on('hbData', function (data) {
    console.log(data.DeviceID, data.ComputedHeartRate);
    // var timestamp = Date.now();
    // this.emit('heartRate', data.ComputedHeartRate, timestamp);
});

stick.on('startup', function () {
    sensor.attach(0, 0);
    console.log('started.');
});

// stick.reset();

if (stick.is_present())
{
    console.log("it's there");
}

var val = stick.open();

if (val) {
    console.log("open");
}
else {
    console.log("not open.");
}
// stick.reset();

// var val = stick.openAsync(err => {
//     console.log("err" + err);
// });

// if (!val) {
//     console.log('Stick not found!');
// }
// else {
//     while(true);
// }

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('Connecting to ant ', (answer) => {
    // TODO: Log the answer in a database
    console.log(`Thank you for your valuable feedback: ${answer}`);
    stick.close();
    rl.close();
  });