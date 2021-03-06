require.config({

	baseUrl: 'js/vendor',

	paths: {
        app: '../app',
        services: '../app/services',
        templates: '../../templates',
        data: '../../data',
        views: '../app/views',
        models: '../app/models',
        collections: '../app/collections',
        text: 'requirejs-text',
        async: 'requirejs-async',
        jquery: 'jquery-1.12.4.min',
        underscore: 'underscore-1.8.3.min',
        backbone: 'backbone-1.3.3.min',
        localstorage: 'backbone.localStorage-min',
        //modernizr: 'modernizr-2.8.0.min',
        bootstrap: 'bootstrap-3.3.7.min',
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
			deps: ['jquery'],
			exports: '$.fn.dropdown'
		},
		iscroll: {
			exports: 'IScroll'
		}
		// modernizr: {
		// 	exports: 'Modernizr'
		// }
	},
	waitSeconds: 20,
	enforceDefine: true
});

define(['jquery', 'underscore', 'backbone', 'iscroll','bootstrap'], //'modernizr'
	function ($,_, Backbone, IScroll) {

	   	/* Document ready */
		$(function(){

			logger.disableLogger();   // NO DEBUG

			console.log('documentready');
			// Retrocompatibilidad (sesión y usuarios previos a cambio de sistema Abril2017)
			// Quito de localstorage toda la data previa
			removeStoragePrevio();

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
		document.addEventListener("deviceready", eventHandlersPhoneGap, false);

	}
);

// Retrocompatibilidad  - usos de app hasta version 1.1.6: se elimina toda la info guardada en storage
function removeStoragePrevio() {
	if (localStorage.getItem('iaca-session') || localStorage.getItem('iaca-usuarios')) {
		console.log('Había sesión o usuarios sistema anterior: vacío storage');
		// Vacío storage
		window.localStorage.clear();
	}
}

function eventHandlersGenerales() {
	// variables para controlar distancia de touchmove
	var startX = 0;	var startY = 0;
	var moveX = 0;	var moveY = 0;

	var minSwipe = 20;

	window.dragging = false;

	document.addEventListener('touchmove', function (e) {
		if (e.changedTouches) {
			var touchobj = e.changedTouches[0];
	    	moveX = Math.abs(touchobj.pageX - startX);
	    	moveY = Math.abs(touchobj.pageY - startY);
	    	if (moveX > minSwipe || moveY > minSwipe)
				window.dragging = true;
			//console.log("touchmove "+moveX+" "+moveY);
		}
		else
			window.dragging = true;
		//console.log("touchmove "+e.target.tagName +' '+e.target.id +' '+ e.target.className+' '+e.touches);
	},false);

	document.addEventListener('touchstart', function(e){
    	window.dragging = false;
    	if (e.changedTouches) {
    	 	var touchobj = e.changedTouches[0];
    	 	startX = touchobj.pageX;
    	 	startY = touchobj.pageY;
    	 	//console.log("touchstart "+startX+" "+startY);
    	}

    	// console.log("touchstart "+e.target.tagName +' '+e.target.id +' '+ e.target.className);
	},false);

	document.addEventListener("touchend", function () {
		window.dragging = false;
		// console.log("touchend "+event.target.tagName +' '+event.target.id +' '+ event.target.className);
	},false);

    //$('body').on("click", function (event) {
	    // console.log("click "+event.target.tagName +' '+event.target.id +' '+ event.target.className);
	//});
	// $('body').on("mousedown touchstart",'.boton', function (e) {
	$('body').on("touchstart",'.boton,.activar', function (e) {
		$(e.currentTarget).addClass('activo');
		//	e.stopPropagation();
		//	e.preventDefault();
		//	console.log("activo "+e.target.tagName +' '+e.target.id +' '+ e.target.className);
	});
	// $('body').on("mouseup touchend",'.boton', function (e) {
	$('body').on("touchend",'.boton,.activar', function (e) {
		$(e.currentTarget).removeClass('activo');
		// e.stopPropagation();
		// e.preventDefault();
		// console.log("desactivo "+e.target.tagName +' '+e.target.id +' '+ e.target.className);
	});
	// $('body').on('mouseup touchend touchmove', function(e) {
	$('body').on('touchend touchmove', function() {
		//$('.boton').removeClass('activo');
	});


}

function eventHandlersPhoneGap() {
	console.log('eventHandlersPhoneGap');
	window.deviceready = true;

	// Evento boton atrás celu
	$(document).on('backbutton',function() {
		console.log('backbutton');
		if($('#imgs-wrapper').is(":visible")) {
			console.log("Viendo imgs");
			$('#imgs-wrapper').hide();
		}
		else {
			require(['backbone'], function(Backbone) {
				var actualURL = Backbone.history.fragment;
				console.log('actualURL: '+actualURL);
				// Desde laboratorios siempre voy a home (para evitar que si vi vengo de un lab vuelva a ese)
				// Desde login también va a home
				if (actualURL == 'laboratorios' || actualURL.substring(0, 5) == 'login') {
					console.log('Go to home');
					Backbone.history.navigate("home",true);
				}
				// Si es home, exit app
				else if (actualURL == 'home' || !actualURL) {
					console.log('Exit app??');

					navigator.notification.confirm(
					    '¿Desea cerrar la aplicación?', // message
					     exitApp,            // callback to invoke with index of button pressed
					    'SALIR',           // title
					    ['NO','SÍ']     // buttonLabels
					);
				}
				// En cualquier otro lado, voy atrás
				else {
					console.log('window.history.back()');
					window.history.back();
				}
			});
		}
	});

	//Evento boton menu celu
	$(document).on('menubutton',function() {
		console.log('menubutton: Toggle dropdown menuUser-list');
		$('#menuUser-list').dropdown('toggle');
	});

	//oculto splash
	// navigator.splashscreen.hide();
	// se oculta desp de 3 segs

	// registro dispositivo para push notifications
	// NO IMPLEMENTADO EN SERVER
	// Usa plugin PushPlugin
	// Instalacion: cordova plugin add phonegap-plugin-push --variable SENDER_ID="529178062856"
	// console.log("device.platform: "+device.platform);
	// registrarPushNotification(device.platform);
}

function exitApp(buttonIndex) {
	console.log('confirm-boton: '+buttonIndex);
	if(buttonIndex == 2) {
		console.log('exitApp');
		navigator.app.exitApp();
	}
}

/* Registrar app para recibir notificaciones - desactivado porque no fue implementado en server */
// function registrarPushNotification(platform) {
// 	require(['services/notificaciones'], function(notif) {
// 		if (platform == 'android' || platform == 'Android')
// 			notif.registrarAndroid();
// 		else if (platform == "iOS")
// 			notif.registrarApple();
// 		else if (platform == 'Win32NT' || platform == 'WinCE')
// 			notif.registrarWin();
// 	});
// }