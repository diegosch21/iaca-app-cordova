define([
	'text!templates/header.html',
	'jquery',
	'underscore',
	'models/Sesion',
	'backbone'
], function (headerTemplate,$,_,Sesion,Backbone) {

	var HeaderView = Backbone.View.extend({

		//precompilo el template
		template: _.template(headerTemplate),

		initialize: function() {
			this.menuItem = "inicio";
			this.checkUser();
			this.render();

			Sesion.on("change:timestamp",this.updateUser,this);
		},

		events: {
			'touchstart #logout' 	: 'logout',
			// 'click #logout' 	: 'logout'
			'click a' : 'disableClick',
			//'touchstart a.toggle-dropdown'	: 'dropdownMenu',
			'touchstart a.classic-link' : 	'classicLink',
			'touchend ul.dropdown-menu' : 'closeDropdown',
			'touchend .external-link' : 'externalLink',
			'touchend .back' : 'back'
		},


		render: function() {
			this.$el.html(this.template({logueado: this.logueado, user: this.username}));
			return this;
		},

		checkUser: function() {
			this.logueado = Sesion.get("logueado");
			if(this.logueado)
				this.username = Sesion.get("username");
			else
				this.username = "";
		},

		updateUser: function() {
			console.log("Update User..");
			this.checkUser();
			this.render();
			this.selectMenuItem(this.menuItem);
		},

		selectMenuItem: function (menuItem) {
			this.menuItem = menuItem;
			$('#app-header-menu li').removeClass('activo');
			$('#menu-principal-xs span.menu-principal-xs-activo').hide();
	        if (menuItem) {
	            $('#menuitem-' + menuItem).addClass('activo');
	            $('#menu-principal-xs-'+ menuItem).show();
        	}
        	var actualURL = Backbone.history.fragment;
        	console.log(actualURL);
        	if (actualURL == 'home' || actualURL === '' ) {
        		$('li.back').addClass('hidden');
        		$('li.menu-profesional').removeClass('col-xs-11').addClass('col-xs-12');
        	}
        	else {
        		$('li.back').removeClass('hidden');
        		$('li.menu-profesional').removeClass('col-xs-12').addClass('col-xs-11');
        	}
    	},
    	logout: function(evt) {
    		if(evt)
    			evt.preventDefault();
    		Sesion.logout();
    		if (window.deviceready) {
    			try {
    				window.plugins.toast.showShortCenter('Usuario deslogueado');
    			}
    			catch(err) {
    				console.log(err);
    			}
    		}
    		Backbone.history.navigate("home",true);
    	},
    	dropdownMenu: function(evt) {
    		if(evt)
    			evt.preventDefault();
    		var dropdown= ($(evt.currentTarget).data('dropdown'));
    		console.log("Toggle dropdown "+dropdown);
    		$('#'+dropdown).dropdown('toggle');
    	},
    	classicLink: function(evt) {
    		var url= ($(evt.currentTarget).attr('href'));
			console.log("touchstart classic-link href:"+url);
			Backbone.history.navigate(url,true);
			//evt.preventDefault();
    	},
    	closeDropdown: function(evt) {
    		console.log('Close dropdown '+evt.currentTarget.id);
    		$("#"+evt.currentTarget.id).dropdown('toggle');
    		evt.preventDefault();
    	},
    	disableClick: function(evt) {
    		console.log('click');
    		evt.preventDefault();
    	},
    	externalLink: function(event) {
			var url= ($(event.currentTarget).data('href'));
			window.open(url, '_system');
		},
		back: function() {
			var actualURL = Backbone.history.fragment;
			console.log('actualURL: '+actualURL);
			// Desde laboratorios siempre voy a home (para evitar que si vi vengo de un lab vuelva a ese)
			// Desde login también va a home
			if (actualURL == 'laboratorios' || actualURL == 'resultados' || actualURL.substring(0, 5) == 'login' || actualURL == 'info') {
				console.log('Go to home');
				Backbone.history.navigate("home",true);
			}
			// Si es home, no hago nada
			// else if (actualURL == 'home' || actualURL === '' ) {	}
			// En cualquier otro lado, voy atrás
			else {
				console.log('window.history.back()');
				window.history.back();
			}
		}

	});

	return HeaderView;
});