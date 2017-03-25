/* global device, appAvailability */
define([
	'text!templates/home.html',
	'backbone'
], function (homeTemplate,Backbone) {

	var HomeView = Backbone.View.extend({

		//precompilo el template
		template: _.template(homeTemplate),

		events: {
			'touchend .home-boton' : 'pressBoton',
			// 'click .home-boton' : 'pressBoton'
			'touchend .external-link' : 'externalLink'
		},

		initialize: function() {
			// Evento deviceready: cambio links twitter y fb (en home): para abrir apps
			document.addEventListener("deviceready", this.linksSocial, false);
		},
		render: function() {
			this.$el.html(this.template());
			return this;
		},
		pressBoton: function(e) {
			console.log('pressBoton (dragging: '+window.dragging+')');
			if(!window.dragging)
				Backbone.history.navigate($(e.currentTarget).data('href'),true);
		},
		externalLink: function(event) {
			var url= ($(event.currentTarget).data('href'));
			console.log(url);
			window.open(url, '_system');
		},
		linksSocial: function() {
			var platform = device.platform;
			if (platform == 'android' || platform == 'Android') {
				console.log('modifico links social Android');
				appAvailability.check(
		    		'com.facebook.katana',
		    		function() { //success
		    			console.log('cambio link fb');
		    			$('#link-fb').data('href','fb://page/426705210757924');
		    		},
		    		function() {
		    			console.log('fb no instalado');
		    			// error: dejo link como está
		    		}
		    	);
		    	appAvailability.check(
		    		'com.twitter.android',
		    		function() { //success
		    			console.log('cambio link tw');
		    			$('#link-tw').data('href','twitter://user?screen_name=iacalab');
		    		},
		    		function() {
		    			console.log('tw no instalado');
		    			// error: dejo link como está
		    		}
		    	);

			}
			else if (platform == "iOS") {
				console.log('modifico links social iOS');
				appAvailability.check(
		    		'fb://',
		    		function() { //success
		    			console.log('cambio link fb');
		    			$('#link-fb').data('href','fb://profile/426705210757924');
		    		},
		    		function() {
		    			console.log('fb no instalado');
		    			// error: dejo link como está
		    		}
		    	);
		    	appAvailability.check(
		    		'twitter://',
		    		function() { //success
		    			console.log('cambio link tw');
		    			$('#link-tw').data('href','twitter://user?screen_name=iacalab');
		    		},
		    		function() {
		    			console.log('tw no instalado');
		    			// error: dejo link como está
		    		}
		    	);
			}
		}

	});

	return HomeView;
});