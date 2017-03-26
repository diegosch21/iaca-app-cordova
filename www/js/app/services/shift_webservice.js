/**
 * [SINGLETON Service]
 * Provee métodos para realizar requests al webservice de Shift (usando JQuery AJAX), manejando el proocolo SOAP:
 *     - login de usuario
 *     - lista de resultados de usuario actual
 *     Define URLs, métodos, y bodies parametrizados para realizar los requests, y se encarga de parsear los responses
 */
/* globals device */
define([
    'jquery'
],function($) {
	// URL del web service
	var ws_url = "http://181.30.97.58/shift/lis/iaca/elis/s01.util.b2b.integracaoMobile.Webserver.cls";
	// var ws_url = "proxy/Shift_SOAP.php"; // para desarrollo

    // Defino métodos (SOAPAction)
    var ws_method = {
        login: 'http://www.shift.com.br/s01.util.b2b.integracaoMobile.Webserver.WsLogin',
        resultados: 'http://www.shift.com.br/s01.util.b2b.integracaoMobile.Webserver.WsListaExPaciente'
    };

    // Defino request bodies, parametrizados con placeholders
    var ws_request_body = {
        login:
            '<x:Envelope xmlns:x="http://schemas.xmlsoap.org/soap/envelope/" xmlns:www="http://www.shift.com.br">'+
                '<x:Header/>'+
                '<x:Body>'+
                    '<www:WsLogin>'+
                        '<www:pUserId>%user_id%</www:pUserId>'+
                        '<www:pSenha>%user_pass%</www:pSenha>'+
                        '<www:pTokenPN>%device_token%</www:pTokenPN>'+
                        '<www:pPlataforma>%platform%</www:pPlataforma>'+
                    '</www:WsLogin>'+
                '</x:Body>'+
            '</x:Envelope>',

        resultados:
            '<x:Envelope xmlns:x="http://schemas.xmlsoap.org/soap/envelope/" xmlns:www="http://www.shift.com.br">'+
                '<x:Header/>'+
                '<x:Body>'+
                    '<www:WsLogin>'+
                        '<www:pUserId>%user_id%</www:pUserId>'+
                        '<www:pSenha>%user_pass%</www:pSenha>'+
                    '</www:WsLogin>'+
                '</x:Body>'+
            '</x:Envelope>'
    };

	var ShiftWS = function() {

        console.log("ShiftWS: Init service. WS URL: "+ws_url);

        // Configuro objeto para poder lanzar y bindear eventos de backbone (capturados por Auth)
        _.extend(this, Backbone.Events);

        var _this = this;

        /**
         * Realiza el request al método wsLogin para credenciales validar usuario
         * @param  string user_id identificacion de usuario
         * @param  string user_pass contraseña de usuario
         * @param  object callbacks { success, error, complete } funciones a ejecutar dependiendo del resultado de la ejecucion
         */
        this.login = function(user_id,user_pass,callbacks) {

            // Chequeo existencia de funciones callbacks (y las defino si alguna no está)
            if (!callbacks) callbacks = {};
            if (!('success' in callbacks))
                callbacks.success = function(data){ console.log('Success: ',data); };
            if (!('error' in callbacks))
                callbacks.error = function(errormsj,errorcode){ console.log('Error: '+errormsj+" "+errorcode); };
            if (!('complete' in callbacks))
                callbacks.complete = function(){ console.log('Complete'); };

            // Obtengo platform y device token
            var platform = false, device_token = '';
            if (window.device) {
                device_token = device.uuid;
                platform = device.platform.toLowerCase();
                // Controlo que platform sea android o ios, en otro caso no se indica
                if (platform != 'android' && platform != 'ios') {
                    platform = false;
                }
            }

            console.log("Shift WS: Login... ["+user_id+" "+user_pass+" "+device_token+" "+platform+"]");

            var request_body = ws_request_body.login;
            // Reemplazo placeholders con parámetros
            request_body = request_body.replace("%user_id%",user_id);
            request_body = request_body.replace("%user_pass%",user_pass);
            request_body = request_body.replace("%device_token%",device_token);
            if (platform) {
                request_body = request_body.replace("%platform%",platform);
            }
            else {
                // Quito elemento plataforma (si lo dejo vacío, el login da error)
                request_body = request_body.replace("<www:pPlataforma>%platform%</www:pPlataforma>",'');
            }

            // Realizo el request
            $.ajax({
                url: ws_url,
                type: 'POST',
                contentType: 'text/xml; charset=utf-8',
                headers: {
                    'SOAPAction': ws_method.login
                },
                data: request_body,
                processData: false, // para que no modifique el request body
                dataType: 'xml' // formato retornado: jQuery parsea el XML para poder manipularlo como DOM
            })
            .done(function(resp_xml){
                var $login_result = $(resp_xml).find('WsLoginResult');
                if (!$login_result.length || !$login_result.find('sucesso').length) {
                    callbacks.error('Error en el servidor, intente de nuevo más tarde.',1);
                    return;
                }
                if ($login_result.find('sucesso').text() == 1) {
                    if ($login_result.find('tipo').text() == 'P') {
                        callbacks.success();
                    }
                    else {
                        // El usuario no es un paciente
                        callbacks.error('Tipo de usuario inválido para esta aplicación',3);
                    }
                }
                else {
                    callbacks.error('Usuario o clave inválidos',2);
                }
            })
            .fail(function( jqXHR, textStatus, errorThrown ) {
                console.log(jqXHR.responseText+" "+textStatus+" "+errorThrown);
                callbacks.error('No se pudo comunicar con el servidor. Verifique su conexión a internet.',0);
            })
            .always(function(){
                callbacks.complete();
            });
        };

        /**
         * Realiza el request al método wsLogin para obtener la lista de resultados de analisis y el nombre del paciente
         * @param object user model Usuario del que obtiene id y pass para hacer el reques
         * @param object callbacks { success, error, complete } funciones a ejecutar dependiendo del resultado de la ejecucion
         */
        this.getResultados = function(user,callbacks) {
            // Chequeo existencia de funciones callbacks (y las defino si alguna no está)
            if (!callbacks) callbacks = {};
            if (!('success' in callbacks))
                callbacks.success = function(data){ console.log('Success: ',data); };
            if (!('error' in callbacks))
                callbacks.error = function(errormsj,errorcode){ console.log('Error: '+errormsj+" "+errorcode); };
            if (!('complete' in callbacks))
                callbacks.complete = function(){ console.log('Complete'); };

            // Obtengo id y pass de usuario
            user_id = user.get("id");
            user_pass = user.get("pass");
            if (!user_id || !user_pass) {
                callbacks.error("Faltan credenciales de usuario",1);
                return;
            }

            var request_body = ws_request_body.resultados;
            // Reemplazo placeholders con parámetros
            request_body = request_body.replace("%user_id%",user_id);
            request_body = request_body.replace("%user_pass%",user_pass);

            console.log('Shift WS: getResultados... ['+user_id+' '+user_pass+']');

            // Realizo el request
            $.ajax({
                url: ws_url,
                type: 'POST',
                contentType: 'text/xml; charset=utf-8',
                headers: {
                    'SOAPAction': ws_method.resultados
                },
                data: request_body,
                processData: false, // para que no modifique el request body
                dataType: 'xml' // formato retornado: jQuery parsea el XML para poder manipularlo como DOM
            })
            .done(function(resp_xml){
                var $result = $(resp_xml).find('WsListaExPacienteResult');
                if (!$result.length || !$result.find('sucesso').length) {
                    callbacks.error('Error en el servidor, intente de nuevo más tarde.',1);
                    return;
                }
                if ($result.find('sucesso').text() == 1) {
                    var $paciente = $result.find('paciente');
                    if (!$paciente.length) {
                        // No debería pasar (respuesta mal formada)
                        callbacks.error('No se pudo obtener la lista de resultados actualizada',3);
                        return;
                    }
                    // Obtengo username
                    var $username = $paciente.find('nome');
                    if ($username.length) {
                        // Lanzo evento para setear nombre de usuario (capturado por service Auth)
                        _this.trigger("get_username",$username.text(),"ShiftWS: Se obtuvo nombre de usuario");
                    }
                    var $resultados = $paciente.find('exames > exame');
                    console.log("ShiftWS: cantidad total de resultados obtenidos: "+$resultados.length);
                    // Genero arreglo con data de los resultados de examenes, en el formato esperado por la view. Sólo incluye los que tengan URL de PDF
                    var resultados = procesarDataResultados($resultados);
                    console.log("ShiftWS: cantidad resultados procesados (con URL PDF): "+resultados.length);
                    callbacks.success(resultados);
                }
                else {
                    // Lanzo evento para logout (capturado por service Auth que realiza el logout)
                    _this.trigger("invalid_user","ShiftWS: Credenciales inválidas al obtener resultado");
                    // Error de credenciales de usuario
                    callbacks.error('No se pudo obtener la lista de resultados actualizada: Vuelva a iniciar sesión',2);
                    // ToDo: podría haber otros errores?
                }
            })
            .fail(function( jqXHR, textStatus, errorThrown ) {
                console.log(jqXHR.responseText+" "+textStatus+" "+errorThrown);
                callbacks.error('No se pudo obtener la lista de resultados actualizada. Verifique su conexión a internet.',0);
            })
            .always(function(){
                callbacks.complete();
            });
        };

        /**
         * Recorre el xml de los resultados obtenidos
         *     y genera arreglo de objetos con la data esperada por la vista.
         * Sólo incluye los resultados que contengan  URL de PDF
         */
        function procesarDataResultados($resultados) {
            var resultados = [], $result, $urlPDF;
            $resultados.each(function(index, resultado) {
                $result = $(resultado);
                $urlPDF = $result.children('urlPDF');
                if ($urlPDF.length) {
                    resultados.push({
                        id: $result.children('osNumero').text(),
                        fecha: $result.children('data').text(),
                        hora: $result.children('hora').text(),
                        nombre: $result.children('nomeExames').text(),
                        pdf: $urlPDF.text().replace("<![CDATA[", "").replace("]]>", "") // Quito tags CDATA
                    });
                }
            });
            return resultados;
        }

	};

	return new ShiftWS();  //SINGLETON
});