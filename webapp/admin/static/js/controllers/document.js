(function () {
    'use strict';

    app.controller.DocumentCtrl = function ($scope, $attrs, $http, $location, $global) {
        $scope.src = $attrs.src;

        $scope.nodeAdd = function (node) {
            $location.url($scope.src + '?id=' + node.id);
        };

        $scope.nodeEdit = function (node) {
            $location.url($scope.src + '#' + node.id);
        };
    };


    app.controller.DocumentEditCtrl = function ($scope, $attrs, $location, $http, $window) {
        $scope.url = $attrs.url;
        $scope.model = {};

        if ($location.search().id)
            $scope.model.pid = $location.search().id;

        $scope.back = function () {
            $window.history.back();
        };

        $scope.getEntity = function () {
            console.log($location.hash());
            if (!$location.hash()) return;

            $http.get($scope.url + $location.hash()).success(function (json) {});
        };

        $scope.submit = function () {};
    };
})();
