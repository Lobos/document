(function () {
    'use strict';

    angular.module('app', [
            'ui.bootstrap'
        ]).
        config(function($locationProvider) {
            $locationProvider.html5Mode(true).hashPrefix('!');
        }).
        factory(app.serviceFactory).
        directive(app.directive).
        controller(app.controller);
})();
