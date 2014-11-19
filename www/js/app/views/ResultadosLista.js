define([
	'text!templates/resultados_lista.html',
	'models/Sesion',
	'text!templates/alert.html',
	'collections/Resultados',
	'views/ResultadoItem',
	'iscroll'
], function (resultadosListaTemplate,Sesion,alertTemplate,ResultadosCollection,ResultadoItem,IScroll) {
	
	var ResultadosListaView = Backbone.View.extend({

		//precompilo el template
		template: _.template(resultadosListaTemplate),
		templateAlert: _.template(alertTemplate),

		initialize: function() {
			_.bindAll(this,"render","updateLista","getListaGuardada","renderList","removeItems","verMas","updateLogout");
			this.actualUserID = -1;
			this.actualItem = -1;
			this.$el.html(this.template());
			
			//Sesion.on("change:timestamp",this.updateUsuario,this);
			Sesion.on("change:timestamp",this.updateLogout,this);
			// Creo scroller para mostrar las imagenes	
			this.crearScrollerImgs();

		},
		events: {
			'touchstart #ver-mas' : 	'verMas',
			'touchstart #update' : 'updateUsuario'
			// 'click #ver-mas' : 	'verMas',
			// 'click #update' : 'updateUsuario'
		},

		render: function() {
			console.log("Render ResultadosListaView");
			//console.log(this.itemsViews);
			this.updateUsuario();
			// El template se renderiza en initialize. 

			return this;
		},

		itemsViews: {},

		renderList: function(reset,fin) {
			console.log("Render list...");
			if(reset)
				this.removeItems();
			var ult = this.resultadosGuardados.length-1;
			if(fin && fin < ult)
				ult = fin;
			var pri = this.actualItem +1;
			console.log("Primer item: #"+pri+" Último item: #"+ult);

			for (var i = pri; i <=ult; i++) {
				var result = this.resultadosGuardados.at(i);
				//console.log("Creo view resultado, id: "+result.id);
				var view = new ResultadoItem({model: result, scrollerImgs: this.scrollerImgs});
				this.$el.find('#lista-resultados').append(view.render().el);
				this.itemsViews[result.id] = view;
				this.actualItem = i;
			};
			if(this.resultadosGuardados.length>0) 
				this.$el.find('#no-results').hide();
			else
				this.$el.find('#no-results').show();

			if(fin && fin < this.resultadosGuardados.length-1) {
				this.$el.find("#ver-mas-results").show();
			}
			else
				this.$el.find("#ver-mas-results").hide();
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
			console.log("Update usuario...")
			if(Sesion.get("logueado")) {
				var id = Sesion.get('userID');
				// Si cambio el usuario, creo coleccion y escucho eventos
				if(this.actualUserID != id) {
					console.log("Cambió usuario: render ResultadosLista de "+Sesion.get("username"));
					this.actualUserID = id;
					this.resultadosGuardados = new ResultadosCollection([],{userID: Sesion.get('userID')}); 
					//this.listenTo(this.resultadosGuardados, 'add', this.addResultado);
					this.$el.find('#nombre-paciente').html(Sesion.get("username"));
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
			if(!Sesion.get("logueado") || this.actualUserID != Sesion.get('userID')) {
				console.log("Deslogueado - lista resultados vacía");
					//this.stopListening(this.resultadosGuardados);
				this.resultadosGuardados = null;
				this.actualUserID = -1;
				this.removeItems();
				this.$el.find('#nombre-paciente').html("");
			}
		},
		getListaGuardada: function() {
			var self = this;
			console.log("Obtengo resultados guardados...")
			if(this.showing)
				this.loading(true);
			this.resultadosGuardados.fetch({
				success: function() {
					self.renderList(true,9);
					self.updateLista();
				},
				error: function(collection, response, options) {
					console.log(response);
				},
				complete: function() {
					self.loading(false);
				}
			});

		},
		updateLista: function() {
			console.log("Actualizo lista de resultados...")
			this.updating(true);
			var self = this;
			Sesion.getResultados({
				success: function(data) {
					if(data.list != null) {
						console.log("Cantidad resultados: "+data.list.length);
						var result = {}; 
						var hayNuevo = false;  //si no hay nuevo no vuelvo a hacer renderList 
						for (var i = data.list.length - 1; i >= 0; i--) {
							var elem = data.list[i];
							// Si en la colecc no está el result de ese protocolo (id) lo creo y guardo en storage
							if(!self.resultadosGuardados.get(elem['protocolo'])) {
								// cambio nombres de algunas keys
								_.each(elem, function(value, key) {
								    key = self.mapKeysResultado[key] || key;
								    result[key] = value;
								});
								var fecha = (result['fecha'].replace(/(\d{2})(\d{2})(\d{2})/,'$1-$2-$3'));
								result['fecha'] = fecha;
								console.log("Nuevo resultado: ")
								console.log(result);
								self.resultadosGuardados.create(result);
								hayNuevo = true;
							}
							// Si ya estaba actualizo direccion pdf e imgs
							else {
								self.resultadosGuardados.get(elem['protocolo']).save({
									pdf: elem['pdf'],
									jpg: elem['jpg']
								});
							}
						}
						if(hayNuevo)
							self.renderList(true,9);
					}
				},
				error: function(error) {
					console.log(error);
					if (window.deviceready && window.plugins && window.plugins.toast) { 
						window.plugins.toast.showLongCenter(error);
					}
					else {
						self.$el.find('#error-get-results').html(self.templateAlert({msj: error}));
					}					
				},
				complete: function() {
					self.updating(false);
					//console.log(self.itemsViews);
					_.each(self.itemsViews, function(item, key) {
						item.delegateEvents();
					//	console.log("delegateEvents "+item);
					});
				}
					
			});
		},
		mapKeysResultado: {
		    documento: "userID",
		    protocolo: "id"
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

		crearScrollerImgs: function() {

			$('#close-imgs').on('touchstart',function() {
				$('#imgs-wrapper').fadeOut();
			});

			if(this.scrollerImgs)
				this.scrollerImgs.destroy();

			this.scrollerImgs = new IScroll('#imgs-wrapper', {
				zoom: true,
				scrollX: true,
				scrollY: true,
				mouseWheel: true,
				wheelAction: 'zoom',
			    scrollbars: true,
			    interactiveScrollbars: true,
				fadeScrollbars: true,
				zoomMin: 0.25
				//zoomMax: 2
			});	
			
		}
		
	});

	return ResultadosListaView;
})