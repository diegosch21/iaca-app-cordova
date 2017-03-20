/*
*	VISTA NO USADA POR EL MOMENTO
*/

define([
	'text!templates/datos.html',
	'backbone'
], function (datosTemplate,Backbone) {

	var DatosView = Backbone.View.extend({

		//precompilo el template
		template: _.template(datosTemplate),

		initialize: function() {

		},

		render: function() {
			this.$el.html(this.template());
			return this;
		},

	});

	return DatosView;
});