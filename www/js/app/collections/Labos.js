define([
    'models/Labo',
    'backbone',
], function(laboModel,Backbone){
    var labosCollection = Backbone.Collection.extend({
        initialize: function(){

        },
        model: laboModel,

        url: 'data/labos.json',

    });

    return labosCollection;
});
