(function () {
    'use strict';

    app.serviceFactory.$message = function ($timeout) {
        var informs = [];
        var timer;

        return {
            get: function () {
                return informs;
            },
            inform: function (message, type, dismiss) {
                if (!angular.isDefined(type)) {
                    type = 'warning';
                    dismiss = 6;
                } else if (angular.isNumber(type)) {
                    dismiss = type;
                    type = 'warning';
                }
                if (!angular.isDefined(dismiss))
                    dismiss = 6;
                informs[0] = {
                    alertClass: 'alert-' + type,
                    message: message,
                    dismiss: dismiss
                };

                if (dismiss != 0)
                    timer = $timeout(function () {
                        informs.splice(0, 1);
                    }, dismiss * 1000);
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

    app.serviceFactory.$loading = function ($timeout) {
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