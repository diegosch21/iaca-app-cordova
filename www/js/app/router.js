define([
	'models/Sesion', 
	'app/views/Header'
], function (Sesion,HeaderView) {
	
	var appRouter = Backbone.Router.extend({
		routes: {
			""					: "home",
			"home"				: "home",
			"resultados"		: "resultados",
		//	"configuracion"		: "configuracion",
			"laboratorios"		: "laboratorios",
			"laboratorios/:lab"	: "verLabo",
			"info"				: "info",
		//	"datos"				: "datos",
			"login"				: "login",
			"login/:page"		: "login",
			"changeuser"		: "login",
			"changeuser/:page"	: "login"
		//	"logout"			: "logout",
		//	"logout/:page"		: "logout"
		},

		initialize: function(){

			this.headerView = new HeaderView();
        	$('#header').html(this.headerView.el);
        	this.cambiarPagina = _.bind(cambiarPagina,this);        	
        	this.getLabos = _.bind(getLabos,this);
        	this.loading = _.bind(loading,this);

		},

		home: function(){
			var self = this;
			this.loading(true);
			require(['views/Home'], function(HomeView) {
				if(!self.homeView)
					self.homeView = new HomeView();
				self.cambiarPagina(self.homeView,'inicio');	
			});
		},
		resultados: function(){
			var self = this;
			if(!Sesion.get("logueado")) {
				console.log("Resultados - No logueado, redireccion a login");
				Backbone.history.navigate("login/resultados",true);
			}
			else {
				this.loading(true);
				require(['views/ResultadosLista'], function(ResultadosView) {
					if(!self.resultadosView)
						self.resultadosView = new ResultadosView();
					self.cambiarPagina(self.resultadosView,'resultados');	
				});
			}
		},
		configuracion: function(){
			var self = this;
			this.loading(true);
			require(['views/Config'], function(ConfigView) {
				if(!self.configView)
					self.configView = new ConfigView();
				self.cambiarPagina(self.configView,'configuracion');	
			});
		},
		laboratorios: function(){
			var self = this;
			this.loading(true);
			//require(['views/Laboratorios','lib/gmaps'], function(LaboratoriosView,Mapa) {
			require(['views/Laboratorios'], function(LaboratoriosView) {
				//console.log(1);
				if (self.laboratoriosView) {
					self.cambiarPagina(self.laboratoriosView,'laboratorios');
				}
				else {
					self.getLabos(function() {
						// if(!self.mapa)
						//   	self.mapa = new Mapa();
						self.laboratoriosView = new LaboratoriosView({
								//mapa: self.mapa,
								collection: self.labosCollection
							})
						self.cambiarPagina(self.laboratoriosView,'laboratorios');	
					});	
				}
			});
		},
		verLabo: function(lab){
			var self = this;
			this.loading(true);
			//require(['views/LaboratorioDetalles','lib/gmaps'], function(LaboView,Mapa) {
			require(['views/LaboratorioDetalles'], function(LaboView) {
				self.getLabos(function() {
					var labo = self.labosCollection.get(lab);
					// if(!self.mapa)
					//  	self.mapa = new Mapa();
					self.cambiarPagina(new LaboView({
							//mapa: self.mapa,
							model: labo
						}),'laboratorios');	
				});	
			});
		},
		info: function(){
			var self = this;
			this.loading(true);
			require(['views/Info'], function(InfoView) {
				if(!self.infoView)
					self.infoView = new InfoView();
				self.cambiarPagina(self.infoView,'info');	
			});
		},
		/*	Vista no usada
		datos: function(){
			var self = this;
			this.loading(true);
			require(['views/Datos'], function(DatosView) {
				//self.datosView = new DatosView();
				self.cambiarPagina(new DatosView(),'configuracion');	
			});
		},
		*/
		login: function(page) {
			//if(Sesion.get("logueado"))
			//	Backbone.history.navigate("home",true);
			//else {
			var self = this;
			this.loading(true);
			require(['views/Login'], function(LoginView) {
				if(page) {
					self.cambiarPagina(new LoginView({"redireccion": page}),'resultados');
				}
				else 	
					self.cambiarPagina(new LoginView(),'inicio');	
			});
			//}
		}
		// HECHO EN HEADERVIEW
		// logout: function(page) {
		// 	if(Sesion.get("logueado"))
		// 		Sesion.logout();
		// }
	});

	function cambiarPagina(view,menuitem) {
		$('#imgs-wrapper').hide();
		this.headerView.selectMenuItem(menuitem);
		if (this.currentView) {
			this.currentView.undelegateEvents();
			this.currentView.showing = false;
		}
		//console.log(4);
		this.currentView = view;
		this.currentView.showing = true;
		$('#content').html(view.render().el);
				
		view.delegateEvents();
		//console.log(8);
		this.scroller.refresh();
		this.scroller.scrollTo(0,0);
		this.currentView.scroller = this.scroller;

		//console.log(9);
		var self = this;
		$('.loading').on('load',function(){
			$(this).removeClass("loading");
        	self.scroller.refresh();
		});
		this.loading(false);
		
		return view;
	};

	function loading (loading) {
		if(loading) {
			$('#page-loading').show();
		}
		else {
			$('#page-loading').hide();
		}
	}

	/* Crea la colleccion de labos si no existe y hace fetch la primera vez. Luego llama al callback (que puede usar this.collction) */
	function getLabos(callback) {
		var self = this;
		require(['collections/Labos'], function(LabosCollection) {
			if (self.labosCollection) {
				//console.log(21);
	        	if (callback) callback();
	    	}
	    	else {
	    		self.labosCollection = new LabosCollection();
	            self.labosCollection.fetch({
	            	success:function () {
	            		//console.log(22);
	            		if (callback) callback();
	        		}
	        	});
	    	}
	    });
	};

	

	return appRouter;
});