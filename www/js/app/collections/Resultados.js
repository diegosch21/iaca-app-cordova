define([
    'jquery',
    'underscore',
    'backbone',
    'models/Usuario',
    'localstorage',
    'models/Resultado'
], function($,_,Backbone,usuarioModel,Store,resultadoModel){
    var resultadosCollection = Backbone.Collection.extend({
        
        initialize: function(models,options){
            this.userID = options["userID"];
            console.log("Init resultadosCollection - userID: "+this.userID);
            this.localStorage = new Store('iaca-resultados-user_'+this.userID)
          
        },
        model: resultadoModel,

        comparator: function(model) {
            return -model.get("id"); 
        }



    });

    return resultadosCollection;
});