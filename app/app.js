'use strict'
const AntService = require('../ant/ant_service.js');
var trainerApp = angular.module('trainerApp', []);

trainerApp.factory('antService', [ 
    function() {
        return new AntService();
}]);
