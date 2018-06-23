// Valentin; 23/06/2018
//-------------------------------------
function main(re, ie, oe, executor) {
	
    setGlobalLogger(re, ie, oe, executor, debugLevel = 2);
    Logger.production("WF started","500101");
    
    
    
    Logger.production("There are " + DarkWebConfig.length + " platforms in configuration");
    Logger.production("Keyword is " + ie.keyword);
    
    DarkWebConfig.forEach(element => {
        Logger.production("Invoking WF: " + element.WPName);


        var jobId = "";
        
        if (ie.jobId !== undefined) {
            jobId = ie.jobId;
        } else {
            // This happens when this webflow is executed from FocalCollect.
            executor.reportError("500", "WARNING", "The jobId is undefined, the jobId parameter to the REST service will be hardcoded in order to execute the flow.", true);
            jobId = "100";
        }

        // Invoke
        var xhr = new XMLHttpRequest();
        xhr.open("POST", re.restApiUrl + "webflows/runWebflow", false);
        xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
        xhr.onload = function(){

            Logger.production("I am still here");

            if (this.status != 200) {
                // Status will be 500 in case there was an exception on the side of the REST service
                // (f.e. the webflow we tried to invoke does not exist, the jobId parameter is missing, ...)
                executor.reportError("500", "ERROR", "REST service returned status code " + this.status + ", check if the webflow the CA tried to invoke exists." + this.responseText, true);
            }
            console.log("Wait for 30 seconds to invoke the next flow.");
            setTimeout(function() {
                executor.ready();
            }, 30000);
        };
        xhr.onerror = function(){
            executor.reportError("500", "ERROR", "There was an error, check the IP of the REST service in the CA (fb_merge_invoker_www).", false);
        };

        xhr.send(JSON.stringify({
            webFlowName: element.WPName,
            jobId: jobId,
            //useRootCRAgentPolicy: true,
            parametersMap: {
                username: ie.username,
                password: ie.password,
                keywords: ie.keyword
            }
        }));
    });

	executor.ready();
 }
