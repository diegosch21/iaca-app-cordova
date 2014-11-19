define([
	'text!templates/laboratorio_detalles.html',
	//'lib/gmaps'
], function (laboTemplate) {
	
	var LaboratoriosView = Backbone.View.extend({

		//precompilo el template
		template: _.template(laboTemplate),

		events: {
			'touchend #back' : 'botonBack',
			// 'click #back' : 'botonBack',
			'touchstart .external-link' : 'externalLink',
			// 'click .external-link' : 'externalLink',
			'touchstart #reload' : 'mapaLabo',
			'touchstart #reload' : 'reloadMapa'
		},

		initialize: function(options) {
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
			self = this;
			this.$el.find('#loading-map').show();
			require(['lib/gmaps'], 
				function(mapa) {
					self.$el.find('#reload').hide();
					self.$el.find('#loading-map').hide();
					mapa.setCenter(self.model.get('lat'),self.model.get('lng'));
					mapa.setZoom(14);
					mapa.render(self.$('#map_canvas')[0]);
					mapa.setMarkers([self.model.toJSON()]);
				},
				function(err) {
					if (window.deviceready && window.plugins && window.plugins.toast) { 
    					window.plugins.toast.showLongBottom('No se puede cargar el mapa: verifique la conexión a internet');
    				}
    				self.$el.find('#loading-map').hide();
				}
			);	
		},
		botonBack: function(e) {
			Backbone.history.navigate('laboratorios',true);
		},
		externalLink: function(event) {
			var url= ($(event.currentTarget).data('href'));
			window.open(url, '_system');
		},
		reloadMapa: function() {
			console.log("ReloadMapa");
			requirejs.undef('lib/gmaps');
			this.mapaLabo();
		}

	});

	return LaboratoriosView;
})