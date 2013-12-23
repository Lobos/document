(function () {
    'use strict';

    /*
    即使用不到$location，也要在参数中传入，否则 href 不会 rewrite
     */
    app.controller.AppCtrl = function ($scope, $location, $loading) {
        $scope.currentPage = '';
        $scope.loading = $loading.get;

        $scope.afterPageLoad = function () {
            $loading.end();
        };

        var getPath = function (url) {
            url = url.split('?');
            return url[0];
        };
        $scope.$watch(function () { return $location.url(); }, function (path) {
            if (path == '/') return;
            var p = getPath(path);
            if ($scope._lastPath == p) return;
            $scope._lastPath = p;
            path = path.replace(/\./g, '/');
            $scope.currentPage = path;
            $loading.start();
        });
    };

    app.controller.MessageCtrl = function ($scope, $message) {
        $scope.informs = $message.get();
        $scope.close = function (index) {
            $message.close(index);
        };
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

    app.controller.TableCtrl = function ($scope, $http, $attrs, $location, $modal, $message, $loading, $timeout) {
        $scope.url = $attrs.url;
        $scope.page = $attrs.page || 1;
        $scope.size = $attrs.size || 30;
        $scope.data = [];
        $scope.total = 1;
        $scope.pageSize = 5;
        $scope.allSelected = false;
        $scope.filters = {};

        //init
        angular.forEach($location.search(), function (value, key) {
            if (key == 'page') $scope.page = value;
            else if (key == 'size') $scope.size = value;
            else if (key.indexOf('filters.') == 0) {
                $scope.filters[key.replace('filters.', '')] = value;
            }
        });

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
            //$location.search('p', page)
        };

        //update
        $scope.update = function () {
            $loading.start();
            $scope.allSelected = false;
            var data = {
                page: $scope.page,
                size: $scope.size,
                filters: $scope.filters
            };
            $http.post($scope.url, data).success(function (json) {
                $loading.end();
                if (json.status == 1) {
                    $scope.page = json.page;
                    $scope.total = json.total;
                    $scope.data = json.data;
                    angular.forEach($scope.data, function (item) {
                        item._isChecked = false;
                    });
                }
            });
            var ss = {
                page: data.page,
                size: data.size
            };
            angular.forEach(data.filters, function (value, key) {
                ss['filters.' + key] = value;
            });
            $location.search(ss);
        };

        $scope.remove = function (url) {
            var selects = $scope.getSelection();
            var length = selects.length;

            if (length == 0) {
                $scope.noSelected = true;
                $timeout(function () { $scope.noSelected=false; }, 4000);
                return;
            }
            $scope.noSelected = false;

            var rm = function () {
                $loading.start();
                $http.post(url, {ids: selects}).success(function (json) {
                    $loading.end();
                    $scope.update();
                    $message.inform(json.msg);
                });
            };

            $modal.open({
                templateUrl: "/static/templates/confirm.html",
                backdrop: true,
                windowClass: 'modal',
                controller: function ($scope, $modalInstance) {
                    $scope.content = '确定要删除这 ' + length + ' 个项目吗？';
                    $scope.submit = function () {
                        rm();
                        $modalInstance.dismiss('cancel');
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            });
        };

    };

    app.controller.EditCtrl = function ($scope, $window, $attrs, $http, $location, $message, $loading) {
        $scope.$location = $location;
        $scope.model = {};

        $scope.getEntry = function (url) {
            if (!$location.hash()) return;
            $http.post(url).success(function (json) {
                if (json.status) $scope.model = json.model;
            });
        };

        $scope.back = function () {
            $window.history.back();
        };

        $scope.submit = function (url) {
            if (!$scope.form.$valid) return;
            $loading.start();

            $http.post(url, $scope.model).success(function (json) {
                $loading.end();
                if (json.status == 1) {
                    $message.inform(json.msg);
                    $scope.back();
                } else {
                    $message.inform(json.msg, 'danger');
                }
            });
        };
    };

})();

