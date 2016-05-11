
trainerApp.controller('mainCtrl', ['$scope', 'antService', 
    function ($scope, antService) {
        
        $scope.labels =["Eating", "Drinking", "Sleeping", "Designing", "Coding", "Cycling", "Running"];

        $scope.data = [
            [65, 59, 90, 81, 56, 55, 40],
            [28, 48, 40, 19, 96, 27, 100]
        ];        
        
        const BASIC_RESISTANCE = '48';
        const TARGET_POWER_RESISTANCE = '49';
        
        try {
            $scope.version = process.versions['electron'];
            antService.load($scope);
        }
        catch (e) {
            $scope.hello = e;
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
