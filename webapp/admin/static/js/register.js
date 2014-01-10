(function () {
    'use strict';

    angular.module('app', [
            'ngSanitize', 'ui.bootstrap'
        ]).
        config(function($locationProvider, $compileProvider) {
            $locationProvider.html5Mode(true).hashPrefix('!');
        }).
        factory(app.serviceFactory).
        directive(app.directive).
        controller(app.controller);

    angular.forEach(app.filter, function (filter, filterName) {
        angular.module('app').filter(filterName, filter);
    });

})();
