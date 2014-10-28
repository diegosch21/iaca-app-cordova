define([ 	
	'jquery',
 	'underscore',
 	'backbone'
],function($,_,Backbone) {

    var userModel = Backbone.Model.extend({
        defaults:{
        	id: 0,
        	name: "",
        	pass: ""
        }
    });
    return userModel;

});
