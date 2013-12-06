angular.module('app', [
        'ui.bootstrap'
    ]).
    factory(app.serviceFactory).
    directive(app.directive).
    controller(app.controller);
