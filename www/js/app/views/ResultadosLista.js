/* global cordova */
define([
	'text!templates/resultados_lista.html',
	'text!templates/alert.html',
	'backbone',
	'services/authentication',
	'services/shift_webservice',
	'collections/Resultados',
	'views/ResultadoItem',
], function (resultadosListaTemplate,alertTemplate,Backbone,Auth,ShiftWS,ResultadosCollection,ResultadoItemView) {

	var ResultadosListaView = Backbone.View.extend({

		//precompilo el template
		template: _.template(resultadosListaTemplate),
		templateAlert: _.template(alertTemplate),

		initialize: function() {
			_.bindAll(this,"render","updateLista","getListaGuardada","renderList","removeItems","verMas","updateLogout");
			this.actualUserID = -1;
			this.actualItem = -1;
			this.$el.html(this.template());

			// Bind de eventos lanzados por service Auth
			// Logout de usuario (se debe quitar lista de resultados guardados)
			Auth.on("logout",this.updateLogout,this);
			// Seteo de nombre de usuario (para mostrarlo)
			Auth.on("change_username",function(){
				this.$el.find('#nombre-paciente').html(Auth.username);
			},this);
			// Creo scroller para mostrar las imagenes [deshabilitado: no hay más imágenes]
			// this.crearScrollerImgs();

		},
		events: {
			'touchstart #ver-mas' : 	'verMas',
			'touchstart #update' : 'updateUsuario',
			'touchstart #boton-acceso-resultados-anteriores.external-link' : 'openConsultaResultadosAnteriores'
			// 'click #ver-mas' : 	'verMas',
			// 'click #update' : 'updateUsuario',
			// 'click #boton-acceso-resultados-anteriores.external-link' : 'openConsultaResultadosAnteriores'
		},

		render: function() {
			console.log("Render ResultadosListaView");
			//console.log(this.itemsViews);

			this.$el.find('#update').removeClass('hide');
			this.$el.find('#error-get-results').html('');
			this.updateUsuario();
			// El template se renderiza en initialize.

			return this;
		},

		itemsViews: {},

		renderList: function(reset,fin) {
			console.log("Render list...");
			if(reset)
				this.removeItems();
			if (this.resultadosGuardados.length > 0) {
				var ult = this.resultadosGuardados.length-1;
				if(fin && fin < ult)
					ult = fin;
				var pri = this.actualItem +1;
				console.log("Primer item: #"+pri+" Último item: #"+ult);

				//var hayImagenes = false; // El server no entrega más link a imagenes

				for (var i = pri; i <=ult; i++) {
					var result = this.resultadosGuardados.at(i);
					//console.log("Creo view resultado, id: "+result.id);
					var view = new ResultadoItemView({model: result, scrollerImgs: this.scrollerImgs});
					this.$el.find('#lista-resultados').append(view.render().el);
					this.itemsViews[result.id] = view;
					this.actualItem = i;
					// El server no entrega más link a imagenes
					//hayImagenes = hayImagenes || result.get("jpg").length > 0;
				}
				// El server no entrega más link a imagenes - en template no está más link a ver-imagenes
				// if(hayImagenes) {
				// 	this.$el.find('.ver-imagenes').show();
				// }
				// else {
				// 	this.$el.find('.ver-imagenes').hide();
				// }

				// No muestra mensaje de no resultados
				this.$el.find('#no-results').hide();
			}
			else {
				console.log("No hay resultados");
				this.$el.find('#no-results').show();
			}

			if(fin && fin < this.resultadosGuardados.length-1) {
				this.$el.find("#ver-mas-results").show();
			}
			else {
				this.$el.find("#ver-mas-results").hide();
			}

			var self = this;
			setTimeout(function() {
				if(self.scroller)
					self.scroller.refresh();
			}, 1000);

		},
		removeItems: function() {
			console.log("Elimino itemsViews");
			$.each(this.itemsViews, function(index, item) {
				item.remove();
			});
			this.itemsViews = {};
			this.actualItem = -1;
		},

		/*	UPDATE USUARIO
		*	Si se desloguea usuario:
		*		elimina coleccion resultadosGuardados,
		*		remove itemsViews, render sin nombre y redirecciona
		*	Si hay nuevo usuario logueado (cambia actualUserID):
		*		crea coleccion resultadosGuardados
		*		render con nombre, llama a getListaGuardada (fetch de resultadosGuardados),
		*	Si no cambió el usuario
		*		sólo actualiza lista
		*/
		updateUsuario: function() {
			console.log("Update usuario...");
			if(Auth.logueado) {
				var user_id = Auth.getUserId();
				// Si tiene nombre de usuario lo muestra
				this.$el.find('#nombre-paciente').html(Auth.username);
				// Si cambio el usuario, creo coleccion y escucho eventos
				if(this.actualUserID != user_id) {
					console.log("Cambió usuario: render ResultadosLista de user "+user_id);
					this.actualUserID = user_id;
					// Crea colección de resultados vacía
					this.resultadosGuardados = new ResultadosCollection([],{userID: user_id});
					//this.listenTo(this.resultadosGuardados, 'add', this.addResultado);
					// Intenta obtener resultados previamente guardados en local storage
					this.getListaGuardada();
				}
				else {
					this.updateLista();
				}
			}
			else {
				this.updateLogout();
			}
		},
		updateLogout: function() {
			if(!Auth.logueado || this.actualUserID != Auth.getUserId()) {
				console.log("ResultadosLista: Deslogueado - seteo lista resultados vacía");
				this.resultadosGuardados = null;
				this.actualUserID = -1;
				this.removeItems();
				this.$el.find('#nombre-paciente').html("");
				this.$el.find('#update').addClass('hide');
			}
		},
		getListaGuardada: function() {
			var self = this;
			console.log("Obtengo resultados guardados...");
			if(this.showing)
				this.loading(true);
			// Intenta obtener resultados guardados en storage (si aún no hay, igual ejecuta callback success)
			this.resultadosGuardados.fetch({
				success: function() {
					self.renderList(true,9); // Renderiza los 9 últimos resultados que estaban guardados
					self.updateLista(); // Hace request al server para obtener resultados
				},
				error: function(collection, response) { // otro param: options
					console.log(response);
				},
				complete: function() {
					self.loading(false);
				}
			});

		},
		updateLista: function() {
			console.log("Actualizo lista de resultados...");
			this.updating(true);
			var _this = this;

			ShiftWS.getResultados(Auth.user,{
				// Defino callbacks luego de obtener los resultados del server (o fallar)
				success: function(resultados) {
					/** resultados es un arreglo con la lista de resultados obtenidos, parseado por shift_webservice
					 *   (ordenado del más reciente al más viejo)
					 * Formato de un resultado:
					 * 	{
					 * 		id: codigo de la orden de servicio del resultado,
					 * 		fecha: fecha (formato dd/mm/yyyy),
					 * 		hora: hora (formato hh:mm:ss),
					 * 		nombre: nombre examen/es (codigos)
					 * 		pdf: url pdf
					 * 	}
					 */
					var hayNuevos = false, result_guardado, new_result;
					resultados.forEach(function(resultado){
						// Si en la colecc no está el result de ese protocolo (id) lo creo y guardo en storage
						result_guardado = _this.resultadosGuardados.get(resultado['id']);
						if(!result_guardado) {
							hayNuevos = true;
							// Crea y persiste en localstorage el nuevo resultado
							new_result = _this.resultadosGuardados.create(resultado);
							// console.log("Nuevo resultado: "+JSON.stringify(new_result));
						}
						// Si ya estaba, chequeo si cambió URL PDF (y marco como no leído)
						else {
							if (resultado['pdf'] != result_guardado.get('pdf')) {
								result_guardado.save({
									pdf: resultado['pdf'], leido: false
								});
								hayNuevos = true;
								// console.log("Resultado con URL PDF modificada: "+JSON.stringify(new_result));
							}
						}
					});

					if(hayNuevos) {
						console.log("Hay nuevos resultados");
						_this.renderList(true,9); // Renderiza los 9 últimos resultados
					}
					else { //si no hay nuevos resultados no vuelvo a hacer renderList
						console.log("No hay nuevos resultados");
					}
				},
				error: function(errormsj,errorcode) {
					console.log("Error getResultados: "+errormsj+" "+errorcode);
					if (window.deviceready && window.plugins && window.plugins.toast) {
						window.plugins.toast.showLongCenter(error);
					}
					else {
						_this.$el.find('#error-get-results').html(_this.templateAlert({msj: errormsj}));
					}
				},
				complete: function() {
					_this.updating(false);
					//console.log(self.itemsViews);
					_.each(_this.itemsViews, function(item) { // otro param: key
						item.delegateEvents();
					//	console.log("delegateEvents "+item);
					});
				}
			});
		},
		loading: function(loading) {

			if(loading) {
				$('#loading-results').show();
			}
			else {
				$('#loading-results').hide();
			}
		},
		updating: function(updating) {
			if(updating) {
				this.$el.find('#updating-results').slideDown('fast');
			}
			else {
				this.$el.find('#updating-results').slideUp('slow');
			}
		},

		verMas: function() {
			this.renderList(false,this.actualItem+10);
		},

		// Abre link para consulta de resultados anteriores en browser
		openConsultaResultadosAnteriores: function(event) {
			var url= ($(event.currentTarget).data('href'));
			if (typeof cordova !== 'undefined' && cordova.InAppBrowser) {
				// Usa plugin inAppBrowser pero abre browser sistema. En Android, con boton back cierra el browser
				// No uso el browser in-app porque no permite descargar PDF
				// 	(y no puedo obtener link de descarga y usar método de lib/PDFDownloader, porque necesito la cookie)
				cordova.InAppBrowser.open(url, '_system');
			}
			else {
				window.open(url,'_system');
			}
		},

		/** Método para mostrar imagenes en un scroller - deshabilitado ya que no hay más img de resultados.
		 *  Requiere dependencia iscroll */
		// crearScrollerImgs: function() {
		// 	$('#close-imgs, #back-imgs').on('touchstart',function() {
		// 		$('#imgs-wrapper').fadeOut();
		// 	});
		// 	if(this.scrollerImgs)
		// 		this.scrollerImgs.destroy();
		// 	this.scrollerImgs = new IScroll('#imgs-wrapper', {
		// 		zoom: true,
		// 		scrollX: true,
		// 		scrollY: true,
		// 		mouseWheel: true,
		// 		wheelAction: 'zoom',
		// 	    scrollbars: true,
		// 	    interactiveScrollbars: true,
		// 		fadeScrollbars: true,
		// 		zoomMin: 0.25
		// 		//zoomMax: 2
		// 	});
		// },
	});

	return ResultadosListaView;
});