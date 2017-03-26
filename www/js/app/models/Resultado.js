define(['backbone'],function(Backbone) {

    var resultadoModel = Backbone.Model.extend({
        defaults:{
        	id: 0, // orden de servicio (osNumero)
        	fecha: "",
            hora: "",
            nombre: "",
        	pdf: false, // URL a PDF
        	leido: false,
            timestamp: 0 // usado para ordenamiento
        },

        // método invocado al crear resultado: genera timestamp
        initialize: function(attr){
            // Genero timestamp
            this.set('timestamp',getTimestamp(attr.fecha,attr.hora));
        },
    });

    function getTimestamp(fecha,hora) {
        var d = fecha.substring(0,2),
            m = fecha.substring(3,5),
            y = fecha.substring(6,10),
            H = hora.substring(0,2),
            M = hora.substring(3,5),
            S = hora.substring(6,8),
            date = new Date(y, m-1, d, H, M, S);
        return date.getTime();
    }

    return resultadoModel;

});
