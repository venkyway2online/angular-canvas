
anproject.controller('loginController', ['$scope', '$http', '$window', '$location',"$cookies",
    function ($scope, $http, $window, $location,$cookies) {

        $scope.registerFunction = function () {
            $scope.input_flag = false;
            $scope.pw_flag = false;
                if ($scope.password1 === $scope.password2) {
                    $http({
                        method: 'POST',
                        url: '/RegistrationPage',
                        data: {"username": $scope.username, "password": $scope.password1}
                    }).then(
                        function (httpResponseSuccess) {
                            if (httpResponseSuccess.data.status === 1) {
                                alert("successfully registered");
                                $window.location = "./"
                            }
                            else if(httpResponseSuccess.data.status === 2) {
                                alert("registration failed");
                                $window.location.href = "/register.html"
                            }
                            else{
                                alert("already registered");
                                $window.location = "./"
                            }
                        },
                        function (httpResponseFail) {
                            console.log("Error page", httpResponseFail);
                        });
                }
                else {
                    $scope.pw_flag = true;
                    $scope.pw_msg = "passwords not match";
                }

        };

        $scope.loginFunction = function () {
            $http({
                method: 'POST',
                url: '/LoginPage',
                data: {"password": $scope.password3, "username": $scope.username1},
                json: true
            }).then(
                function (httpResponseSuccess) {
                    if (httpResponseSuccess.data.status === 1) {
                        $cookies.put("token",httpResponseSuccess.data.login_key);
                        $window.location = "/home#!/canvasDownload"
                    }
                    else {
                        alert("login failed");
                        $window.location = "./"
                    }
                },
                function (httpResponseFail) {
                    console.log("Error page", httpResponseFail);
                });
        };

        $scope.deactivate = function () {
            $scope.pw_msg = '';
        };

        $scope.register = function () {
            $window.location.href = '/register.html';
        }
    }]);