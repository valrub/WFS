function main(re, ie, oe, executor) {
	//------------------------------------------------------------
    setGlobalLogger(re, ie, oe, executor);
    
    executionContext = {
		globalLogExtracted: true, //change to false before release;
		globalWPXP: xpaths.Instagram_Profile
	};

	var _extract = new Extract(executionContext);
    //------------------------------------------------------------
    setTimeout(checkIfBlocked, 5000);
    
    function  checkIfBlocked() {
        
        
        if(_extract.GetXPATH("loginBtn")) 
        {
            Logger.production("VAL XPATH LoginBtn = " + _extract.GetXPATH("loginBtn"));
            var logInButton = document.evaluate(_extract.GetXPATH("loginBtn"), document, null, 9, null);
        
            if (logInButton.singleNodeValue) {
                Logger.debug("Couldn't log in. The agent is blocked.","400020");
                executor.reportError("400020", "ERROR", "Couldn't log in. The agent is blocked.", true);  
                executor.ready();  
            } else {
                executor.ready();
            }
        }else{
            Logger.error("XPATH loginBtn not fount in XPATHs" ); 
        }
    
    }

 }
