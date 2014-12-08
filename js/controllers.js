'use strict';

var app = angular.module("geo", ["uiGmapgoogle-maps", "angularGooglePlaces"])
    .controller("mainController", function (LS, $scope, $http) {



    	$scope.getLatestPlaces = function() {
        	return LS.getlatestPlaces();
        }
    	$scope.updateLatestLocation = function(val){
    		return LS.updateLatestLocation(val);
    	}
    	$scope.getContPlaces = function(){
    		return LS.getContPlaces();
    	}
    	$scope.setContPlaces = function(val){
    		return LS.setContPlaces(val);
    	}
    	$scope.latestPlaces = $scope.getLatestPlaces()== null ? [] : JSON.parse($scope.getLatestPlaces());
    	console.log($scope.latestPlaces);
    	$scope.contPlaces = $scope.getContPlaces() == null ? -1 : $scope.getContPlaces(); // if its -1 is the first time in the app

    	// $scope.latestPlaces = [];
    	// $scope.contPlaces = -1;

        $scope.lat = "0";
        $scope.lng = "0";
        $scope.accuracy = "0";
        $scope.error = "";
        $scope.marker  = [];
        $scope.map = [];
        $scope.weatherInfo = {};
        $scope.infoWeatherDays = {};
        $scope.location = '';
        $scope.place = '';
        
        $scope.showResult = function () {
            return $scope.error == "";
        }
      
        $scope.showPosition = function (position) {
            $scope.lat = position.coords.latitude;
            $scope.lng = position.coords.longitude;
            //$scope.location = $scope.lat+","+$scope.lng;
            $scope.accuracy = position.coords.accuracy;

            $scope.showMap($scope.lat, $scope.lng);

            $scope.getInfoWeather($scope.lat, $scope.lng);        
            
            $scope.$apply();
            
        }

        $scope.showMap = function(lat, lng){
        	$scope.map = { center: { latitude: lat, longitude: lng }, zoom: 15 };

            //this is for the marker in the map
            $scope.marker = {
		      id: 0,
		      coords: {
		        latitude: lat,
		        longitude: lng
		      }
		  }

        }

        $scope.getInfoWeather = function(lat, lng){
        	var responseWeatherInfo = $http.get("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(SELECT%20woeid%20FROM%20geo.placefinder%20WHERE%20text%3D%22"+lat+"%20%2C%20"+lng+"%20%22%20and%20gflags%3D%22R%22)%20and%20u%3D'c'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys");
            responseWeatherInfo.success(function(data, status, headers, config){
            	$scope.weatherInfo = data;
            	$scope.infoWeatherDays = data.query.results.channel.item.forecast;

            	
            	var aux = $scope.existLocationInLocalStorage($scope.weatherInfo);
            	if(aux >= 0){
	            	$scope.latestPlaces[aux] = 
	            	{
	            		info: $scope.weatherInfo,
	            		lat: $scope.lat,
	            		lng: $scope.lng
	            	};
	            	$scope.updateLatestLocation(JSON.stringify($scope.latestPlaces));
	            }else{
	            	if($scope.contPlaces === 5){
            			$scope.contPlaces = 0;
	            	}
	            	else{
	            		$scope.contPlaces++;
	            	}
	            	$scope.latestPlaces[$scope.contPlaces] = {
	            		info: $scope.weatherInfo,
	            		lat: $scope.lat,
	            		lng: $scope.lng
	            	}
	            	$scope.updateLatestLocation(JSON.stringify($scope.latestPlaces));
	            	$scope.setContPlaces($scope.contPlaces);
	            }
            	
            })
        }

        $scope.existLocationInLocalStorage = function(location){
        	var currentPlace = location.query.results.channel.location.city;
        	var i = 0;
        	var keepGoing = true;
        	angular.forEach($scope.latestPlaces, function(place) {
        		if(keepGoing) {
	        		if(angular.equals(currentPlace, place.info.query.results.channel.location.city)){
	        			keepGoing = false;
	        		}
	        		else{
	        			i++;
	        		}
	        	}
        	});
        	return keepGoing ? -1 : i;
        };
     

        //function to show an error code
        $scope.showError = function (error) {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    $scope.error = "User denied the request for Geolocation."
                    break;
                case error.POSITION_UNAVAILABLE:
                    $scope.error = "Location information is unavailable."
                    break;
                case error.TIMEOUT:
                    $scope.error = "The request to get user location timed out."
                    break;
                case error.UNKNOWN_ERROR:
                    $scope.error = "An unknown error occurred."
                    break;
            }
            $scope.$apply();
        }

        //function to get the location
        $scope.getLocation = function () {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition($scope.showPosition, $scope.showError);
            }
            else {
                $scope.error = "Geolocation is not supported by this browser.";
            }
        }

        $scope.doSearch = function(){
        	console.log('doSearch');
        	if($scope.location === ''){
                    return false;
                } else {
                    $scope.updateLocation($scope.location);
                }
        };

        $scope.updateLocation = function(location){
        	$scope.lat = location.geometry.location.lat();
            $scope.lng = location.geometry.location.lng();
            $scope.showMap($scope.lat, $scope.lng);

            $scope.getInfoWeather($scope.lat, $scope.lng);   

        }

        $scope.updateWithLatestLocation = function(){
        	console.log(this);
        	$scope.lat = this.place.lat;
        	$scope.lng = this.place.lng;
        	$scope.showMap($scope.lat, $scope.lng);
            $scope.getInfoWeather($scope.lat, $scope.lng);


        }


        $scope.getLocation();
    });

app.factory("LS", function($window, $rootScope){
	return{
		updateLatestLocation: function(val){
			$window.localStorage && $window.localStorage.setItem('places', val);
      		return this;
		},
		getlatestPlaces: function() {
      		return $window.localStorage && $window.localStorage.getItem('places');
		},
		getContPlaces: function() {
      		return $window.localStorage && $window.localStorage.getItem('contPlaces');
		},
		setContPlaces: function(val){
			$window.localStorage && $window.localStorage.setItem('contPlaces', val);
      		return this;
		}
	};
});



            

            