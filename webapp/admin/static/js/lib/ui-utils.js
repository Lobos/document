/**
 * user: lobos841@gmail.com
 * date: 14-1-20 上午9:16
 * license: MIT-style
 */

angular.module("ui.utils", ["ui.utils.tpls", "ui.utils.treeview"]);
angular.module("ui.utils.tpls", ["template/utils/tree_view", "template/utils/tree_render"]);


angular.module('ui.utils.treeview', [])

    .controller('TreeviewController', ['$scope', '$attrs', '$http', function ($scope, $attrs, $http) {
        $scope.data = [];

        var setStatus = function (item, status) {
            item.status = status;
            angular.forEach(item.children, function (sub) {
                setStatus(sub, status);
            });
        };

        var setParentsStatus = function (items) {
            var _set = function (item) {
                var list = [];
                if (item.children.length == 0) {
                    if (list.indexOf(item.status) < 0)
                        list.push(item.status);
                } else {
                    angular.forEach(item.children, function (sub) {
                        angular.forEach(_set(sub), function (s) {
                            if (list.indexOf(s) < 0)
                                list.push(s);
                        });
                    });
                    if (list.length == 1)
                        item.status = list[0];
                    else if (list.length == 2)
                        item.status = 1;
                }
                return list;
            };
            angular.forEach(items, function (item) {
                _set(item);
            });
        };

        $scope.select = function (item) {
            var status = item.status < 2 ? 2 : 0;
            setStatus(item, status);
            setParentsStatus($scope.data);
            $scope.model = $scope.getValues();
        };

        $scope.setValue = function (slist) {
            if (angular.isString(slist))
                slist = slist.split(',');
            var _set = function (items) {
                angular.forEach(items, function (item) {
                    if (item.children.length == 0) {
                        if (slist.indexOf(item._id) >= 0)
                            item.status = 2;
                        else
                            item.status = 0;
                    } else {
                        _set(item.children);
                    }
                });
            };
            _set($scope.data);
        };

        $scope.getValues = function (status) {
            status = status || 1;
            var values = [];
            var _set = function (items) {
                angular.forEach(items, function (item) {
                    if (item.status >= status)
                        values.push(item._id);
                    if (item.children)
                        _set(item.children);
                });
            };
            _set($scope.data);
            return values;
        };

        $http.get($attrs.src).success(function (json) {
            $scope.data = json.data;
            $scope.setValue($scope.model || []);
            setParentsStatus($scope.data);
        });

        $scope.$watch('model', function () {
            if ($scope.model)
                $scope.setValue($scope.model);
        });
    }])

    .directive('treeview', function () {
        return {
            restrict: 'EA',
            controller: 'TreeviewController',
            templateUrl: 'template/utils/tree_view',
            replace: true,
            scope: {
                model: '=',
                onSelect: '&'
            },
            link: function(scope, element, attrs, ctrl) {
            }
        };
    });


angular.module("template/utils/tree_view", []).run(["$templateCache", function($templateCache) {
    $templateCache.put("template/utils/tree_view",
        '<ul class="treeview list-unstyled"><li ng-repeat="t in data" ng-include="\'template/utils/tree_render\'"></li></ul>');
}]);

angular.module("template/utils/tree_render", []).run(["$templateCache", function($templateCache) {
    $templateCache.put("template/utils/tree_render",
        '<i ng-class="{\'icon\':true, \'icon-minus-circle\':!t.fold&&t.type==\'folder\', \'icon-plus-circle\':t.fold&&t.type==\'folder\'}" ng-click="t.fold=!t.fold"></i>' +
        '<i ng-class="{\'icon\':true, \'icon-square-o\':t.status==0, \'icon-check-square-o\':t.status==1, \'icon-check-square\':t.status==2}" ng-click="select(t)"></i>' +
        '{{t.text}}' +
        '<ul class="list-unstyled" ng-hide="t.fold">' +
            '<li ng-repeat="t in t.children" ng-include="\'template/utils/tree_render\'"></li>' +
        '</ul>');
}]);