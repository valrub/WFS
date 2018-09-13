function main(runtimeEntity, inputEntity, outputEntity, executor) {
    setGlobalLogger(runtimeEntity, inputEntity, outputEntity, executor);

    //Logger.production('VAL_LP: 1');

    var parsedInfo = JSON.parse(runtimeEntity.searchResults);
	runtimeEntity.articleBody = "";

    //Logger.production('VAL_LP: 2');
	//url counter
	runtimeEntity.placeholder4 = parseInt(runtimeEntity.placeholder4);
	runtimeEntity.placeholder4--;

	if (runtimeEntity.placeholder4 <= 0) {
		//while loop condition
        runtimeEntity.placeholder3 = "false";
        Logger.production('VAL_LP: 3');
	}

	try {
        //Logger.production('VAL_LP: 4');
        Logger.debug("Saving the document body from page: " + parsedInfo[runtimeEntity.placeholder4].url);
		var xhr = new XMLHttpRequest();
		xhr.open('GET', parsedInfo[runtimeEntity.placeholder4].url, false);

        //Logger.production('VAL_LP: 5');

		var parser = new DOMParser();
		var doc = '';
		xhr.onload = function () {
			if (xhr.status === 200) {
				if (xhr.responseText.indexOf("html") > -1) {
					doc = parser.parseFromString(xhr.responseText, "text/html");
                    runtimeEntity.articleBody = doc.documentElement.innerHTML;
                    
                    Logger.production('HTML --> BODY: ' + runtimeEntity.articleBody);

				} else {
                    var log = "No html found on this page: " + parsedInfo[runtimeEntity.placeholder4].url;
					Logger.error(log);
				}
			} else {
                var logInfo = (xhr.status).toString() + " status returned when loading page: " + parsedInfo[runtimeEntity.placeholder4].url;
				Logger.error(logInfo);
			}
        };

        //Logger.production('VAL_LP: 7');
        xhr.send();
        //Logger.production('VAL_LP: 8');
	} catch (e) {
		Logger.error("Exception thrown while getting the search results' html " + e);
        executor.ready();
	}

    
    Logger.production('VAL_LP: 9 [' + runtimeEntity.placeholder4.toString() + "]" );
    executor.ready();
    Logger.production('VAL_LP: 10');
}