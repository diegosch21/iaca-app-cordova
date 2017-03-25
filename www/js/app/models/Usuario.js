define(['backbone'],function(Backbone) {

    var userModel = Backbone.Model.extend({
        defaults:{
        	id: 0, // identificacion de usuario en sistema Shift
        	pass: "", // contraseña del usuario
            name: "", // Nombre y apellido del usuario (en sistema Shift se obtiene de la lista de resultados)
            // notificar: true, // opción para recibir o no notificaciones (no implementado)
            // notifID: 0 // id de registro de dispositivo para notificaciones (no implementado)
        }
    });
    return userModel;

});
