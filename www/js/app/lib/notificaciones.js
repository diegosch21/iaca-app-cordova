/* global logger */
// Instalacion plugin: cordova plugin add phonegap-plugin-push --variable SENDER_ID="529178062856"
define([
	'models/Sesion',
	'backbone'
],	function(Sesion,Backbone) {
		var Notificaciones = function() {

			var addCallback = function(key, callback) {
  				if(window.callbacks === undefined) {
   					window.callbacks = {};
  				}
  				window.callbacks[key] = callback;
 			};

			this.registrarAndroid = function() {
				logger.toggleConsole(true);   // DEBUG
				console.log("PushPlugin: registrarAndroid");
				try {
					window.plugins.pushNotification.register(
					 	successHandlerAndroid,
					 	errorHandlerAndroid,
					 	{"senderID":"529178062856",
					 	"ecb":"window.callbacks.onNotificationGCM"}
					);
				}
				catch(err) {
					console.log("PushPlugin error: "+err);
				}
				logger.toggleConsole(false);   // NO DEBUG
			};
			var successHandlerAndroid = function(result) {
				logger.toggleConsole(true);   // DEBUG
				console.log("PushPlugin: Success handler register en android. Result: "+result);
				addCallback('onNotificationGCM',onNotificationGCM);
				logger.toggleConsole(false);   // NO DEBUG
			};
			var errorHandlerAndroid = function(error) {
				logger.toggleConsole(true);   // DEBUG
				console.log("PushPlugin: Error handler register en android. Error: "+error);
				logger.toggleConsole(false);   // NO DEBUG
			};
			var onNotificationGCM = function (e) {
				logger.toggleConsole(true);   // DEBUG
				console.log("onNotificationGCM");
				switch( e.event )
				{
					case 'registered':
						if ( e.regid.length > 0 )
						{
							console.log("PushPlugin: regID: " + e.regid);
							localStorage.setItem("iaca-notificationID", e.regid);
							Sesion.setNotifID(e.regid);
						}
						break;
					case 'message':

                    	if (e.foreground) {
                    		// if this flag is set, this notification happened while we were in the foreground.
                    		// you might want to play a sound to get the user's attention, throw up a dialog, etc.
                    		console.log("PushPlugin - onNotificationGCM: Notificacion en foreground ");
                    	}
			            else {
			            	// otherwise we were launched because the user touched a notification in the notification tray.
							if (e.coldstart)
								console.log("PushPlugin - onNotificationGCM: Notificacion - coldstart ");
							else
								console.log("PushPlugin - onNotificationGCM: Notificacion en background ");
						}

						console.log('PushPlugin - onNotificationGCM: message: '+e.payload.message);
						alerta('Nuevo resultado','Hay un nuevo resultado de análisis disponible');
	                    break;

                    case 'error':
                    	console.log("PushPlugin - onNotificationGCM: Error "+e.msg);
                        break;

                    default:
                        console.log("PushPlugin - onNotificationGCM: evento desconocido");
                        break;
                }
                logger.toggleConsole(false);   // NO DEBUG
            };

			this.registrarApple = function() {
				logger.toggleConsole(true);   // DEBUG
				try {
					window.plugins.pushNotification.register(
						tokenHandlerApple,
						errorHandlerApple,
						{"badge":"true",
						"sound":"true",
						"alert":"true",
						"ecb":"window.callbacks.onNotificationAPN"}
					);
				}
				catch(err) 	{
					console.log("PushPlugin error: "+err);
				}
				logger.toggleConsole(false);   // NO DEBUG
			};

			var tokenHandlerApple = function(token) {
				logger.toggleConsole(true);   // DEBUG
				console.log("PushPlugin: Success handler register en Apple. token: "+token);
				//alert("PushPlugin: Success handler register en Apple. token: "+token);
				addCallback('onNotificationAPN',onNotificationAPN);
				localStorage.setItem("iaca-notificationID", token);
				Sesion.setNotifID(token);
				logger.toggleConsole(false);   // NO DEBUG
			};
			var errorHandlerApple = function(error) {
				logger.toggleConsole(true);   // DEBUG
				console.log("PushPlugin: Error handler register en Apple. Error: "+error);
				logger.toggleConsole(false);   // NO DEBUG
			};
			var successHandlerBadge = function() {
				logger.toggleConsole(true);   // DEBUG
				console.log("PushPlugin: Success handler icon badge en Apple");
				logger.toggleConsole(false);   // NO DEBUG
			};

			var onNotificationAPN = function(e) {
				logger.toggleConsole(true);   // DEBUG
				console.log("onNotificationGCM");
                if (e.alert) {
                    console.log(e.alert);
                }
                alerta('Nuevo resultado','Hay un nuevo resultado de análisis disponible');
                if (e.badge) {
                    window.plugins.pushNotification.setApplicationIconBadgeNumber(successHandlerBadge, e.badge);
                }
                logger.toggleConsole(false);   // NO DEBUG
            };


			this.registrarWin = function() {
				//TO DO
			};

			var alerta = function(title,msj) {
				navigator.notification.confirm(
				    msj,			// message
				    responseAlerta,            // callback to invoke with index of button pressed
				    title,           // title
				    ['OK','Ver lista']     // buttonLabels
				);
			};
			var responseAlerta = function(buttonIndex) {
				if(buttonIndex == 2) {
					console.log('ver lista');
					Backbone.history.navigate("resultados",true);
				}
			};
		};

		return new Notificaciones();  //SINGLETON
	}

);