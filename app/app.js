'use strict'
const AntService = require('../ant/ant_service.js');
var trainerApp = angular.module('trainerApp', ['chart.js']);

trainerApp.config(function (ChartJsProvider) {
    // Configure all charts
    ChartJsProvider.setOptions({
        colours: ['#97BBCD', '#DCDCDC', '#F7464A'], 
        responsive: true
    });
    /* Configure all doughnut charts */
    ChartJsProvider.setOptions('Doughnut', {
        animateScale: true
    }); 
});

trainerApp.factory('antService', [ 
    function() {
        return new AntService();
}]);
