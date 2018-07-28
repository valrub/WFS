function main(re, ie, oe, executor) {
    if (re.executionContext.indexOf("photos") === -1) {
		executor.ready();
	}
	//=====================================================================
	//Initialize Global Settings
	setGlobalLogger(re, ie, oe, executor, 4);

	executionContext = {
		globalLogExtracted: false, //change to false before release;
		globalWPXP: xpaths.VK_Target
	};

	var _extract = new Extract(executionContext);
	var _process = new Process();

	//=====================================================================
	// GLOBAL VARIABLES

	var collectedAuthors = [];
	var theTargetID = re.targetId;
	var cntItems = 0;
	var totalAuthors = 0;
	var _tmp;

	//=====================================================================
	var CAName = "VK Photos Collect";
	Logger.production(CAName + " Start Time: " + new Date());

	//===============================================================================
	// -------------------  Here extract logic begins  ------------------------------

	_process.Run(collectPhotos, false, {
		pMarker: '6',
		functionName: 'collectPhotos'
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

	function collectPhotos(pMarker, pContext) {
		try {
			cntItems = 0;
			var _res = {
				totalCollected: 0,
				returnCode: ""
			};

			var ttmp = _extract.GetCollection({
					xpathName: "aPhotos",
					mandatory: "0"
				},
				pMarker
			);

			if (ttmp.returnCode === "200") {
				var iterator = ttmp.Value;
				var thisNode = iterator.iterateNext();
				var i = 0;

				while (thisNode && parseInt(re.placeholder4) > i) {

					//thisNode.click();
					
					var date = "";
					var hrefDoc = document.evaluate(".//a", thisNode, null, 9, null).singleNodeValue;
					var xhr = new XMLHttpRequest();
					xhr.ajaxUrl = hrefDoc.href;
					Logger.debug("currentImage: " + hrefDoc.href);
					xhr.open('GET', xhr.ajaxUrl, false);
					xhr.send();
					if (xhr.status === 200) {
						var urlHref = hrefDoc.href.split('?');
						var urlSplit = urlHref[0].match(/([0-9]+_+[0-9]+)/)[0];
						var parser = new DOMParser();
						var html = parser.parseFromString(xhr.responseText, "text/html");
						var first = xhr.responseText.indexOf('"id":"' + urlSplit + '"');
						var second = xhr.responseText.substring(first, xhr.responseText.length);
						var third = second.indexOf('"tags"');
						//console.log(third);
						var final = second.substring(0, third);
						//console.log(final);
						if (final.match(/(\d+\s+\w+\s+\w+\s+\d+\W+\d+\s+\w+)|(\d+\s+\w+\s+\d+)/gi)) {
							var matches = final.match(/\d+\s+\w+\s+\w+\s+\d+\W+\d+\s+\w+|\d+\s+\w+\s+\d+/gi);
							date = matches[matches.length-1];
						} 
						
					}

					i++;
					var img = {};
					img.parent_externalId = theTargetID;
					img.parentObjectType = "4";
					img.writer_externalId = theTargetID;
					
					img.writeDate = date;
					img.itemType = "5";
					img.imageUrl = thisNode.getAttribute("style").match(/(https.+.jpg)/g)[0];
					img.url = hrefDoc.href;
					img.externalId = "photo_id_" + hashCode(img.imageUrl);
					img.activityType = "1";

					thisNode = iterator.iterateNext();
					cntItems++;
					addImage(img);



					//HERE - ADD LOCATION
				}
				_res.totalCollected = cntItems;
				_res.returnCode = "200";
			} else { //No info found
				_res.totalCollected = 0;
				_res.returnCode = "204";
			}
		} catch (e) {
			Logger.error("collectPhotos('collectPhotos', '6' - DID NOT WORK - " + e.message);
			_res.totalCollected = cntItems;
			_res.returnCode = "504 " + e.message;
		}
		return _res;
	}
	Logger.production(CAName + " End Time: " + new Date());
	finalize();
}