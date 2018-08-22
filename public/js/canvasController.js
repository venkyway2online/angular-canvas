
anproject.controller('canvasDownloadController', ['$scope', '$http', '$window', '$location', '$cookies',
    function ($scope, $http, $window, $location, $cookies) {
        $scope.uploadFile = function(files) {
            var canvas = new fabric.Canvas('canvas');
            if (files && files[0]) {
                for (var i = 0; i < files.length; i++) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        fabric.Image.fromURL(e.target.result, function (Img) {
                            Img.scaleToWidth(100);
                            Img.scaleToHeight(200);
                            canvas.add(Img);
                        })
                    };
                    reader.readAsDataURL(files[i]);
                }
            }
        };
        $scope.download = function(el) {
            var canvas = document.getElementById("canvas");
            var image = canvas.toDataURL("image/png");
            el.href = image;
        };

        $scope.save = function() {
            var canvas = document.getElementById("canvas");
            var image = canvas.toDataURL("image/png");
            image = image.replace('data:image/png;base64,', '');

            $http({
                method: 'POST',
                url: '/saveImage',
                data: {val:image,user:$cookies.get("token")},
                json: true
            }).then(
                function (httpResponseSuccess) {
                    $scope.user_data = httpResponseSuccess.data.email
                },
                function (httpResponseFail) {
                    console.log("Error page", httpResponseFail);
                });
        };
        $scope.show_image=false;
        $scope.showImages=function () {
            $http({
                method: 'POST',
                url: '/showImages',
                data: {token: $cookies.get("token")},
                json: true
            }).then(
                function (httpResponseSuccess) {
                    if(httpResponseSuccess.data.images.length>0){
                        $scope.show_image=true;
                        $scope.imagesNames = httpResponseSuccess.data.images;
                        $scope.client_folder=httpResponseSuccess.data.id;
                    }
                    else{
                        $scope.show_image=false;
                    }

                },
                function (httpResponseFail) {
                    console.log("Error page", httpResponseFail);
                });
        };
    }
]);