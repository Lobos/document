(function () {
    'use strict';

    app.serviceFactory.$global = function ($timeout) {
        var stacks = {};
        var obj = {
            store: function (key, data) {
                stacks[key] = data;
            },
            retrieve: function (key, def) {
                return stacks[key] || def;
            }
        };

        // $reload ===========================================
        var reload = null;
        obj.$reload = {
            load: function () {
                if (reload) reload();
                else window.location.reload();
            },
            set: function (fn) {
                reload = fn;
            }
        };


        // $loading ==========================================
        var loadingStatus = 0;
        obj.$loading = {
            get: function () {
                return loadingStatus;
            },
            start: function () {
                loadingStatus++;
            },
            end: function () {
                loadingStatus--;
            }
        };

        // $message ===========================================
        var informs = [];
        var timer;
        var defOptions = {
            dismiss: 6,
            type: 'warning'
        };
        obj.$message = {
            get: function () {
                return informs;
            },
            set: function (message, options) {
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


        return obj;
    };
})();
