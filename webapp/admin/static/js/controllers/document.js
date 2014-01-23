(function () {
    'use strict';

    app.controller.DocumentCtrl = function ($scope, $attrs, $http, $location, $global) {
        $scope.src = $attrs.src;

        $scope.nodeAdd = function (node) {
            alert(node.text);
        };
    };
})();
