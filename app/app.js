'use strict'
const AntService = require('../ant/ant_service.js');
var trainerApp = angular.module('trainerApp', ['chart.js']);

trainerApp.config(function (ChartJsProvider, $provide) {
    // Configure all charts
    ChartJsProvider.setOptions({
        colours: ['#97BBCD', '#DCDCDC', '#F7464A'], 
        responsive: true
    });
    /* Configure all doughnut charts */
    ChartJsProvider.setOptions('Doughnut', {
        animateScale: true
    }); 

    // Adding a "safeApply()" function as we were getting errors calling apply when also
    // trying to invoke things like setIrtSettings.  This is injected into the module
    // so that anyone can call scope.safeApply().
    // 
    // Source: https://coderwall.com/p/ngisma/safe-apply-in-angular-js
    $provide.decorator('$rootScope', [
        '$delegate', function($delegate) {
            $delegate.safeApply = function(fn) {
            var phase = $delegate.$$phase;
            if (phase === "$apply" || phase === "$digest") {
                if (fn && typeof fn === 'function') {
                fn();
                }
            } else {
                $delegate.$apply(fn);
            }
            };
            return $delegate;
        }
    ]);
});

trainerApp.factory('antService', [ 
    function() {
        return new AntService();
}]);
