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
			'touchend .boton_pdf:not(.dont-show)': 'openPDF',
			'touchend .boton_img:not(.dont-show)': 'verImgs'
			// 'click .leido i' : 	'changeLeido',
			// 'click .boton_pdf': 'openPDF',
			// 'click .boton_img': 'verImgs'
		},

		render: function() {
			console.log("Render ResultadoItemView id: "+this.model.id);
			this.$el.html(this.template(this.model.toJSON()));
			this.marcarLeido();
			this.ocultarBotonImg();
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
		ocultarBotonImg: function() {
			if(typeof this.model.get("jpg") == 'undefined' || this.model.get("jpg").length == 0) {
				this.$el.find('.boton_img').addClass('dont-show');
			}
		},
		openPDF: function() {
			console.log('pressBoton (dragging: '+window.dragging+')');
			if(!window.dragging)
				Sesion.checkTimestamp({ success: this._openPDF});
		},
		_openPDF: function(event) {
			$('#page-loading').show();
			//CAMBIA EL TOKEN DEL URL POR EL ACTUAL
			var url= this.model.get("pdf"),
				id = this.model.get("id");
			var i = url.lastIndexOf('token=');
			if(i>0) {
				var url_sintoken = url.substring(0,i);
				var url = url_sintoken + 'token=' + Sesion.get('token');
			}
			console.log("Open PDF - url token actualizado: "+url);

			if (window.deviceready) {
				var platform = device.platform,
					saveDirectory = "";
				if (platform === "iOS") {
					saveDirectory = cordova.file.documentsDirectory;
				}
				else if (platform == 'android' || platform == "Android" ) {
					if (cordova.file.externalRootDirectory) {
						saveDirectory = cordova.file.externalRootDirectory;
					}
					else if (cordova.file.externalApplicationStorageDirectory) {
						saveDirectory = cordova.file.externalApplicationStorageDirectory;
					}
					else {
						saveDirectory = cordova.file.cacheDiretory;
					}
				}
				else {
					saveDirectory = cordova.file.dataDirectory;
				}

				window.resolveLocalFileSystemURL(saveDirectory,
				// success resolveLocalFileSystemURL
				function (dir) {
					dir.getDirectory("IACA",{create: true},
					// success getDirectory
					function(finalDir){
						var fileTransfer = new FileTransfer();
						if (fileTransfer) {
							var uri = encodeURI(url),
								fileURL = finalDir.toURL() + 'resultado_analisis_'+id+'.pdf';
							fileTransfer.download(
								uri,
								fileURL,
								function(entry) {
									console.log("download complete: " + entry.toURL());
									// muestra el PDF
									if (platform == 'android' || platform == "Android" ) {
										window.cordova.plugins.FileOpener.openFile(entry.toURL(),
										function() {
											console.log('PDF abierto');
											$('#page-loading').hide();
										},
										function(error) {
											errorDescarga(error,'fileTransfer.download',url);
										});
									}
									else {
										window.open(entry.toURL(), '_blank', 'location=no,closebuttoncaption=Close,enableViewportScale=yes');
										$('#page-loading').hide();
									}
								},
								function(error) {
									errorDescarga(error,'fileTransfer.download',url);
								},
								true
							)
						}
						else {
							errorDescarga(error,'fileTransfer',url);
						}
					},
					// error getDirectory
					function(error) {
						errorDescarga(error,'getDirectory',url);
					});
				},
				// error resolveLocalFileSystemURL
				function(error){
					errorDescarga(error,'resolveLocalFileSystemURL',url);
				});

				function errorDescarga (error,tipo,url) {
					console.log("Error "+ tipo + " "+  error);
					// error: intenta descargar con browser
					window.open(url, '_system');
					$('#page-loading').hide();
				}
			}
			else {
				window.open(url, '_blank');
				$('#page-loading').hide();
			}


			this.setLeido();
		},
		verImgs: function(event) {
			console.log('pressBoton (dragging: '+window.dragging+')');
			if(!window.dragging)
				Sesion.checkTimestamp({ success: this._verImgs } );
		},
		_verImgs: function() {
			console.log("Ver imagenes");
			$('#loading-img').show();
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
				$('#loading-img').hide();
				self.scrollerImgs.refresh();
			});
			this.setLeido();
		}


	});

	return ResultadoItemView;
})