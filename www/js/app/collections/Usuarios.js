define([
    'jquery',
    'underscore',
    'backbone',
    'models/Usuario',
    'localstorage'
], function($,_,Backbone,usuarioModel,Store){
    var usuariosCollection = Backbone.Collection.extend({
        initialize: function(){
            console.log("Init usuariosCollection: fetch");
            this.fetch();
        },
        model: usuarioModel,

        localStorage: new Store('iaca-usuarios')

    });

    //SINGLETON
    return new usuariosCollection;
});