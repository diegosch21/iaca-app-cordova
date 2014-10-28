define([
	'text!templates/login.html',
	'models/Sesion',
	'text!templates/alert.html',
	'collections/Usuarios'

], function (loginTemplate,Sesion,alertTemplate,Usuarios) {
	
	var LoginView = Backbone.View.extend({

		//precompilo el template
		template: _.template(loginTemplate),
		templateAlert: _.template(alertTemplate),

		initialize: function(options) {
			if(options && options['redireccion'])
				this.redireccion  = options['redireccion'];
			else
				this.redireccion = 'home';
			this.options = options || {};
			_.bindAll(this,'login','loginGuardado','deleteGuardado');
		},

		events: {
			'submit form#login'	: 'login',
			'touchend a.usuario-guardado' : 'loginGuardado',
			'touchend span.delete-guardado' : 'deleteGuardado'
			// 'click a.usuario-guardado' : 'loginGuardado',
			// 'click span.delete-guardado' : 'deleteGuardado'
		},

		render: function() {
			var logueado = Sesion.get("logueado");
			if(Usuarios.length > 0) {
				var users = [];
				Usuarios.each(function(user, index){
					users[index] = {"id": user.get("id"), "name": user.get("name")};
				})
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
			
			if(username!="" && password!="") {
				this.loading(true);
				Sesion.login(username,password,{
					success: function(data) {
						console.log("Logueado: "+Sesion.get("logueado")+" Redirecciona a: "+self.redireccion);
						Backbone.history.navigate(self.redireccion,true);
					},
					error: function(error) {
						console.log(error);
						self.$('.mensaje--alerta').html(self.templateAlert({msj: error}));
					},
					complete: function() {
						self.loading(false);
					}
				});
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
				Sesion.login(id,pass,{
					success: function(data) {
						console.log("Usuario guardado Logueado: "+Sesion.get("logueado")+" Redirecciona a: "+self.redireccion);
						Backbone.history.navigate(self.redireccion,true);
					},
					error: function(error) {
						self.$("#error-login-guardado").html(self.templateAlert({msj: error}));
					},
					complete: function() {
						self.loading(false);
					}
				});
			}
			else
				this.$("#error-login-guardado").html(this.templateAlert({msj: "Información guardada inválida"}))
			

		},

		loading: function(loading) {
			if(loading) {
				$('#page-loading').show();
			}
			else {
				$('#page-loading').hide();
			}
		},
		deleteGuardado: function(evt) {
			evt.stopPropagation();
			var id = $(evt.currentTarget).data("id");
			Usuarios.get(id).destroy();
			this.render();
		}



		
	});

	return LoginView;
})