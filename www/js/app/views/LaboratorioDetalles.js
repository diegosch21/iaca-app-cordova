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
			'click #reload' : 'mapaLabo'
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
			require(['lib/gmaps'], function(mapa) {
				$('#reload').hide();
				mapa.setCenter(self.model.get('lat'),self.model.get('lng'));
				mapa.setZoom(14);
				mapa.render(self.$('#map_canvas')[0]);
				mapa.setMarkers([self.model.toJSON()]);
			});	
		},
		botonBack: function(e) {
			Backbone.history.navigate('laboratorios',true);
		},
		externalLink: function(event) {
			var url= ($(event.currentTarget).data('href'));
			window.open(url, '_system');
		}

	});

	return LaboratoriosView;
})