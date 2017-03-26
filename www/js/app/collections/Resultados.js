define([
    'backbone',
    'localstorage',
    'models/Resultado'
], function(Backbone,Store,resultadoModel){
    var resultadosCollection = Backbone.Collection.extend({

        initialize: function(models,options){
            this.userID = options["userID"];
            console.log("Init resultadosCollection - userID: "+this.userID);
            this.localStorage = new Store('iaca-shift-resultados-user_'+this.userID);

        },
        model: resultadoModel,

        // Define función de comparación para insertar de forma ordenada nuevos elementos
        comparator: function(model) {
            // Ordena por timestamp (generado al crear por fecha hora) de forma inversa (primero los más nuevos)
            return - model.get("timestamp");
        }



    });

    return resultadosCollection;
});