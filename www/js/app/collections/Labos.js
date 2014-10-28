define([
    'models/Labo'
], function(laboModel){
    var labosCollection = Backbone.Collection.extend({
        initialize: function(){
        
        },
        model: laboModel,

        url: 'data/labos.json',

        
    });

    return labosCollection;
});
