(function () {
    app.controller.signCtrl = function ($scope, $http) {
        $scope.user = {};
        $scope.url = "/";

        $scope.signIn = function(postUrl) {
            if (!$scope.sign_form.$valid) return;
            $scope.sending = true;
            $scope.msg = '登录中...';
            postUrl = postUrl || '';
            $http.post(postUrl, $scope.user).success(function(json){
                $scope.sending = false;
                if(json.status == 0) {
                    $scope.msg = json.msg;
                } else {
                    window.location.href = $scope.url;
                }
            });
        };
    };

})();
