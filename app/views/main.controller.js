
trainerApp.controller('mainCtrl', ['$scope', 'antService', 
    function ($scope, antService) {
        
        //$scope.labels = ["Servo Off", "Servo Position", "Remaining Servo Spectrum"];
        //$scope.data = [10, 10, 80];
        $scope.servoChartLabels = ["On", "Off"];
        $scope.servoChartData = [0, 1];
        
        const BASIC_RESISTANCE = '48';
        const TARGET_POWER_RESISTANCE = '49';
        
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
            { id: TARGET_POWER_RESISTANCE, name: 'Target' }
        ];
        $scope.resistanceSelect = BASIC_RESISTANCE;
        
        $scope.setResistance = function() {
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
                default:
                    break; 
            }
        }
        
        $scope.getSettings = function() { antService.getSettings(); };
        
        $scope.setSettings = function() { 
            console.log('main.controller::setSettings');
            antService.setSettings();
        };
}]);
