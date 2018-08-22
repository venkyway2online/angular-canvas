
var anproject = angular.module('AnProject', ['ngRoute', 'ngCookies']);
//Routing
anproject.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider
            .when('/canvasDownload', {
                controller: 'canvasDownloadController',
                templateUrl: 'image-test.html'
            })

    }]).run(function ($rootScope, $route) {
    $rootScope.$route = $route;
});
