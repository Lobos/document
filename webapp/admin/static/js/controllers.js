(function () {
    'use strict';

    /*
    即使用不到$location，也要在参数中传入，否则 href 不会 rewrite
     */
    app.controller.AppCtrl = function ($scope, $location) {
        $scope.currentPage = '';
        $scope.loading = 0;

        $scope.$watch(function () { return $location.path(); }, function (path) {
            if (path == '/') return;
            path = path.replace('.', '/');
            $scope.currentPage = path;
        });
    };

    app.controller.NavCtrl = function ($scope) {
        $scope.node = '';
        $scope.active = function (url) {
            $scope.node = url;
        };
    };

})();
