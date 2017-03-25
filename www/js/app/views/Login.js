/* global cordova */
define([
	'text!templates/login.html',
	'text!templates/alert.html',
	'backbone',
	'services/authentication',
	'collections/Usuarios',
], function (loginTemplate,alertTemplate,Backbone,Auth,Usuarios) {

	var LoginView = Backbone.View.extend({

		//precompilo el template
		template: _.template(loginTemplate),
		templateAlert: _.template(alertTemplate),
		redireccion: 'resultados', // por defecto luego de login se redirecciona a resultados, para poder obtener nombre de usuario

		initialize: function(options) {
			_.bindAll(this,'login','loginGuardado','deleteGuardado','alerta');
		},

		events: {
			'submit form#login'	: 'login',
			'touchend a.usuario-guardado' : 'loginGuardado',
			'touchend span.delete-guardado' : 'deleteGuardado',
			'touchend #content-logout' : 'logout',
			'touchstart #boton-acceso-resultados-anteriores.external-link' : 'openConsultaResultadosAnteriores'
			// 'click a.usuario-guardado' : 'loginGuardado',
			// 'click span.delete-guardado' : 'deleteGuardado',
			// 'click #content-logout' : 'logout',
			// 'click #boton-acceso-resultados-anteriores.external-link' : 'openConsultaResultadosAnteriores'
		},

		render: function() {
			var logueado = Auth.logueado;
			if(Usuarios.length > 0) {
				var users = [];
				Usuarios.each(function(user, index){
					users[index] = {"id": user.get("id"), "name": user.get("name")};
				});
				this.$el.html(this.template({"logueado": logueado, "guardados":true, "usuarios": users}));
			}
			else {
				this.$el.html(this.template({"logueado": logueado, "guardados":false}));
			}

			return this;
		},

		login: function(evt) {
			var self = this;
			if(evt)
				evt.preventDefault();
			var username = this.$("#usuario").val();
			var password = this.$("#pass").val();
			self.$('.mensaje--alerta').html('');

			if(!username.trim) { // string vacío
				this.alerta("Ingrese su número de usuario",'.mensaje--alerta');
			}
			else if (!password.trim) { // string vacío
				this.alerta("Ingrese su contraseña",'.mensaje--alerta');
			}
			else {
				this.loading(true);
				Auth.login(username,password,{  // objeto callbacks, definiendo 3 funciones a ejecutar luego de login
					success: function() { // param: data
						console.log("Usuario logueado ",JSON.stringify(Auth.user));
						self.alerta('Logueado correctamente');
						console.log("Redirecciona a: "+self.redireccion);
						// Redirecciona a resultados, donde obtiene el nombre de usuario (además de los resultados)
						Backbone.history.navigate(self.redireccion,true);
					},
					error: function(error) {
						console.log(error);
						self.alerta(error,'.mensaje--alerta',true);
					},
					complete: function() {
						self.loading(false);
					}
				});
			}
		},
		alerta: function(msj,selector,long) {
			try {
				if (window.deviceready && window.plugins && window.plugins.toast) {
					if(long)
						window.plugins.toast.showLongCenter(msj);
					else
						window.plugins.toast.showShortCenter(msj);
				}
				else {
					if (selector)
						this.$(selector).html(this.templateAlert({msj: msj}));
				}
			} catch(err) {
				console.log(err);
			}
		},

		loginGuardado: function(evt) {

			var id = $(evt.target).data("id");
			var user = Usuarios.get(id);
			var self = this;
			if(user)
			{
				var pass = user.get("pass");
				this.loading(true);
				Auth.login(id,pass,{ // objeto callbacks: defino 3 funciones a ejecutar luego de login
					success: function() { // param: data
						console.log("Usuario guardado Logueado: "+Auth.logueado+" Redirecciona a: "+self.redireccion);
						self.alerta('Logueado correctamente');
						Backbone.history.navigate(self.redireccion,true);
					},
					error: function(error) {
						self.alerta(error,'#error-login-guardado',true);
					},
					complete: function() {
						self.loading(false);
					}
				});
			}
			else
				this.alerta("Información guardada inválida",'#error-login-guardado');


		},

		loading: function(loading) {
			if(loading) {
				$('#page-loading').show();
			}
			else {
				$('#page-loading').hide();
				this.scroller.refresh();
			}
		},
		deleteGuardado: function(evt) {
			evt.stopPropagation();
			var id = $(evt.currentTarget).data("id");
			Usuarios.get(id).destroy();
			this.render();
		},
		logout: function() {
			Auth.logout();
    		if (window.deviceready) {
    			try {
    				window.plugins.toast.showShortCenter('Usuario deslogueado');
    			}
    			catch(err) {
    				console.log(err);
    			}
    		}
    		this.render();
		},
		// Abre link para consulta de resultados anteriores en browser
		openConsultaResultadosAnteriores: function(event) {
			var url= ($(event.currentTarget).data('href'));
			if (typeof cordova !== 'undefined' && cordova.InAppBrowser) {
				// Usa plugin inAppBrowser pero abre browser sistema.
				// No uso el browser in-app porque no permite descargar PDF
				// 	(y no puedo obtener link de descarga y usar método de lib/PDFDownloader, porque necesito la cookie)
				cordova.InAppBrowser.open(url, '_system');
			}
			else {
				window.open(url,'_system');
			}
		}
	});

	return LoginView;
});