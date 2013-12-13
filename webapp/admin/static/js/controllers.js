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
            path = path.replace(/\./g, '/');
            $scope.currentPage = path;
            $scope.loading = true;
        });
    };

    app.controller.NavCtrl = function ($scope) {
        $scope.node = {};
        $scope.active = function (url, isNode) {
            if (isNode)
                $scope.node[url] = !$scope.node[url];
            else
                $scope.highlight = url;
        };
    };

    app.controller.TableCtrl = function ($scope, $http, $attrs, $location) {
        $scope.url = $attrs.url;
        $scope.page = $attrs.page || $location.search()['p'] || 1;
        $scope.size = $attrs.size || 30;
        $scope.data = [];
        $scope.total = 1;
        $scope.pageSize = 5;
        $scope.allSelected = false;

        //selection
        $scope.getSelection = function () {
            var selection = [];
            angular.forEach($scope.data, function (item) {
                if (item._isChecked)
                    selection.push(item._id);
            });
            return selection;
        };

        $scope.selectAll = function (e) {
            var s = e.target.checked;
            angular.forEach($scope.data, function (item) {
                item._isChecked = s;
            });
        };

        $scope.selectPage = function (page) {
            $scope.page = page;
            $scope.update();
            $location.search('p', page)
        };

        //update
        $scope.update = function () {
            $scope.allSelected = false;
            var data = {
                page: $scope.page,
                size: $scope.size
            };
            $http.post($scope.url, data).success(function (json) {
                if (json.status == 1) {
                    $scope.page = json.page;
                    $scope.total = json.total;
                    $scope.data = json.data;
                    angular.forEach($scope.data, function (item) {
                        item._isChecked = false;
                    });
                }
            });
        };

    };

})();
