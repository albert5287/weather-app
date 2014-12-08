(function () {
    angular.module('angularGooglePlaces', [])
    .directive('googlePlaces', function(){
        return {
            restrict:'E',
            replace:true,
            scope: {location:'='},
            template: '<input id="google_places_ac" name="google_places_ac" type="text" class="input-block-level"/>',
            link: function($scope, elm, attrs){
                var autocomplete = new google.maps.places.Autocomplete(elm[0], {});
                google.maps.event.addListener(autocomplete, 'place_changed', function() {
                    console.log('directiva');
                    var place = autocomplete.getPlace();
                    //$scope.location = place.geometry.location.lat() + ',' + place.geometry.location.lng();
                    $scope.location = place;
                    $scope.$apply();
                });
            }
        }
    });
})();

