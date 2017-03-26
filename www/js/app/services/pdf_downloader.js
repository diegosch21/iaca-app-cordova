/**
 * [SINGLETON Service]
 * Ofrece método para descargar PDF, guardarlo en un directorio, y luego abrirlo si es posible
 */
/* global device, cordova, FileTransfer */
define([],function() {
	var PDFDownloader = function() {

		var self = this;

		this.download = function(url,filename,callback_exito,callback_error) {

			console.log('PDFDownloader: download '+url+' destino: '+filename);

			if (window.deviceready && typeof FileTransfer !== undefined) {
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

				// Define método a ejecutar si ocurre error
				var errorDescarga = function(error,tipo,url,exito) {
					console.log("PDFDownloader: Error "+ tipo + " "+ JSON.stringify(error));
					// error: intenta descargar con browser
					window.open(url, '_system');
					if (exito) {
						if (callback_exito) callback_exito();
					}
					else {
						if (callback_error)	callback_error();
					}
				};

				// Obtiene directorio a guardar archivo y realiza el download
				window.resolveLocalFileSystemURL(saveDirectory,
					// success resolveLocalFileSystemURL
					function (dir) {
						dir.getDirectory("IACA",{create: true},
						// success getDirectory
						function(finalDir){
							var fileTransfer = new FileTransfer();
							if (fileTransfer) {
								var uri = encodeURI(url),
									fileURL = finalDir.toURL() + filename;
								fileTransfer.download(
									uri,
									fileURL,
									function(entry) {
										console.log("PDFDownloader: Download complete: " + entry.toURL());
										// muestra el PDF
										if (platform == 'android' || platform == "Android" ) {
											window.cordova.plugins.FileOpener.openFile(entry.toURL(),
												function() {
													console.log('PDFDownloader: PDF abierto');
													if (callback_exito)	callback_exito();
												},
												function(error) {
													// Lo descargó pero no puede abrirlo - Ejecuta igualmente callback exito
													errorDescarga(error,'fileOpener: No puede abrir PDF descargado',url,true);
												}
											);
										}
										else { // Si es iOS directamente lo abre
											window.open(entry.toURL(), '_blank', 'location=no,closebuttoncaption=Close,enableViewportScale=yes');
											if (callback_exito)	callback_exito();
										}
									},
									function(error) {
										errorDescarga(error,'fileTransfer.download',url);
									},
									true
								);
							}
							else {
								errorDescarga("",'fileTransfer',url);
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
					}
				);

			}
			else {
				window.open(url, '_blank');
				if (callback_exito) {
					callback_exito();
				}
			}
		};
	};

	return new PDFDownloader();  //SINGLETON
});