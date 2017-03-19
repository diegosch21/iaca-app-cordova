define([
	'jquery',
 	'underscore',
 	'backbone'
],function($,_,Backbone) {

    var userModel = Backbone.Model.extend({
        defaults:{
        	id: 0,
        	name: "",
        	pass: "",
            logueado: false,
        	notificar: true,
            notifID: 0
        }
    });
    return userModel;

});
