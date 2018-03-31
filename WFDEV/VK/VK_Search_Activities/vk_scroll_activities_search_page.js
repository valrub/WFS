function main(re, ie, oe, executor) {
    setGlobalLogger(re, ie, oe, executor);

    var WPXP = xpaths.VK_Search_Activities;

    executionContext = {
        globalLogExtracted: true, //change to false before release;
        globalWPXP: xpaths.VK_Search_Activities
    };

    try {
        var _extract = new Extract(executionContext);
        var _process = new Process();

    } catch (e) {
        Logger.failure(e);
    }

	var urlChainLenght = 10;

	if (ie.fullPost != "true") {
		executor.ready();
	}
    var postLists = document.evaluate(".//div[contains(@class, 'post page_block')]", document, null, 7, null);
    re.placeholder4 = postLists.snapshotLength;
    Logger.production("re.placeholder4: " + re.placeholder4);
    
    
	_process.Run(collectUrls, false, {
		pMarker: '1',
		functionName: 'collectUrls'
	});
    
	function hashCode(input) {
		var hash = 0;
		if (input.length === 0) return hash;
		for (var i = 0; i < input.length; i++) {
			var character = input.charCodeAt(i);
			hash = ((hash << 5) - hash) + character;
			hash = hash & hash; // Convert to 32bit integer
		}
		return hash.toString();
	}

	function collectUrls(pMarker, pContext) {
		try {
            if(re.url !== decodeURIComponent(window.location.href)) {
                //Logger.failure("The search results are only available for logged in users. Check the agent!");
                executor.reportError("400020", "ERROR", "The search results are only available for logged in users. Check the agent!", true);
            }
			cntItems = 0;
			var _res = {
				totalCollected: 0,
				returnCode: ""
			};

			var ttmp = _extract.GetCollection({
					xpathName: "searchResults",
					mandatory: "0"
				},
				pMarker
			);

			if (ttmp.returnCode === "200") {
				var iterator = ttmp.Value;
				var thisNode = iterator.iterateNext();
				var concatinatedUrlsCount = 0;
				var urls = {};
                urls.url = "";
				while (thisNode) {
					concatinatedUrlsCount++;
                    thisNode = iterator.iterateNext();
					var postUrl = _extract.GetAttribute({
						context: thisNode,
						attributeName: "href",
						xpathName: "postUrl",
						mandatory: "0"
					}, "postUrl").Value;
                    
            
					//urls.externalId += "profile_id_" + hashCode(postUrl) + ";";
                    
                    if (postUrl != undefined) {
                        if (!(/https:\/\/vk.com/.test(postUrl))) {
                          postUrl = "https://vk.com/" + postUrl;   
                        }
                        urls.url += postUrl + ";";
                    }
					
					urls.placeholder1 = "https://vk.com/"; //collect full info flag

					var totalResultsCount = Math.ceil(parseInt(re.placeholder4) / urlChainLenght);
                    urls.gender = totalResultsCount.toString();
					var j = 0;

                    Logger.debug("urlChainLenght: " + urlChainLenght + "; concatinatedUrlsCount: " + concatinatedUrlsCount + "; totalResultsCount: " + totalResultsCount);
					if (urlChainLenght <= concatinatedUrlsCount && j < totalResultsCount) {
						j++;
						concatinatedUrlsCount = 0;
                        Logger.production(urls.url);
						addEntity(urls);
						//urls.externalId = "";
						urls.url = "";
					}
                    
                    
					
					cntItems++;
				}
				_res.totalCollected = cntItems;
				_res.returnCode = "200";
			} 
            else { //No info found
				_res.totalCollected = 0;
				_res.returnCode = "204";
			}
		} catch (e) {
			Logger.error("collectUrls('collectUrls', '1' - DID NOT WORK - " + e.message);
			_res.totalCollected = cntItems;
			_res.returnCode = "504 " + e.message;
		}
		return _res;
	}
	finalize();
}