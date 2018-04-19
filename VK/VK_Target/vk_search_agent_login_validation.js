function main(re, ie, oe, ex) {
    
    //setTimeout(function(){
    
    try {
        //=====================================================================
		//Initialize Global Settings
		setGlobalLogger(re, ie, oe, ex);
        
        //Assign currently relevant WEB PLATFORM XPATH ENUM
        var WPXP = xpaths.VK_Search_Activities; 
		executionContext = {
			globalLogExtracted: false, //change to false before release;
			globalWPXP: xpaths.VK_Search_Activities
		};
		var _extract = new Extract(executionContext);
        re.placeholder6 = "15";
		//=====================================================================
		//Check for login error
		var vLoginForm = _extract.GetText({
				xpathName: "vUnableToLogInMessage",
				mandatory: "0"
			},
			"LoginForm"
		).Value;
        Logger.production('VAL1: Try to login. vLoginForm = ' + vLoginForm);
        
        var vSecurityCheck = _extract.GetText({
				xpathName: "vUserNameSecurityCheck",
				mandatory: "0"
			},
			"LoginForm"
		).Value || "";
        Logger.production('VAL2: Try to login. vSecurityCheck = ' + vSecurityCheck);


        //check for succesfull login
        var vProfileName = _extract.GetText({
    			xpathName: ".//div[class='top_profile_name']",
				mandatory: "0"
			},
			"ProfileName"
		).Value;
        Logger.production('VAL3: Try to login. vProfileName = ' + vProfileName)

		if (vLoginForm) {
			Logger.failure("The agent did not log in! The flow will fail!", "400020");
		} else if(vSecurityCheck) {
            Logger.failure("The agent needs to have it's username verified! The agent did not log in! The flow will fail!", "400020");   
		} else if(!(vProfileName === null)){
			Logger.production("WOW! The agent logged in successfully!");
			ex.ready();
		}else{
    	    Logger.failure("The agent did not log in! The flow will fail!", "400020");
		}
	} catch (e) {
		Logger.failure(e.message);
	}
    //}, 10000);
}