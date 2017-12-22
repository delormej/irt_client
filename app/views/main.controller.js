
trainerApp.controller('mainCtrl', ['$scope', 'antService',
    function ($scope, antService) {

        // Required for file open dialog.
        const {dialog} = require('electron').remote

        //$scope.labels = ["Servo Off", "Servo Position", "Remaining Servo Spectrum"];
        //$scope.data = [10, 10, 80];
        $scope.servoChartLabels = ["On", "Off"];
        $scope.servoChartData = [0, 1];
        $scope.trainerPowerChartEvents = [{ x: 0, y: 1 }, { x: 1, y: 2 }];

        $scope.availablePowerMeters = [];
        $scope.availableFeC = [];

        // Channel status buttons.
        $scope.lblTrainerButton = "Search for Trainer";
        $scope.lblPowerMeterButton = "Search for Power Meter";
        $scope.lblBackgroundScanningButton = "Search for Devices";

        $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
        $scope.series = ['Series A', 'Series B'];
        $scope.data = [
            [65, 59, 80, 81, 56, 55, 40],
            [28, 48, 40, 19, 86, 27, 90]
        ];
        $scope.onClick = function(points, evt) {
            $scope.data[0].push(100);
            $scope.data[1].push(70);
            console.log(points, evt);
        };

        const BASIC_RESISTANCE = '48';
        const TARGET_POWER_RESISTANCE = '49';
        const SET_SERVO_POSITION = '50';

        try {
            $scope.version = process.versions['electron'];
            antService.load($scope);
        }
        catch (e) {
            console.error('There was an error loading ANT module.', e);
            $scope.version = e.message;
            //$window.close();
        }

        $scope.resistanceOptions = [
            { id: BASIC_RESISTANCE, name: 'Basic' },
            { id: TARGET_POWER_RESISTANCE, name: 'Target' },
            { id: SET_SERVO_POSITION, name: 'Position' }
        ];
        $scope.resistanceSelect = BASIC_RESISTANCE;

        //$scope.fooEvents = [{ x: 1, y: 4 }, { x: 2, y: 6 }, { x: 3, y: 4 }, { x: 4, y: 10 }];

        // Configure time-series chart.
        //var timeSeriesContext = document.getElementById("timeSeriesChart").getContext('2d');
        //var timeSeriesChart = new Chart(timeSeriesContext, {
        //    type: 'scatter',
        //    data: {
        //        datasets: [{
        //            label: "Trainer Power",
        //            data: $scope.trainerPowerChartEvents
        //        }]
        //    },
        //    options: {
        //        scales: {
        //            xAxes: [{
        //                type: 'linear',
        //                position: 'bottom'
        //            }]
        //        }
        //    }
        //}); 

        $scope.setResistance = function () {

            var mode = $scope.resistanceSelect;
            var level = parseInt($scope.txtResistanceLevel);

            if (isNaN(level)) {
                console.log("Error, must set a valid level.");
                return;
            }

            console.log('set', mode, level);

            switch (mode) {
                case BASIC_RESISTANCE:
                    antService.setBasicResistance(level);
                    break;
                case TARGET_POWER_RESISTANCE:
                    antService.setTargetPower(level);
                    break;
                case SET_SERVO_POSITION:
                    antService.setServoPosition(level);
                default:
                    break;
            }
        }

        $scope.enableDFU = function () {
            antService.setDfuMode();
        }
        
        $scope.blinkLed = function() {
            antService.blinkLed();
        }

        $scope.searchForPowerMeters = function() {
            antService.startSearchForPowerMetersOnFecDevice();
        }

        $scope.toggleBackgroundScanning = function() {
            antService.toggleBackgroundScanning();
        }

        $scope.getSettings = function () { antService.getSettings(); };

        $scope.setSettings = function () {
            console.log('main.controller::setSettings');
            antService.setSettings();
        };

        $scope.setPowerMeter = function() {
            console.log('main.controller::setPowerMeter');
            antService.setAdjustPowerMeter();
        }

        $scope.openLogFile = function() {
            // hardcoded for the moment.
            //var path = "c:\\users\\jason\\OneDrive\\Rides\\Device0.txt";
            //"C:\\Users\\jason\\OneDrive\\Rides\\2017-07-21-device0.txt";
                    
            var path = dialog.showOpenDialog({properties: ["openFile"]});
            antService.openLogFile(path[0]);
        }

        $scope.setTrainerChannel = function() {
            antService.searchForFECById($scope.trainerDeviceId);
        }

        $scope.setPowerMeterChannel = function() {
            antService.searchForBikePowerById($scope.powerMeterDeviceId);
        }

        $scope.$watch('powerAdjustEnabled', function() {
            $scope.noticeMessage = "Power Adjuster changed to: " + $scope.powerAdjustEnabled;
            console.log('Power Adjust Enabled changed: ', $scope.powerAdjustEnabled);
            setTimeout(function() {
                $scope.noticeMessage = "";
            }, 3000); // display for 3 seconds.
        });
    }]);
