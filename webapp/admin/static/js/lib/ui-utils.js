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
        $scope.lazy = !!$attrs.lazy;
        $scope.checkable = !!$attrs.checkable;

        var setStatus = function (node, status) {
            node.status = status;
            angular.forEach(node.children, function (sub) {
                setStatus(sub, status);
            });
        };

        var setParentsStatus = function (nodes) {
            var _set = function (node) {
                var list = [];
                if (node.children.length == 0) {
                    if (list.indexOf(node.status) < 0)
                        list.push(node.status);
                } else {
                    angular.forEach(node.children, function (sub) {
                        angular.forEach(_set(sub), function (s) {
                            if (list.indexOf(s) < 0)
                                list.push(s);
                        });
                    });
                    if (list.length == 1)
                        node.status = list[0];
                    else if (list.length == 2)
                        node.status = 1;
                }
                return list;
            };
            angular.forEach(nodes, function (node) {
                _set(node);
            });
        };

        $scope.select = function (node) {
            var status = node.status < 2 ? 2 : 0;
            setStatus(node, status);
            setParentsStatus($scope.data);
            $scope.model = $scope.getValues();
        };

        $scope.setValue = function (slist) {
            if (angular.isString(slist))
                slist = slist.split(',');
            var _set = function (nodes) {
                angular.forEach(nodes, function (node) {
                    if (node.children.length == 0) {
                        if (slist.indexOf(node.id) >= 0)
                            node.status = 2;
                        else
                            node.status = 0;
                    } else {
                        _set(node.children);
                    }
                });
            };
            _set($scope.data);
        };

        $scope.getValues = function (status) {
            status = status || 1;
            var values = [];
            var _set = function (nodes) {
                angular.forEach(nodes, function (node) {
                    if (node.status >= status)
                        values.push(node.id);
                    if (node.children)
                        _set(node.children);
                });
            };
            _set($scope.data);
            return values;
        };


        var nodeDict = {},
            setNode = function (data) {
                angular.forEach(data, function (node) {
                    nodeDict[node.id] = node;
                    if (node.children) setNode(node.children);
                });
            },
            getNode = function (id) {
                return nodeDict[id];
            };

        var setData = function (id, data) {
            if (!id) {
                $scope.data = data;
                return;
            }

            getNode(id).children = data;
            alert($scope.checkable);
        };

        if ($attrs.root) {
            setData(null, [{
                id: $attrs.root,
                text: 'root',
                children: []
            }]);
        }

        $scope.update = function (id) {
            $http.get($attrs.src + id).success(function (json) {
                //$scope.data = json.data;
                setData(id, json.data);
                if ($scope.checkable) {
                    $scope.setValue($scope.model || []);
                    setParentsStatus($scope.data);
                }
            }).error(function () {
            });
        };

        $scope.update($attrs.root || '');

        if ($scope.checkable)
            $scope.$watch('model', function () {
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
                model: '='
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
        '<i ng-show="checkable" ng-class="{\'icon\':true, \'icon-square-o\':t.status==0, \'icon-check-square-o\':t.status==1, \'icon-check-square\':t.status==2}" ng-click="select(t)"></i>' +
        '{{t.text}}' +
        '<ul class="list-unstyled" ng-hide="t.fold">' +
            '<li ng-repeat="t in t.children" ng-include="\'template/utils/tree_render\'"></li>' +
        '</ul>');
}]);