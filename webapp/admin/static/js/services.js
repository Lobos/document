(function () {
    'use strict';

    app.serviceFactory.messages = function ($timeout) {
        var informs = [];

        var removeInform = function (val) {
            var index = -1;
            for (var i = 0; i < informs.length; i++) {
               if (informs[i] === val)
                index = i;
            }
            if (index >= -1)
                informs.splice(index, 1);
        };

        return {
            get: function () {
                return informs;
            },
            inform: function (message, dismiss, type) {
                if (!angular.isDefined(dismiss)) {
                    dismiss = 0;
                    type = 'warning';
                } else if (angular.isString(dismiss)) {
                    type = dismiss;
                    dismiss = 0;
                }
                type = type || 'warning';
                var obj = {
                    alertClass: 'alert-' + type,
                    message: message,
                    dismiss: dismiss
                };
                informs.push(obj);

                if (dismiss > 0)
                    $timeout(function (){ removeInform(obj); }, dismiss * 1000);
            },
            close: function (index) {
                informs.splice(index, 1);
            },
            clear: function () {
                informs = [];
            }
        };
    };
})();