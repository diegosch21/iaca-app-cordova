var logger = function() {
    var oldConsoleLog = null;
    var pub = {};
    var isDisabled = false;
    pub.enableLogger =  function enableLogger()  {
                            if(oldConsoleLog === null)
                                return;
                            window['console']['log'] = oldConsoleLog;
                            isDisabled = false;
                        };
    pub.disableLogger = function disableLogger()  {
                            oldConsoleLog = console.log;
                            window['console']['log'] = function() {};
                            isDisabled = true;
                        };
    var toggled = false;
    pub.toggleConsole = function (enable) {  // habilita o deshabilita sólo si estaba deshabilitada antes
        if(enable && isDisabled) {   // habilitar consola
            toggled = true; //guarda estado anterior
            logger.enableLogger();
        }
        else if (!enable) {    //deshabilitar consola: sólo si estaba deshabilitada
            if (toggled) {  //si se deshabilitó antes
                logger.disableLogger();
                toggled = false;
            }
        }
    };
    return pub;
}();