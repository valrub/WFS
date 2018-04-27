function main(re, ie, oe, executor) {
    if(re.executionContext.indexOf("wall") === -1) {
        executor.ready();
    }
    setGlobalLogger(re, ie, oe, executor);
    //Scrolls down the search results page to load all the images
	var collectionCount = 50;
	if (!isNaN(parseInt(ie.max_posts))) {
		collectionCount = parseInt(ie.max_posts);
	} else {
		Logger.production("The default number of search results will be used: 50 search results.");
	}

	var scrollDown = function (xpath, max) {
		try {
			var loadedElements = 0;
			var loadTime = 0;
			var maxLoadTime = 10000;
			var allPosts = "";
			var loadMoreButton;

			var scrollInterval = setInterval(function () {
				window.scrollTo(0, document.body.scrollHeight);
				allPosts = document.evaluate(xpath, document, null, 7, null);

				//loadMoreButton = document.evaluate(".//*[@id='btn_lock']", document, null, 9, null).singleNodeValue;

				if (allPosts.snapshotLength <= max ) {
					window.scrollTo(0, document.body.scrollHeight);
					//allPosts = document.evaluate(xpath, document, null, 7, null);
                    
					loadedElements += 10;

					if (loadedElements >= allPosts.snapshotLength) {
						loadTime += 50;

						if (loadTime >= maxLoadTime) {
							clearInterval(scrollInterval);
                            loadedElements = allPosts.snapshotLength;
							Logger.production(loadedElements.toString() + " posts found!");
							re.placeholder4 = loadedElements.toString();
							executor.ready();
						}
					} else {
						loadedElements = allPosts.snapshotLength;
						loadTime = 0;
					}
				} else {
					loadedElements = max;
                    re.placeholder4 = loadedElements.toString();
					clearInterval(scrollInterval);
					Logger.production(loadedElements.toString() + " items found!");
					executor.ready();
				}

			}, 1000);
		} catch (e) {
			Logger.error("Error while loading the results page.");
		}
	};
	scrollDown(".//*[contains(@id, 'post') and contains(@class, '_post post')]", collectionCount);
}