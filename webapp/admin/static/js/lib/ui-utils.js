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
        $scope.currentNode = null;

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

        $scope.setCurrent = function (node) {
            $scope.currentNode = node;
            if ($scope.nodeClick)
                $scope.nodeClick({node:node});
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
                    if (node.children.length > 0) setNode(node.children);
                    if (node.fold == undefined) {
                        node.fold = !!$attrs.fold || $scope.lazy;
                        if (!$scope.lazy && node.children.length == 0) {
                            node.fold = undefined;
                        }
                    }
                });
            },
            getNode = function (id) {
                return nodeDict[id];
            };

        var setData = function (id, data) {
            setNode(data);
            if (!id) {
                $scope.data = data;
                return;
            }

            getNode(id).children = data;
        };

        if ($attrs.root) {
            setData(null, [{
                id: $attrs.root,
                text: 'root',
                fold: false,
                loaded: true,
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

        var refresh = function (options) {
            if (options.data)
                setData(options.id, options.data);
            else if (options.id)
                $scope.update(options.id);
        };

        $scope.add = function (node) {
            $scope.nodeAdd({
                node: node,
                callback: refresh
            });
        };

        $scope.edit = function (node) {
            $scope.nodeEdit({
                node: node,
                callback: refresh
            });
        };

        $scope.toggle = function (node) {
            node.fold = !node.fold;
            if ($scope.lazy && !node.loaded && !node.fold)
                $scope.update(node.id);
            node.loaded = true;
        };
    }])

    .directive('treeview', function () {
        return {
            restrict: 'EA',
            controller: 'TreeviewController',
            templateUrl: 'template/utils/tree_view',
            replace: true,
            scope: {
                model: '=',
                nodeClick: '&',
                nodeAdd: '&',
                nodeEdit: '&'
            },
            link: function(scope, element, attrs, ctrl) {
            }
        };
    });


angular.module("template/utils/tree_view", []).run(["$templateCache", function($templateCache) {
    $templateCache.put("template/utils/tree_view",
        '<ul class="treeview list-unstyled"><li ng-repeat="node in data" ng-include="\'template/utils/tree_render\'"></li></ul>');
}]);

angular.module("template/utils/tree_render", []).run(["$templateCache", function($templateCache) {
    $templateCache.put("template/utils/tree_render",
        '<label ng-class="{\'active\':node==currentNode}">' +
            '<i ng-class="{\'icon\':true, \'icon-minus-square\':node.fold===false, \'icon-plus-square\':node.fold===true}" ng-click="toggle(node)"></i>' +
            '<i ng-show="checkable" ng-class="{\'icon\':true, \'icon-square-o\':node.status==0, \'icon-check-square-o\':node.status==1, \'icon-check-square\':node.status==2}" ng-click="select(node)"></i>' +
            '<span ng-click="setCurrent(node)">{{node.text}}</span>' +
            '<a ng-click="add(node)" class="text-success" ng-show="node==currentNode"><i class="icon icon-plus"></i></a>' +
            '<a ng-click="edit(node)" class="text-info" ng-show="node==currentNode"><i class="icon icon-edit"></i></a>' +
        '</label>' +
        '<ul class="list-unstyled" ng-hide="node.fold">' +
            '<li ng-repeat="node in node.children" ng-include="\'template/utils/tree_render\'"></li>' +
        '</ul>');
}]);