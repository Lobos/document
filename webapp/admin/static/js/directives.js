(function(){
    'use strict';

    app.directive.match = ['$parse', function($parse) {
        return {
            require: 'ngModel',
            link: function(scope, elem, attrs, ctrl) {
                scope.$watch(function() {
                    return $parse(attrs.match)(scope) === ctrl.$modelValue;
                }, function(currentValue) {
                    ctrl.$setValidity('mismatch', currentValue);
                });
            }
        };
    }];

    app.directive.pageInclude = ['$http', '$location', '$templateCache', '$compile',
                       function ($http, $location, $templateCache, $compile) {
        return {
            restrict: 'ECA',
            priority: 400,
            transclude: 'element',
            controller: angular.noop,
            compile: function () {
                var refract = function (src) {
                    var index = src.indexOf('?');
                    if (index <= 0)
                        return src.replace(/\./g, '/');

                    var path = src.substring(0, index);

                    return path.replace(/\./g, '/') + src.slice(index);
                };

                return function ($scope, $element, $attr, ctrl, $transclude) {
                    $scope.$watch(function () { return $location.url(); }, function (src) {
                        if (src == '/') return;

                        src = refract(src);
                        $http.get(src, {cache: $templateCache}).success(function (response) {
                            var newScope = $scope.$new();
                            ctrl.template = response;

                            $element.html(ctrl.template);
                            //$compile($element.contents())(newScope);
                        });
                    });
                };
            }
        };
    }];
})();