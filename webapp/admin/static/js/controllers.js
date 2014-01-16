(function () {
    'use strict';

    angular.queryString = function(url, data){
        var qs = function (obj, prefix) {
            var str = [];
            for (var p in obj) {
                var k = prefix ? prefix + "." + p : p,
                    v = obj[p];
                str.push(angular.isObject(v) ? qs(v, k) : (k) + "=" + encodeURIComponent(v));
            }
            return str.join("&");
        };
        var s = qs(data);
        if (s) url = url + "?" + s;
        return url;
    };

    /*
    即使用不到$location，也要在参数中传入，否则 href 不会 rewrite
     */
    app.controller.AppCtrl = function ($scope, $location, $loading) {
        $scope.currentPage = '';
        $scope.loading = $loading.get;

        $scope.afterPageLoad = function () {
            $loading.end();
        };
    };

    app.controller.MessageCtrl = function ($scope, $message) {
        $scope.informs = $message.get();
        $scope.close = function (index) {
            $message.close(index);
        };
    };

    app.controller.NavCtrl = function ($scope, $location) {
        $scope.node = {};
        $scope.highlight = $location.path().slice(1);
        $scope.active = function (url, isNode) {
            if (isNode)
                $scope.node[url] = !$scope.node[url];
            else
                $scope.highlight = url;
        };
    };

    app.controller.ListTableCtrl = function ($scope, $http, $attrs, $location, $modal, $message, $loading, $timeout) {
        $scope.url = $attrs.url;
        $scope.page = $location.search().page || $attrs.page || 1;
        $scope.size = $attrs.size || 30;
        $scope.data = [];
        $scope.total = 100;
        $scope.pageSize = 5;
        $scope.allSelected = false;
        $scope.order = {};
        $scope.filters = {};

        //init
        angular.forEach($location.search(), function (value, key) {
            //if (key == 'page') $scope.page = value;
            if (key == 'size') $scope.size = value;
            else if (key.indexOf('filters.') == 0)
                $scope.filters[key.replace('filters.', '')] = value;
            else if (key.indexOf('order.') == 0)
                $scope.order[key.replace('order.', '')] = value;
        });

        //selection
        $scope.getSelection = function () {
            var selection = [];
            angular.forEach($scope.data, function (item) {
                if (item.$isChecked)
                    selection.push(item._id);
            });
            return selection;
        };

        $scope.selectAll = function () {
            var s = $scope.allSelected = !$scope.allSelected;
            angular.forEach($scope.data, function (item) {
                item.$isChecked = s;
            });
        };

        $scope.setLocation = function () {
            var ss = {
                page: $scope.page
            };
            angular.forEach($scope.filters, function (value, key) {
                ss['filters.' + key] = value;
            });
            angular.forEach($scope.order, function (value, key) {
                ss['order.' + key] = value;
            });
            $location.search(ss);
        };

        $scope.$watch('page', $scope.setLocation);

        $scope.sort = function (key) {
            if ($scope.order.by == key && $scope.order.asc == -1)
                $scope.order.asc = 1;
            else
                $scope.order.asc = -1;
            $scope.order.by = key;
            $scope.setLocation();
        };

        //update
        $scope.update = function () {
            $loading.start();
            $scope.allSelected = false;
            var data = {
                page: $scope.page,
                size: $scope.size,
                filters: $scope.filters,
                order: $scope.order
            };
            $http.get(angular.queryString($scope.url, data)).success(function (json) {
                $loading.end();
                if (json.status == 1) {
                    $scope.total = json.total;
                    $scope.data = json.data;
                    angular.forEach($scope.data, function (item) {
                        item.$isChecked = false;
                    });
                }
            });
        };

        // remove
        var modal = function (txt, fn, args) {
            var _scope = $scope;
            $modal.open({
                templateUrl: "/static/templates/confirm.html",
                backdrop: true,
                windowClass: 'modal',
                controller: function ($scope, $modalInstance) {
                    $scope.content = txt;
                    $scope.submit = function () {
                        fn.apply($http, args).success(function (json) {
                            $loading.end();
                            _scope.update();
                            $message.inform(json.msg);
                        }).error(function () {
                            $message.inform('server error');
                        });
                        $modalInstance.dismiss('cancel');
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            });
        };

        $scope.multiRemove = function (url) {
            var selects = $scope.getSelection();
            var length = selects.length;

            if (length == 0) {
                $scope.noSelected = true;
                $timeout(function () { $scope.noSelected=false; }, 4000);
                return;
            }
            $scope.noSelected = false;

            modal('确定要删除这 ' + length + ' 个项目吗？', $http.post, [url, {ids: selects}]);
        };

        $scope.remove = function (id) {
            modal('确定要删除吗？', $http.delete, [$scope.url + id]);
        };
    };

    app.controller.EditCtrl = function ($scope, $window, $attrs, $http, $location, $message, $loading) {
        $scope.url = $attrs.url;
        $scope.hash = $location.hash();
        $scope.model = {};

        $scope.getEntry = function () {
            if (!$location.hash()) return;
            $http.get($scope.url + $location.hash()).success(function (json) {
                if (json.status) $scope.model = json.model;
            });
        };

        $scope.back = function () {
            $window.history.back();
        };

        $scope.submit = function () {
            if (!$scope.mainform.$valid) return;
            $loading.start();

            var hp = $scope.hash ? $http.put($scope.url+$scope.hash, $scope.model) : $http.post($scope.url, $scope.model);
            hp.success(function (json) {
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

