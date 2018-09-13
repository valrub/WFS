function main(runtimeEntity, inputEntity, outputEntity, executor) {

    setGlobalLogger(runtimeEntity, inputEntity, outputEntity, executor);

    getApiUrl();

	var scheduledImages = 0;

	//The urls of the pages the search results belong to
	var searchResults = {};
	runtimeEntity.searchResults = '';

	var xpath = {
		imageMeta: './/div[contains(@class, "rg_meta")]'
	};
	var metaData = document.evaluate(xpath.imageMeta, document, null, 7, null);

	function getApiUrl() {
		try {
			runtimeEntity.restApiUrl = "http://CollectAdmin1:8080/" + unescape(JSON.parse('"\u0046\u006f\u0063\u0061\u006c"')) + "CollectRest/";

			if (inputEntity.restApiUrl) {
				runtimeEntity.restApiUrl = inputEntity.restApiUrl;
			} else {
				var xhr = new XMLHttpRequest();
				xhr.open("GET", "http://CollectAdmin1:8080/CollectRest/entities/getInputEntity", false);
				xhr.send();

				if (xhr.status == 200) {
					runtimeEntity.restApiUrl = "http://CollectAdmin1:8080/CollectRest/";
                }
            
            }
            Logger.production('>>> runtimeEntity.restApiUrl = ' + runtimeEntity.restApiUrl);
		} catch (e) {
			Logger.error("Error in getApiUrl(). There was a problem with the url creation for our REST API");
		}
	}

	try {
		var pageId = toHex(runtimeEntity.placeholder1);
        pageId = pageId.toString().replace("-", "_");

		//The activity type for the search results page is set to "social network" by default
		var searchPage = {
			externalId: 'page' + pageId,
			itemType: "4",
			type: "1", //Person
			activityType: "1", //Social network
			url: runtimeEntity.placeholder1,
			title: "Google Image Search",
			body: "Google Image Search"
		};
		executor.addEntity(searchPage);
        Logger.production("Image collection started...");

		for (var i = 0; i < parseInt(runtimeEntity.placeholder2); i++) {
			if (metaData.snapshotItem(i)) {
				var info = JSON.parse(metaData.snapshotItem(i).textContent);

				var image = {
					externalId: "gis_" + info["id"].replace("-", "_").replace(":", ""),
					activityType: '1',
					itemType: '5',
					imageUrl: info["ou"],
					url: info["ru"],
					parent_externalId: searchPage.externalId,
					parentObjectType: searchPage.itemType,
					writer_externalId: searchPage.externalId,
					title: info["pt"],
					description: info["s"]
				};
				searchResults[i] = {
					'url': image.url,
					'title': image.title,
					'externalId': image.externalId,
                    'writer_externalId': image.writer_externalId
				};
				addImage(image);
			}
		}
	} catch (e) {
		Logger.error("Exception thrown while collecting the images");
	}

	//A string for passing the current data to the article collector CA
	runtimeEntity.searchResults = JSON.stringify(searchResults);

	//The number of collected urls
	runtimeEntity.placeholder4 = Object.keys(searchResults).length;    

	//Set the while loop condition
	runtimeEntity.placeholder3 = "false";

	if (runtimeEntity.placeholder4 > 0) {
		runtimeEntity.placeholder3 = "true";
	}

	runtimeEntity.placeholder4 = runtimeEntity.placeholder4.toString();
    Logger.production("Images successfully collected: " + runtimeEntity.placeholder4);
    Logger.production("Image collection ended.");

	//Empty string for loading an empty url
	runtimeEntity.gender = "";

	finalize();

	function addImage(entity) {
		try {
			if (entity.imageUrl) {
				scheduledImages += 1;
				executor.saveBinary(entity.imageUrl, onSuccess, onError, entity);
			} else {
				executor.addEntity(entity);
			}
		} catch (e) {
			Logger.error("Exception thrown when saving an image");
		}
	}

	function onSuccess(filePath, entity) {
		try {
			scheduledImages -= 1;
			entity.image = filePath;
			executor.addEntity(entity);
		} catch (e) {
			Logger.error("Exception thrown when saving an image in onSucces()");
		}
	}

	function onError() {
		try {
			scheduledImages -= 1;
		} catch (e) {
			Logger.error("Exception thrown when saving an image in onError()");
		}
	}

	function finalize() {
		try {
			var finalizeInterval = setInterval(function () {
				if (scheduledImages === 0) {
					clearInterval(finalizeInterval);
					executor.ready();
				} else {
					console.log("Waiting for photos to be downloaded...");
				}
			}, 1000);

		} catch (e) {
			Logger.error("Exception thrown in the finalize function");
			executor.ready();
		}
	}
}

var toHex = function (str) {
    var hash = 0;
    if (str.length === 0) return hash;
    for (var i = 0; i < str.length; i++) {
        var chr   = str.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};