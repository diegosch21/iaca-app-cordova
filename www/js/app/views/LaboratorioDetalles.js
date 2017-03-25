/* global cordova, requirejs */
define([
	'text!templates/laboratorio_detalles.html',
	'backbone'
], function (laboTemplate,Backbone) {

	var LaboratoriosView = Backbone.View.extend({

		//precompilo el template
		template: _.template(laboTemplate),

		events: {
			'touchend #back' : 'botonBack',
			// 'click #back' : 'botonBack',
			'touchstart .external-link' : 'externalLink',
			// 'click .external-link' : 'externalLink',
			'touchstart #reload' : 'reloadMapa'
		},

		initialize: function() { // options
			//this.mapa = options['mapa'];
		},
		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			// self= this;
			// setTimeout(function() {
			// 	self.mapaLabo();
			// },0);
			this.mapaLabo();
            return this;
		},
		mapaLabo: function() {
			var self = this;
			this.$el.find('#loading-map').show();
			require(['services/gmaps'],
				function(mapa) {
					self.$el.find('#reload').hide();
					self.$el.find('#loading-map').hide();
					mapa.setCenter(self.model.get('lat'),self.model.get('lng'));
					mapa.setZoom(14);
					mapa.render(self.$('#map_canvas')[0]);
					mapa.setMarkers([self.model.toJSON()]);
				},
				function() {
					if (window.deviceready && window.plugins && window.plugins.toast) {
    					window.plugins.toast.showLongBottom('No se puede cargar el mapa: verifique la conexión a internet');
    				}
    				self.$el.find('#loading-map').hide();
				}
			);
		},
		botonBack: function() {
			Backbone.history.navigate('laboratorios',true);
		},
		externalLink: function(event) {
			var url= ($(event.currentTarget).data('href'));
			if (typeof cordova !== 'undefined' && cordova.InAppBrowser) {
				cordova.InAppBrowser.open(url, '_blank'); // usa plugin inAppBrowser
			}
			else {
				window.open(url,'_system');
			}
		},
		reloadMapa: function() {
			console.log("ReloadMapa");
			requirejs.undef('services/gmaps');
			this.mapaLabo();
		}

	});

	return LaboratoriosView;
});