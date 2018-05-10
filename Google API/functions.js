var map;
var univ;
var service;
var markers = [];
var infoWindow;
var nameid = "11";
var directionService;
var directionDisplay;
var control;

var $ = function (id) {
    return document.getElementById(id); 
}
function initMap() {

	// Create map
	univ = new google.maps.LatLng(44.9727,-93.23540000000003);
	map = new google.maps.Map(document.getElementById('map'), 
	{
	  center: univ,
	  zoom: 14
	});
 	infoWindow = new google.maps.InfoWindow;
	directionService = new google.maps.DirectionsService;
	directionDisplay = new google.maps.DirectionsRenderer;
	directionDisplay.setMap(map);
	directionDisplay.setPanel($("right-panel"));
	control = $("floating-panel");
	control.style.display='block';
	map.controls[google.maps.ControlPosition.TOP_CENTER].push(control);

	// Initialize my favourite places with markers;
	service = new google.maps.places.PlacesService(map);
	for (i=0; i<4;i++)
	{
		var place = $(i).textContent;
		var request = { 
		 location: univ, 
		 query: "\'" + place + "\'"};
		service.textSearch(request,callback);
	}
}

// Function gets the geolocation of my favourite places and calls createMarker()
function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
  	var multiple = false;
  	if (results.length > 1)
  		multiple = true;
    for (var i = 0; i < results.length; i++) {
      	var place = results[i];
      	//addMarker(place);
		//console.log(place);
        createMarker(results[i],multiple); // pass only the location to createMarker
    }
  }
}

// Creates marker together with the information about the place
function createMarker(result,multiple) {

	var contentString;

	if (!multiple){
		contentString = $(nameid).textContent;
		var temp = parseInt(nameid) + 1;
		nameid = temp.toString();
	}
	else {
		contentString = result.name;
	}
	var infowindow = new google.maps.InfoWindow({
		content: contentString
	});

    var marker = new google.maps.Marker({
        position: result.geometry.location,
        map: map,
    });

    marker.addListener('click', function(){
    	infowindow.open(map,marker);
    })

    markers.push(marker);
}


function deleteMarkers(){
	for (var i=0; i<markers.length;i++){
		markers[i].setMap(null);
	}
	markers = [];
}

function searchNear() {

	deleteMarkers();
	directionDisplay.setMap(null);
	directionDisplay.setPanel(null);

	service = new google.maps.places.PlacesService(map);
	var request = {
		location: univ,
		radius: $("radius").value,
		type: $("nearby").value
	};
	service.nearbySearch(request,callback);	
}

function getDest(){

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			calcPath(position);
		});
	}

}

function calcPath(position){

	var pos = {
		lat : position.coords.latitude,
	 	lng: position.coords.longitude };

	directionService.route({
		origin: pos,
		destination: $("dest").value,
		travelMode: $("travelmode").value
	}, function(response,status) {
		if (status === 'OK'){
			deleteMarkers();
			directionDisplay.setDirections(response);
			directionDisplay.setMap(map);
			directionDisplay.setPanel($("right-panel"));
		}
		else
			window.alert('Directions request failed due to ' + status);
	});
}

function test(position){
	console.log(position);
}







// Depriciated
function changeImage(path){
  document.getElementById('myImage').src = path;
}

