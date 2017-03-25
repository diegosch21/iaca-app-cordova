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

        comparator: function(model) {
            return -model.get("id");
        }



    });

    return resultadosCollection;
});