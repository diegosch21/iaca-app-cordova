/**
 * [SINGLETON Service]
 * Maneja estado de usuario actual, mantiendo referencia al mismo [reemplaza viejo model Sesion]
 *     (se necesita user y pass para requests a web service)
 * Obtiene de localstorage id de usuario de login previo
 * Realiza el login de usuario (utilizando shift_webservice).
 */
define([
    'underscore',
    'backbone',
    'services/shift_webservice',
    'collections/Usuarios'
], function(_,Backbone,ShiftWS, Usuarios) {

    var STORAGE_KEY = 'iaca-shift-user-logueado';

    var Auth = function() {

        // Inicializo datos del singleton
        this.logueado = false;
        this.user = null; // Referencia a model Usuario
        this.username = ''; // Shortcut a nombre de usuario (accedido desde HeaderView)

        /* Defino métodos privados */

        // Función privada, para inicializar "Sesión" (invocada al final del modulo, luego de haber definido todas las funciones)
        //  Intenta obtener id de usuario previamente logueado (en ejecuciones anteriores de la app)
        //  Si está, setea usuario
        //  Bindea eventos de ShiftWS.
        var init = function() {
            console.log("Auth: Init service");

            // Consulta si hay id de usuario previamente logueado. Si está, setea logueado
            if (localStorage.getItem(STORAGE_KEY)) {
                var user_id = localStorage.getItem(STORAGE_KEY);
                console.log("Auth.init: Usuario id "+user_id+" previamente logueado");
                var user = Usuarios.get(user_id);
                if(user) {
                    // Setea usuario logueado
                    this.user = user;
                    this.logueado = true;
                    // Si tenía el username, lo setea
                    if (user.get("name")) {
                        this.username = user.get("name");
                    }
                    console.log("Auth.init: Usuario logueado: "+JSON.stringify(user));
                    // Lanza evento (capturado por vista header para actualizarse)
                    this.trigger("login","Auth: Login previo");
                }
                else {
                    console.log("Auth.init: No está la data del usuario previamente logueado");
                    // Quito item del storage
                    localStorage.removeItem(STORAGE_KEY);
                }
            }

            // Bind de eventos lanzados por service Shift
            // error al obtener resultados (por usuario inválido): desloguea
            ShiftWS.on("invalid_user",this.logout,this);
            // obtiene nombre usuario al obtener resultados. Acá actualiza usuario. (param: username, eventName)
            ShiftWS.on("get_username",this.setUserName,this);

        };

        /**
         * Crea o actualiza usuario (en la coleccion Usuarios), marca estado logueado
         *     y guarda id del usuario en localstorage para futuras ejecuciones de la app
         * [Método privado]
         */
        var setUsuario = function(user_id,user_pass) {
            console.log('Auth: setUsuario');

            // Chequeo si el usuario ya estaba guardado
            var user = Usuarios.get(user_id);
            if(!user) {
                // Usuario no existía: crea modelo y lo setea como actual
                console.log("Auth.setUsuario: Creo usuario id:"+user_id);
                // Crea model usuario y persiste en localstorage
                this.user = Usuarios.create({id: user_id, pass: user_pass});
            }
            else {
                console.log("Auth.setUsuario: El usuario "+user_id+" ya existe en la colección");
                this.user = user;
                // Actualizo password por si cambió
                if (user.get("pass") != user_pass) {
                    user.save({"pass":user_pass});
                }
            }
            if (this.user.get("name")) {
                this.username = user.get("name");
            }
            else {
                this.username = '';
            }
            // Marco flag logueado
            this.logueado = true;
            // Seteo id de usuario logueado en storage (para futuras ejecuciones de la app)
            localStorage.setItem(STORAGE_KEY,user_id);
            // Lanza evento (capturado por vista header para actualizarse)
            this.trigger("login","Auth: Login.setUsuario");
        };

        // Bindeo this en funciones init y setUsuario
        setUsuario = _.bind(setUsuario,this);
        init = _.bind(init,this);

        // Configuro objeto para poder lanzar y bindear eventos de backbone (capturados por HeaderView)
        _.extend(this, Backbone.Events);

        /* Defino los métodos que ofrece el servicio */

        /** Login: hace request a Shift con datos de usuario.
         *      Si es OK, hace request a lista resultados para precargar data y obtener nombre de usuario, invocando setUsuario
         *      Si es erroneo, informa
         * @param  string user_id identificacion de usuario
         * @param  string user_pass contraseña de usuario
         * @param  object callbacks { success, error, complete } funciones a ejecutar dependiendo del resultado de la ejecucion
         */
        this.login = function(user_id,user_pass,callbacks) {
            console.log("Auth: Login...");

            // Chequeo existencia de funciones callbacks (y las defino si alguna no está)
            if (!callbacks) callbacks = {};
            if (!('success' in callbacks))
                callbacks.success = function(data){ console.log('Success: '+data); };
            if (!('error' in callbacks))
                callbacks.error = function(errormsj,errorcode){ console.log('Error: '+errormsj+" "+errorcode); };
            if (!('complete' in callbacks))
                callbacks.complete = function(){ console.log('Complete'); };

            // Realizo request a Shift.
            ShiftWS.login(user_id,user_pass,
                {   // Defino nuevos callbacks que ejecutan los recibidos en parametro
                    success: function() { // No hay data recibida en el login
                        console.log('Auth.login: ok');
                        setUsuario(user_id,user_pass);
                        // Ejecuto callback recibido
                        callbacks.success();
                    },
                    error: function(errormsj,errorcode) {
                        console.log('Auth.login: error');
                        // Ejecuto callback recibido
                        callbacks.error(errormsj,errorcode);
                    },
                    complete: function() {
                        // Ejecuto callback recibido
                        callbacks.complete();
                    }
                });
            // ToDo luego de login por primera vez (desde iniciar sesion), forzar redirect a lista de resultados donde se va a obtener nombre de usuario
            // Si era usuario previamente logueado ya deberia tener el nombre
        };

        this.getUserId = function() {
            if (this.user)
                return this.user.get("id");
            else return null;
        };

        this.setUserName = function(username,eventName) {
            console.log("Auth: setUserName");
            if (eventName) {
                console.log("Evento: "+eventName);
            }
            if (this.username != username) {
                this.user.save({"name":username});
                this.username = username;
                // Lanza evento (capturado por vista header para actualizarse)
                this.trigger("change_username","Auth: setUserName");
            }
        };

        /** Logout: quita usuario actual en sesion y quita id de localstorage (sin eliminar data del usuario) */
        this.logout = function(eventName) {
            console.log("Auth: logout");
            if (eventName) {
                console.log("Evento: "+eventName);
            }
            // Desmarco flag logueado, quito referencia a usuario
            this.logueado = false;
            this.user = null;
            this.username = '';
            localStorage.removeItem(STORAGE_KEY);
            // Lanza evento (capturado por vista Header y ResultadoLista para actualizarse)
            this.trigger("logout","Auth: Logout");
        };

        /** Inicializo sesión */
        init();
    };

    return new Auth();  //SINGLETON
});