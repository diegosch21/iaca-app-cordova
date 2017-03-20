/* global google */
define(
    [ "async!http://maps.google.com/maps/api/js?sensor=false" ],
    //[ "http://www.cualquiercosaaaaaa.com.ar" ],
    function() {

    	var Mapa = function() {

			var map;

    		this.mapOptions  =  {
    		    zoom: 13,
    		    center: new google.maps.LatLng(-38.717607, -62.265389), //Bahia Blanca
    		    mapTypeId: google.maps.MapTypeId.ROADMAP
    		};
    		this.render = function(el){
    		    map = new google.maps.Map(el,this.mapOptions);
    		};
    		this.setMarkers = function(markers) {
    		    var infowindow = new google.maps.InfoWindow({maxWidth: 160});
    		    var marker, i;
    		    for (i = 0; i < markers.length; i++) {
    		        marker = new google.maps.Marker({
    		            position: new google.maps.LatLng(markers[i]["lat"], markers[i]["lng"]),
    		            title: "Sede "+markers[i]["sede"],
    		            icon: markers[i]["icon_map"],
    		            map: map
    		        });

    		        google.maps.event.addListener(marker, 'click', (function(marker, i) {
    		            return function() {
    		                var content = "<a href='"+markers[i]["link_map"]+"'>";
    		                content+="<strong>Sede "+markers[i]["sede"]+"</strong></a><br/>";
    		                content+= markers[i]["info_map"]+"<br/>";
    		                content+= "<i>"+markers[i]["direccion"]+"</i>";
    		                infowindow.setContent(content);
    		                infowindow.open(map, marker);
    		            };
    		        })(marker, i));
    		    }
    		};
    		this.setCenter = function(lat,lng) {
    		    this.mapOptions.center = new google.maps.LatLng(lat,lng);
    		};
    		this.setZoom = function(z) {
    		    this.mapOptions.zoom = z;
    		};


    	};

        return new Mapa();  //SINGLETON
    }
);