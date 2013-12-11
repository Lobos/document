(function () {
    'use strict';

    /*
    即使用不到$location，也要在参数中传入，否则 href 不会 rewrite
     */
    app.controller.AppCtrl = function ($scope, $location) {
        $scope.currentPage = '';
        $scope.loading = false;

        $scope.afterPageLoad = function () {
            $scope.loading = false;
        };

        $scope.$watch(function () { return $location.path(); }, function (path) {
            if (path == '/') return;
            path = path.replace('.', '/');
            $scope.currentPage = path;
            $scope.loading = true;
        });
    };

    app.controller.NavCtrl = function ($scope) {
        $scope.node = '';
        $scope.active = function (url) {
            $scope.node = url;
        };
    };

    app.controller.TableCtrl = function ($scope, $http) {
        $scope.data = [];
        $scope.index = 1;
        $scope.size = 20;
        $scope.update = function () {
            $http.post($scope.url, {}).success(function (json) {
                if (json.status == 1)
                    $scope.data = json.data;
            });
        };
    };

})();
