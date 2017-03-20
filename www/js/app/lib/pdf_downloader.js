/* global device, cordova, FileTransfer */
define([],function() {
	var PDFDownloader = function() {

		var self = this;

		this.download = function(url,filename,callback_exito,callback_error) {
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
										console.log("download complete: " + entry.toURL());
										// muestra el PDF
										if (platform == 'android' || platform == "Android" ) {
											window.cordova.plugins.FileOpener.openFile(entry.toURL(),
											function() {
												console.log('PDF abierto');
												if (callback_exito) {
													callback_exito();
												}
											},
											function(error) {
												errorDescarga(error,'fileTransfer.download',url);
											});
										}
										else {
											window.open(entry.toURL(), '_blank', 'location=no,closebuttoncaption=Close,enableViewportScale=yes');
											if (callback_exito) {
												callback_exito();
											}
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

				var errorDescarga = function(error,tipo,url) {
					console.log("Error "+ tipo + " "+  error);
					// error: intenta descargar con browser
					window.open(url, '_system');
					if (callback_error) {
						callback_error();
					}
				};
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