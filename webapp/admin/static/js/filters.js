(function(){
    'use strict';

    app.filter.status = function () {
        return function (s) {
            return s ? '<i class="icon text-success icon-check"></icon>'
                : '<i class="icon text-danger icon-times"></icon>';
        };
    };
})();
