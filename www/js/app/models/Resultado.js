define([ 	
	'jquery',
 	'underscore',
 	'backbone',
 	'collections/Resultados'
],function($,_,Backbone) {

    var resultadoModel = Backbone.Model.extend({
        defaults:{
        	id: 0, // protocolo
        	fecha: "",
        	userID: 0, //documento
        	jpg: [],
        	pdf: "",
        	leido: false
        }

    });
    return resultadoModel;

});
