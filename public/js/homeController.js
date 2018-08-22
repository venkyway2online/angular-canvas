

anproject.controller('homeController', ['$scope', '$http', '$window', '$location',"$cookies", function ($scope, $http, $window, $location,$cookies) {

    if($cookies.get("token")!=undefined){
        $scope.logoutFunction = function () {
            $http({
                method: 'POST',
                url: '/logout',
                data: {"token": $cookies.get("token")},
                json: true
            }).then(
                function (httpResponseSuccess) {
                    $cookies.remove("token");
                    $window.location = "./"
                },
                function (httpResponseFail) {
                    console.log("Error page", httpResponseFail);
                });
        };
        $scope.canvasDownload = function () {
            $window.location = "home#!/canvasDownload"
        };

    }else {
        $window.location = "./"
    }
}]);