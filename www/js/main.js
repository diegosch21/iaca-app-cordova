require.config({

	baseUrl: 'js/vendor',

	paths: {
        app: '../app',
        lib: '../app/lib',
        templates: '../../templates',
        data: '../../data',
        views: '../app/views',
        models: '../app/models',
        collections: '../app/collections',
        text: 'requirejs-text',
        async: 'requirejs-async',
        jquery: 'jquery-1.11.1.min',
        underscore: 'underscore-1.6.0.min',
        backbone: 'backbone-1.1.2.min',
        localstorage: 'backbone.localStorage-min',
        modernizr: 'modernizr-2.8.0.min',
        bootstrap: 'bootstrap-3.2.0.min',
        iscroll: 'iscroll-zoom'
    }, 
	shim: {
		underscore: {
			exports: '_'
		},
		backbone: {
			deps: ['underscore','jquery'],
			exports: 'Backbone'
		},
		localstorage: {
			deps: ['backbone'],
			exports: 'Store'
		},
		bootstrap: {
			deps: ['jquery']
		},
		iscroll: {
			exports: 'IScroll'
		}
	},
	waitSeconds: 20
});

require(['jquery', 'underscore', 'backbone', 'iscroll','modernizr', 'bootstrap'], 
	function ($,_, Backbone, IScroll) {

	   	/* Document ready */
		$(function(){
			console.log('documentready');
			eventHandlersGenerales();
					
			var scrollerContent = new IScroll('#content-wrapper', {
			    mouseWheel: true,
			    scrollbars: true,
			    interactiveScrollbars: true,
				fadeScrollbars: true,
				bounce: false,
				checkDOMChanges:true
			});	

			require(['app/router'], function(Router) {
				var router = new Router();
				router.scroller = scrollerContent;
				Backbone.history.start();
			});

		});

		/* Device ready */
		if(window.deviceready) {
			// ya se lanzo el evento deviceready
			eventHandlersPhoneGap();
		}
		else {
			$(document).on('deviceready',function() {
				console.log('deviceready en main.js');
				eventHandlersPhoneGap();
			})
		}
		
	}	
);

function eventHandlersGenerales() {
	window.dragging = false;
	$('body').on('touchmove', function (e) {
		window.dragging = true;
		// console.log("touchmove "+event.target.tagName +' '+event.target.id +' '+ event.target.className);
	});
	$('body').on('touchstart', function(e){
    	window.dragging = false;
    	// console.log("touchstart "+event.target.tagName +' '+event.target.id +' '+ event.target.className);
	});

	//$('body').on("touchend", function (event) {
		// console.log("touchend "+event.target.tagName +' '+event.target.id +' '+ event.target.className);    
	//});
    //$('body').on("click", function (event) {
	    // console.log("click "+event.target.tagName +' '+event.target.id +' '+ event.target.className);    
	//});
	// $('body').on("mousedown touchstart",'.boton', function (e) {
	$('body').on("touchstart",'.boton', function (e) {
		$(e.currentTarget).addClass('activo');
		//	e.stopPropagation();
		//	e.preventDefault();
		//	console.log("activo "+e.target.tagName +' '+e.target.id +' '+ e.target.className);    
	});
	// $('body').on("mouseup touchend",'.boton', function (e) {
	$('body').on("touchend",'.boton', function (e) {
		$('.boton').removeClass('activo');
		// e.stopPropagation();
		// e.preventDefault();
		// console.log("desactivo "+e.target.tagName +' '+e.target.id +' '+ e.target.className);    
	});	
	// $('body').on('mouseup touchend touchmove', function(e) {
	$('body').on('touchend touchmove', function(e) {
		$('.boton').removeClass('activo');
	});


}

function eventHandlersPhoneGap() {
	console.log('eventHandlersPhoneGap');
	// Evento boton atrás celu
	$(document).on('backbutton',function(e) {
		console.log('backbutton');
		if($('#imgs-wrapper').is(":visible")) {
			console.log("Viendo imgs");
			$('#imgs-wrapper').hide(); 
		}
		else {
			var actualURL = Backbone.history.fragment;
			console.log('actualURL: '+actualURL);
			// Desde laboratorios siempre voy a home (para evitar que si vi vengo de un lab vuelva a ese)
			// Desde login también va a home
			if (actualURL == 'laboratorios' || actualURL.substring(0, 5) == 'login') {
				console.log('Go to home');
				Backbone.history.navigate("home",true);
			}
			// De cualquier lugar que no sea home, voy al url anterior
			else if (actualURL != 'home' && actualURL != '' ) {
				console.log('window.history.back()');
				window.history.back();
			}
			// Si estoy en home me quedo ahí
			else
				console.log('Stay here');
			// TO DO: salir de la app
		}
	});
}

