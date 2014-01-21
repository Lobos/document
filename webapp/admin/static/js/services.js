(function () {
    'use strict';

    app.serviceFactory.$message = function ($timeout) {
        var informs = [];
        var timer;
        var defOptions = {
            dismiss: 6,
            type: 'warning'
        };

        return {
            get: function () {
                return informs;
            },
            inform: function (message, options) {
                options = angular.extend({}, defOptions, options || {});
                informs[0] = angular.extend({
                    message: message
                }, options);

                if (options.dismiss != 0)
                    timer = $timeout(function () {
                        informs.splice(0, 1);
                    }, options.dismiss * 1000);
                else
                    $timeout.cancel(timer);
            },
            close: function (index) {
                informs.splice(index, 1);
            },
            clear: function () {
                informs.splice(0, 1);
            }
        };
    };

    app.serviceFactory.$loading = function () {
        var loading = 0;
        return {
            get: function () {
                return loading;
            },
            start: function () {
                loading++;
            },
            end: function () {
                loading--;
            }
        };
    };
})();