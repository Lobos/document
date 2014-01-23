(function () {
    'use strict';

    var SERVER_ERROR = '数据请求出错';
    var hasOwnProperty = Object.prototype.hasOwnProperty;

    var isEmpty = function (obj) {
        if (obj == null) return true;
        if (obj.length > 0)    return false;
        if (obj.length === 0)  return true;
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) return false;
        }
        return true;
    };

    angular.queryString = function(url, data){
        var qs = function (obj, prefix) {
            var str = [];
            for (var p in obj) {
                var k = prefix ? prefix + "." + p : p,
                    v = obj[p];
                var querystr = angular.isObject(v) ? qs(v, k) : (k) + "=" + encodeURIComponent(v);
                if (querystr)
                    str.push(querystr);
            }
            return str.join("&");
        };
        var s = qs(data);
        if (s) url += "?" + s;
        return url;
    };

    app.controller.AppCtrl = function ($scope, $location, $global) {
        $scope.currentPage = '';
        $scope.loading = $global.$loading.get;

        $scope.afterPageLoad = function () {
            $global.$loading.end();
        };
    };

    app.controller.MessageCtrl = function ($scope, $global, $attrs, $http) {
        $scope.informs = $global.$message.get();
        $scope.close = function (index) {
            $global.$message.close(index);
        };

        $scope.undo = function (id) {
            $http.put($attrs.src + id).success(function (json) {
                $global.$message.set(json.msg);
                if (json.status == 1)
                    $global.$reload.load();
            }).error(function () {
                $global.$message.set(SERVER_ERROR);
            });
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

    app.controller.ListTableCtrl = function ($scope, $http, $attrs, $location, $modal, $global, $timeout) {
        $scope.url = $attrs.url;
        $scope.page = $location.search().page || $attrs.page || 1;
        $scope.size = $attrs.size || 30;
        $scope.data = [];
        $scope.total = 0;
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
            $global.$loading.start();
            $scope.allSelected = false;
            var data = {
                page: $scope.page,
                size: $scope.size,
                filters: $scope.filters,
                order: $scope.order
            };
            $http.get(angular.queryString($scope.url, data)).success(function (json) {
                $global.$loading.end();
                if (json.status == 1) {
                    $scope.total = json.total;
                    $scope.data = json.data;
                    angular.forEach($scope.data, function (item) {
                        item.$isChecked = false;
                    });
                }
            }).error(function () {
                $global.$loading.end();
                $global.$message.set(SERVER_ERROR);
            });
        };
        $global.$reload.set($scope.update);

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
                            $global.$loading.end();
                            _scope.update();
                            $global.$message.set(json.msg, {
                                dismiss: 20,
                                undo: json.undo
                            });
                        }).error(function () {
                            $global.$message.set(SERVER_ERROR);
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

    app.controller.EditCtrl = function ($scope, $window, $attrs, $http, $location, $global) {
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
            if (!$scope.form.$valid) return;
            $global.$loading.start();

            var hp = $scope.hash ? $http.put($scope.url+$scope.hash, $scope.model) : $http.post($scope.url, $scope.model);
            hp.success(function (json) {
                $global.$loading.end();
                if (json.status == 1) {
                    $global.$message.set(json.msg);
                    $scope.back();
                } else {
                    $global.$message.set(json.msg, {
                        type: 'danger'
                    });
                }
            });
        };

    };


    app.controller.DocumentCtrl = function ($scope, $attrs, $http, $location, $global) {
        $scope.url = $attrs.url;
    };

})();

