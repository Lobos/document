angular.module('App', []);

function signController($scope, $http, $location) {
    $scope.user = {};
    $scope.url = "/";

    $scope.signIn = function() {
        if (!$scope.sign_form.$valid) return;
        $scope.sending = true;
        $scope.msg = '登录中...';
        $http.post('', $scope.user).success(function(json){
            $scope.sending = false;
            if(json.status == 0) {
                $scope.msg = json.msg;
            } else {
                window.location.href = $scope.url;
            }
        });
    };
}
