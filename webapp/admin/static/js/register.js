(function () {
    'use strict';

    angular.module('app', [
            'ui.bootstrap'
        ]).
        config(function($locationProvider, $compileProvider) {
            $locationProvider.html5Mode(true).hashPrefix('!');
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
        }).
        factory(app.serviceFactory).
        directive(app.directive).
        controller(app.controller);
})();
