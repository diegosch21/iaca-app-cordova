/*
*	VISTA NO USADA POR EL MOMENTO
*/

define([
	'text!templates/config.html'
], function (configTemplate) {

	var ConfigView = Backbone.View.extend({

		//precompilo el template
		template: _.template(configTemplate),

		initialize: function() {

		},

		render: function() {
			this.$el.html(this.template());
			return this;
		},

	});

	return ConfigView;
})