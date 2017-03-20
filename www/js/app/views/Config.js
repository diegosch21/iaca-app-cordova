/*
*	VISTA NO USADA POR EL MOMENTO
*/

define([
	'text!templates/config.html',
	'backbone'
], function (configTemplate,Backbone) {

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
});