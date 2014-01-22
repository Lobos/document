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

    app.directive.pageInclude = ['$http', '$location', '$templateCache', '$compile', '$global',
                       function ($http,   $location,   $templateCache,   $compile,   $global) {
        return {
            restrict: 'ECA',
            priority: 400,
            link: function (scope, element, attr, ctrl) {
                var refract = function (src) {
                    var index = src.indexOf('?');
                    if (index <= 0)
                        index = src.indexOf('#');
                    if (index > 0)
                        src = src.substring(0, index);
                    return src.replace(/\./g, '/');
                };

                var changeCounter = 0,
                    currentScope = null;
                var clearUp = function () {
                    if (currentScope) {
                        currentScope.$destroy();
                        currentScope = null;
                    }
                };

                scope.$watch(function () { return $location.url(); }, function (src) {
                    if (src == '/') return;
                    src = refract(src);
                    $global.$loading.start();

                    var thisChangeId = ++changeCounter;
                    $http.get(src, {cache: $templateCache}).success(function (response) {
                        $global.$loading.end();
                        if (thisChangeId !== changeCounter) return;
                        var newScope = scope.$new();

                        element.html(response);
                        $compile(element.contents())(newScope);

                        clearUp();
                        currentScope = newScope;
                    }).error(function () {
                        $global.$loading.end();
                        clearUp();
                        $global.$message.set('页面获取失败');
                    });
                });
            }
        };
    }];

})();