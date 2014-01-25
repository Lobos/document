(function () {
    'use strict';

    app.controller.DocumentCtrl = function ($scope, $attrs, $http, $location, $global) {
        $scope.src = $attrs.src;

        $scope.nodeAdd = function (node) {
            var p = node.id ? '?p=' + node.id : '';
            $location.url($scope.src + p);
        };

        $scope.nodeEdit = function (node) {
            $location.url($scope.src + '#' + node.id);
        };
    };


    app.controller.DocumentEditCtrl = function ($scope, $attrs, $location, $http, $window, $global) {
        $scope.src = $attrs.src;
        $scope.hash = $location.hash();
        $scope.model = {
            properties: [],
            methods: []
        };

        if ($location.search().p)
            $scope.model.pid = $location.search().p;

        $scope.back = function () {
            $window.history.back();
        };

        $scope.getEntity = function () {
            if (!$location.hash()) return;

            $http.get($scope.src + $scope.hash).success(function (json) {
                if (json.status == 1)
                    $scope.model = json.model;
                else
                    $global.$message.set(json.msg);
            });
        };

        $scope.submit = function () {
            if (!$scope.form.$valid) return;
            $global.$loading.start();

            var hp = $scope.hash ? $http.put($scope.src+$scope.hash, $scope.model) : $http.post($scope.src, $scope.model);
            hp.success(function (json) {
                $global.$loading.end();
                if (json.status == 1) {
                    $global.$message.set(json.msg);
                    if ($scope.hash != json.id) {
                        $scope.hash = json.id;
                    }
                    //$scope.back();
                } else {
                    $global.$message.set(json.msg, {
                        type: 'danger'
                    });
                }
            }).error(function () {
                $global.$loading.end();
                $global.$message.set('数据处理错误');
            });
        };

        $scope.addProperty = function () {
            $scope.model.properties.push({});
        };

        $scope.addMethod = function () {
            $scope.model.methods.push({
                args: [{}]
            });
        };

    };
})();
