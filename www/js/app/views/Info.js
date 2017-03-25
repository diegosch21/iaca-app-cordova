/* global cordova */
define([
	'text!templates/info.html',
	'backbone'
], function (infoTemplate, Backbone) {

	var InfoView = Backbone.View.extend({

		//precompilo el template
		template: _.template(infoTemplate),

		events: {
			'touchend .external-link' : 'externalLink'
			// 'click .external-link' : 'externalLink'
		},

		initialize: function() { },

		render: function() {
			this.$el.html(this.template());
			return this;
		},
		externalLink: function(event) {
			console.log('pressBoton (dragging: '+window.dragging+')');
			if(!window.dragging) {
				var url= ($(event.currentTarget).data('href'));
				if (typeof cordova !== 'undefined' && cordova.InAppBrowser) {
					cordova.InAppBrowser.open(url, '_blank'); // usa plugin inAppBrowser
				}
				else {
					window.open(url,'_system');
				}
			}
		}

	});

	return InfoView;
});