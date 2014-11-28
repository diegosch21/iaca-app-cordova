define([
	'text!templates/home.html',
	'models/Sesion'
], function (homeTemplate,Sesion) {
	
	var HomeView = Backbone.View.extend({

		//precompilo el template
		template: _.template(homeTemplate),

		events: {
			'touchend .home-boton' : 'pressBoton',
			// 'click .home-boton' : 'pressBoton'
			'touchend .external-link' : 'externalLink'
		},

		initialize: function() {

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
			window.open(url, '_system');
		}
		
	});

	return HomeView;
})