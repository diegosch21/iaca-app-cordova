define([
	'text!templates/resultado_item.html',
	'backbone'
], function (resultadoItemTemplate,Backbone) {

	var ResultadoItemView = Backbone.View.extend({

		//precompilo el template
		template: _.template(resultadoItemTemplate),

		tagName: 'li',
		className: "item--resultado_paciente row",

		initialize: function(options) {
			this.scrollerImgs = options.scrollerImgs;
			// _.bindAll(this,'_verImgs','_openPDF');
			_.bindAll(this,'_openPDF');
		},
		events: {
			'touchend .leido i' : 	'changeLeido',
			'touchend .boton_pdf:not(.dont-show)': 'openPDF',
			// 'touchend .boton_img:not(.dont-show)': 'verImgs'
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
				this.model.save({leido: !this.model.get('leido')});
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
			if(!window.dragging) {
				this._openPDF();
				// Viejo sistema VIANET:
				// 	se debia chequear token segun timestamp (si se habia invalidado, volver a pedir otro),
				// 	y luego abrir el PDF
				// Sesion.checkTimestamp({ success: this._openPDF});
			}
		},
		_openPDF: function() { // param: event
			var self = this;
			require(['services/pdf_downloader'], function(PDFDownloader) {
				$('#page-loading').show();
				var url= self.model.get("pdf"),
					id = self.model.get("id"),
					filename = 'resultado_analisis_'+id+'.pdf';
				// Viejo sistema VIANET: URL con token, debía cambiar el token del URL por el actual
				// var i = url.lastIndexOf('token=');
				// if(i>0) {
				// 	var url_sintoken = url.substring(0,i);
				// 	url = url_sintoken + 'token=' + Sesion.get('token');
				// }
				// console.log("Open PDF - url token actualizado: "+url);
				PDFDownloader.download(url,filename,
					function(){ // Callback exito
						$('#page-loading').hide();
						self.setLeido();
					},
					function(){ // Callback error
						$('#page-loading').hide();
					}
				);
			});
		},
		// Viejas funciones para obtener img de resultado con server VIANET
		// ocultarBotonImg: function() {
		// 	if(typeof this.model.get("jpg") == 'undefined' || !this.model.get("jpg").length) {
		// 		this.$el.find('.boton_img').addClass('dont-show');
		// 	}
		// },
		// verImgs: function() { // param: event
		// 	console.log('pressBoton (dragging: '+window.dragging+')');
		// 	if(!window.dragging)
		// 		Sesion.checkTimestamp({ success: this._verImgs } );
		// },
		// _verImgs: function() {
		// 	console.log("Ver imagenes");
		// 	$('#loading-img').show();
		// 	var divImgs = $('#results-imgs').html('');
		// 	_.each(this.model.get("jpg"), function(value) { // otro param: key
		// 		//CAMBIA EL TOKEN DEL URL POR EL ACTUAL
		// 		var url= value;
		// 		var i = url.lastIndexOf('token=');
		// 		if(i>0) {
		// 			var url_sintoken = url.substring(0,i);
		// 			url = url_sintoken + 'token=' + Sesion.get('token');
		// 		}
		// 		divImgs.append("<div class='result-img'><img src='"+url+"' class='imagen-result' alt='Imagen del resultado de análisis'/></div>");
		// 	});

		// 	$('#imgs-wrapper').fadeIn('slow');
		// 	this.scrollerImgs.zoom(1);
		// 	this.scrollerImgs.scrollTo(0,0);
		// 	var self = this;
		// 	$('.imagen-result').on('load',function(){
		// 		$('#loading-img').hide();
		// 		self.scrollerImgs.refresh();
		// 	});
		// 	this.setLeido();
		// }

	});

	return ResultadoItemView;
});