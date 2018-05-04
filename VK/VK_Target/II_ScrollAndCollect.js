function main(re, ie, oe, executor) {
    setGlobalLogger(re, ie, oe, executor);
	try {
		Logger.production('In Scroll CA');
		//Scrolls down the search results page to load all the images
		re.collectionCount = 200;
		var positionOnPage = '';
		var xpath = '';
		var allPosts = "";
		if (!isNaN(parseInt(ie.maxValue))) {
			re.collectionCount = parseInt(ie.maxValue);
			Logger.production('max is ' + re.collectionCount);
		} else {
			Logger.production("The default number of collected entities will be used: 200 ");
		}
		if (/likes/.test(re.gender)) {
			positionOnPage = "last()";
			Logger.production('Will scroll likers');
			xpath = ".//*[contains(@class, 'fans_fan_row inl_bl')]";
		} else if (/shares/.test(re.gender)) {
			positionOnPage = 2;
			Logger.production('Will scroll sharers');
			xpath = ".//div[contains(@class, '_post post post_copy')]";
		} else {
			Logger.production('Xpath passed to the scrolling function is not correct');
		}

		allPosts = document.evaluate(xpath, document, null, 7, null);
		if (allPosts.snapshotLength >= re.collectionCount) {
			Logger.production(allPosts.snapshotLength + " items found!");
			Logger.production('Out of Scroll CA');
			finalize();
		} else if (!isNaN(parseFloat(positionOnPage))) {
			if (allPosts.snapshotLength <= 4) {
				Logger.production(allPosts.snapshotLength + " items found!");
				Logger.production('Out of Scroll CA');
				finalize();
			}
		} else if (isNaN(parseFloat(positionOnPage))) {
			if (allPosts.snapshotLength <= 60) {
				Logger.production(allPosts.snapshotLength + " items found!");
				Logger.production('Out of Scroll CA');
				finalize();
			}
		}

		scrollDown(xpath, re.collectionCount);

	} catch (e) {
		Logger.error(" In CA ScrollAndCollect - DID NOT WORK - " + e.message);
		finalize();
	}


	function scrollDown(xpath, max) {
		try {
			var loadedElements = 0;
			var loadTime = 0;
			var maxLoadTime = 20000;
			var allPosts = "";
			var loadMoreButton;
			var element;
			var increaseLoadedElementsNumber = 60;
			var scrollInterval = setInterval(function() {

				var lastPostId = document.evaluate(xpath + "[" + positionOnPage + "]", document, null, 9, null).singleNodeValue;
				if (lastPostId !== null) {
					var id = lastPostId.getAttribute("id");
				} else {
					clearInterval(scrollInterval);
					executor.ready();
					Logger.production('Reached final element');
				}
				element = document.querySelector("#" + id);
				element.scrollIntoView();
				allPosts = document.evaluate(xpath, document, null, 7, null);
				if (positionOnPage !== "last()") {
					positionOnPage += 2;
					increaseLoadedElementsNumber = 2;
				}
				Logger.production("Position on page is : " + positionOnPage);
				if (allPosts.snapshotLength <= max) {
					lastPostId = document.evaluate(xpath + "[" + positionOnPage + "]", document, null, 9, null).singleNodeValue;
					if (lastPostId !== null) {
						id = lastPostId.getAttribute("id");
					} else {
						clearInterval(scrollInterval);
						executor.ready();
						Logger.production('Reached final element');
					}
					element = document.querySelector("#" + id);
					element.scrollIntoView();
					loadedElements += increaseLoadedElementsNumber;
					if (loadedElements >= allPosts.snapshotLength) {
						loadTime += 200;
						if (loadTime >= maxLoadTime) {
							//clearInterval(scrollInterval);
							loadedElements = allPosts.snapshotLength;
							Logger.production(loadedElements.toString() + " items found!");
							re.placeholder4 = loadedElements.toString();
							Logger.production('Out of Scroll CA');
							executor.ready();
						}
					} else {
						loadedElements = allPosts.snapshotLength;
						loadTime = 0;
					}
				} else {
					loadedElements = max;
					//            re.placeholder4 = loadedElements.toString();
					clearInterval(scrollInterval);
					Logger.production(loadedElements.toString() + " items found!");
					Logger.production('Out of Scroll CA');
					executor.ready();
				}
			}, 1000);
		} catch (e) {
			Logger.error("Error while loading the results page.");
		}
	}
}