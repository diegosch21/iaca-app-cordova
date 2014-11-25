define([
	'models/Sesion'
],	function(Sesion) {
		var Notificaciones = function() {

			var addCallback = function(key, callback) {
  				if(window.callbacks == undefined) {
   					window.callbacks = {};
  				}
  				window.callbacks[key] = callback;
 			};

			this.registrarAndroid = function() {
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
			};
			var successHandlerAndroid = function(result) {
				console.log("PushPlugin: Success handler register en android. Result: "+result);
				addCallback('onNotificationGCM',onNotificationGCM);	
			};
			var errorHandlerAndroid = function(error) {
				console.log("PushPlugin: Error handler register en android. Error: "+error);
			};
			var onNotificationGCM = function (e) {
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
            };

			this.registrarApple = function() {
				try {
					window.plugins.pushNotification.register(
						tokenHandlerApple, 
						errorHandlerApple,
						{"badge":"true",
						"sound":"true",
						"alert":"true",
						"ecb":"onNotificationAPN"}
					);
				}
				catch(err) 	{
					console.log("PushPlugin error: "+err);
				}
			};

			var tokenHandlerApple = function(token) {
				console.log("PushPlugin: Success handler register en Apple. token: "+token);
				addCallback('onNotificationAPN',onNotificationAPN);	
				localStorage.setItem("iaca-notificationID", token);
				Sesion.setNotifID(token);
			};
			var errorHandlerApple = function(error) {
				console.log("PushPlugin: Error handler register en Apple. Error: "+error);
			};
			var successHandlerBadge = function() {
				console.log("PushPlugin: Success handler icon badge en Apple");
			};

			var onNotificationAPN = function(e) {
				console.log("onNotificationGCM");
                if (e.alert) {
                     
                    //TODO
                }
                    
                
                if (e.badge) {
                    pushNotification.setApplicationIconBadgeNumber(successHandlerBadge, e.badge);
                }
            }


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
			}
		}

		return new Notificaciones();  //SINGLETON
	}

);