define([
	'text!templates/resultado_item.html',
	'models/Sesion'
], function (resultadoItemTemplate,Sesion) {
	
	var ResultadoItemView = Backbone.View.extend({

		//precompilo el template
		template: _.template(resultadoItemTemplate),

		tagName: 'li',
		className: "item--resultado_paciente row",

		initialize: function(options) {
			this.scrollerImgs = options.scrollerImgs;
			_.bindAll(this,'_verImgs','_openPDF');
		},
		events: {
			'touchend .leido i' : 	'changeLeido',
			'touchend .boton_pdf': 'openPDF',
			'touchend .boton_img': 'verImgs'
			// 'click .leido i' : 	'changeLeido',
			// 'click .boton_pdf': 'openPDF',
			// 'click .boton_img': 'verImgs'
		},

		render: function() {
			console.log("Render ResultadoItemView id: "+this.model.id);
			this.$el.html(this.template(this.model.toJSON()));
			this.marcarLeido();
			return this;
		},

		changeLeido: function() {
			console.log('pressBoton (dragging: '+window.dragging+')');
			if(!window.dragging) {
				this.model.save({'leido': !this.model.get('leido')});
				console.log("changeLeido: "+this.model.get('leido'));
				this.marcarLeido();
			}
		},
		setLeido: function() {
			this.model.save({'leido': true});
			console.log("setLeido: "+this.model.get('leido'));
			this.marcarLeido();
		},
		marcarLeido: function() {
			if(this.model.get("leido")) {
				this.$el.addClass('leido_si');
				this.$el.removeClass('leido_no');
			}
			else {
				this.$el.addClass('leido_no');	
				this.$el.removeClass('leido_si');
			}
		},
		openPDF: function() {
			console.log('pressBoton (dragging: '+window.dragging+')');
			if(!window.dragging)
				Sesion.checkTimestamp({ complete: this._openPDF});
		},
		_openPDF: function(event) {
			//CAMBIA EL TOKEN DEL URL POR EL ACTUAL
			var url= this.model.get("pdf");
			var i = url.lastIndexOf('token=');
			if(i>0) {
				var url_sintoken = url.substring(0,i);
				var url = url_sintoken + 'token=' + Sesion.get('token');
			}
			console.log("Open PDF - url token actualizado: "+url);
			window.open(url, '_system');
			
			this.setLeido();
		},
		verImgs: function(event) {
			console.log('pressBoton (dragging: '+window.dragging+')');
			if(!window.dragging)
				Sesion.checkTimestamp({ complete: this._verImgs } );
		},
		_verImgs: function() {
			console.log("Ver imagenes");
			var divImgs = $('#results-imgs').html('');
			_.each(this.model.get("jpg"), function(value, key) {
				//CAMBIA EL TOKEN DEL URL POR EL ACTUAL
				var url= value;
				var i = url.lastIndexOf('token=');
				if(i>0) {
					var url_sintoken = url.substring(0,i);
					var url = url_sintoken + 'token=' + Sesion.get('token');
				}
				divImgs.append("<div class='result-img'><img src='"+url+"' class='imagen-result' alt='Imagen del resultado de análisis'/></div>");
			});

			$('#imgs-wrapper').fadeIn('slow');
			this.scrollerImgs.zoom(1);
			this.scrollerImgs.scrollTo(0,0);
			var self = this;
			$('.imagen-result').on('load',function(){
				self.scrollerImgs.refresh();
			});
			this.setLeido();
		}
	
		
	});

	return ResultadoItemView;
})