(function () {
    'use strict';

    angular.module('app.controllers', []).

    controller('signCtrl', function ($scope, $http) {
        $scope.user = {};
        $scope.url = "/";

        $scope.signIn = function(postUrl) {
            if (!$scope.sign_form.$valid) return;
            $scope.sending = true;
            $scope.msg = '登录中...';
            postUrl = postUrl || '';
            $http.post(postUrl, $scope.user).success(function(json){
                $scope.sending = false;
                if(json.status == 0) {
                    $scope.msg = json.msg;
                } else {
                    window.location.href = $scope.url;
                }
            });
        };
    }).

    controller('menuCtrl', function($scope, $http, renderPartial) {
        $scope.node = '';
        $scope.active = function (url) {
            $scope.node = url;
        };
        $scope.render = function (url) {
            renderPartial.url = url;
        };
    }).

    controller('mainCtrl', function ($scope, renderPartial) {
        $scope.render = renderPartial;
        $scope.url = '123';
        $scope.$watch('renderPartial', function() {
            $scope.url = $scope.render.url;
        });
    });

})();
