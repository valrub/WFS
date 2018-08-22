function main(re, ie, oe, executor) {
	//------------------------------------------------------------
	setGlobalLogger(re, ie, oe, executor);
 
	executionContext = {
		globalLogExtracted: true, //change to false before release;
		globalWPXP: xpaths.Instagram_Profile
	};

	var _extract = new Extract(executionContext);
	//------------------------------------------------------------
 re.url = "about:blank";

 // ----------------------- Get XPATH values ---------------------------------------------

 var xp_postUrlNodeCollection = _extract.GetXPATH("postUrlNodeCollection");
 var xp_showMoreButton = _extract.GetXPATH("showMoreButton");
 var xp_scrollDown = _extract.GetXPATH("scrollDown");
 var xp_ScrollPosts = _extract.GetXPATH("scroll_posts");
 var xp_colPosts = _extract.GetXPATH("colPosts");
 var xp_targetAvatarImage = _extract.GetXPATH("targetAvatarImage");
 var xp_targetDescription = _extract.GetXPATH("targetDescription");
 var xp_targetNickname = _extract.GetXPATH("targetNickname");
 var xp_postsCount = _extract.GetXPATH("postsCount");
 var xp_followersCount = _extract.GetXPATH("followersCount");
 var xp_followingsCount = _extract.GetXPATH("followingsCount");
 var xp_privateAccount = _extract.GetXPATH("privateAccount");

 //---------------------------------------------------------------------------------------------




 try {

	 function setDeltaCollection() {
		 try {
			 var lastExecutionTime = ie.lastStartExecutionTime.split(".")[0].replace(" ", "T");
			 lastExecutionTime = new Date(lastExecutionTime).getTime();
			 Logger.debug("Last execution time " + lastExecutionTime);
			 return lastExecutionTime;
		 } catch (e) {
			 Logger.error("setDeltaCollection: " + e);
		 }
	 }

	 function startScript() {
		 try {
			 // fill in the array with post urls
			 rawPostURLs = getPostHrefNodes();
			 // Logger.production('rawPostURLs.length ' + rawPostURLs.length);
			 // Logger.production('rawPostURLs ' + JSON.stringify(rawPostURLs));

			 // collect information about the posts from magic API
			 getPostJsons(rawPostURLs, postJSONarray);

		 } catch (error) {
			 Logger.error(error);
		 }
	 }

	 function getPostJsons(rawUrls, jsonArr) {
		 try {
			 if (rawUrls.length >= jsonArr.length) {

				 var urlsToJson = [];
				 // use API only on urls that we have not yet called
				 urlsToJson = rawUrls.filter(el => {
					 var tempArr = jsonArr.map(obj => "https://www.instagram.com/p/" + obj.graphql.shortcode_media.shortcode + "/");
					 return tempArr.indexOf(el.split("?__a=1")[0]) == -1
				 });
				 Logger.production("getPostJsons: " + urlsToJson);

				 let index = 0;
				 var urlIterator = function() {
					 try {
						 // console.log("urlsToJson.length " + urlsToJson.length)
						 // console.log("index " + index)
						 if (index < urlsToJson.length) {
							 magicAPI(urlsToJson[index]);
							 index++;
							 setTimeout(urlIterator, 100);
						 } else {

							 compareDates(lastColletionDate)
						 }
					 } catch (error) {
						 console.log(error);
						 //finalize();
						 Logger.failure("API enrichment error: " + error, "500504");
					 }
				 };
				 urlIterator();
			 }
		 } catch (error) {
			 Logger.failure("API enrichment error: " + error);
		 }
	 }

	 function magicAPI(url) {
		 try {
			 Logger.production("call to API: " + url);
			 var xhttp = new XMLHttpRequest();
			 xhttp.onreadystatechange = function() {
				 if (this.readyState == 4 && this.status == 200) {
					 Logger.production("response pushed to postJSONarray");
					 postJSONarray.push(JSON.parse(xhttp.responseText))
				 }
			 };
			 xhttp.open("GET", url);
			 xhttp.send();
		 } catch (error) {
			 Logger.failure("call to API: " + error);
		 }
	 }

	 function getPostHrefNodes() {
		 try {
			 var rawUrls = [];
			 var postUrlNodeCollection = document.evaluate(xp_postUrlNodeCollection, document, null, 5, null);
			 
			 Logger.production('VAL postUrlNodeCollection =  ' + postUrlNodeCollection);

			 var thisUrlNode = postUrlNodeCollection.iterateNext();
			 while (thisUrlNode) {
				 rawUrls.push(thisUrlNode.getAttribute("href").split('?taken-by')[0].indexOf('https://www.instagram.com') === -1 ? ("https://www.instagram.com" + thisUrlNode.getAttribute("href").split('?taken-by')[0] + "?__a=1") : (thisUrlNode.getAttribute("href").split('?taken-by')[0] + "?__a=1"));
				 thisUrlNode = postUrlNodeCollection.iterateNext();
			 }
			 Logger.production("getPostHrefNodes: " + rawUrls);

			 return rawUrls;
		 } catch (err) {
			 Logger.failure("getPostHrefNodes() :: " + err + " at line " + err.lineNumber);
		 }
	 }

	 function compareDates(lastColletionDate) {

		 Logger.production("Last collection date in compareDates() " + lastColletionDate);
		 try {

			 filteredPostURLs = postJSONarray.filter((el) => {
				 Logger.production("media date " + parseInt(el.graphql.shortcode_media.taken_at_timestamp) * 1000 + "lastColletionDate: " + lastColletionDate);
				 return parseInt(el.graphql.shortcode_media.taken_at_timestamp) * 1000 > lastColletionDate;
			 });
			 var filteredStr = filteredPostURLs.join(',');

			 var numberOfOlderPosts = postJSONarray.length - filteredPostURLs.length;
			 if (numberOfOlderPosts >= 0 || stop == 3) {
				 sendTask();
			 } else {
				 //scrollAmount += scrollIncrement;
				 scrollDown(startScript, xp_scrollDown, scrollAmount);
			 }
		 } catch (error) {
			 Logger.failure("compareDates() :: " + error + " at line " + error.lineNumber);
		 }
	 }
	 var loadedElements = 0;

	 function scrollDown() {
		 try {
			 var vInputs = JSON.parse(re.vInputs);
			 var maxUrls = Number(vInputs.max_posts);
			 var urls = [];
			 var count = 0;
			 var noMore = false;

			 var posts = document.evaluate(xp_ScrollPosts, document, null, 7, null);
			 if (!posts) {
				 console.log("no found posts or xpath changed  ", "400011");
			 }

			 var interval = setInterval(function() {
				 if (noMore || urls.length > maxUrls) {
					 clearInterval(interval);
					 sendTask(urls);
				 } else {
					 var post = document.evaluate(xp_colPosts, document, null, 9, null).singleNodeValue;
					 if (post) {
						 window.scrollBy(0, 20);
						 collectUrls(post);
					 } else {
						 noMore = true;
					 }

				 }

			 }, 1000);



			 if (posts) {
				 collectUrls(posts.snapshotItem(0));
			 } else {
				 noMore = true;
			 }

			 function collectUrls(post) {

				 var currentPost = post
				 if (post) {
					 var id = currentPost.href.split('/')[4];
					 var url = "https://www.instagram.com/p/" + id + "/?__a=1";
					 var response = '';
					 try {
						 console.log("call to API: " + url);
						 var xhttp = new XMLHttpRequest();
						 xhttp.onreadystatechange = function() {
							 if (this.readyState == 4 && this.status == 200) {
								 console.log("response pushed to postJSONarray");
								 response = JSON.parse(xhttp.responseText);
							 }
						 };
						 xhttp.open("GET", url, false);
						 xhttp.send();
					 } catch (error) {
						 console.log("call to API: " + error);
					 }

					 if (parseInt(response.graphql.shortcode_media.taken_at_timestamp) * 1000 > lastColletionDate) {
						 urls.push(currentPost.href);
					 } else {
						 noMore = true;
					 }

					 currentPost.remove();
				 } else {
					 noMore = true;
				 }


			 }



		 } catch (e) {
			 console.log("scrollDown() :: " + e + " at line " + e.lineNumber);
		 }
	 }

	 function sendTask(urls) {
		 try {
			 var urlsToCollect = urls;
			 //Logger.production("URLS SEND TASKS: " + filteredPostURLs);
			 //var urlsToCollect = filteredPostURLs.map((obj) => {
			 //	return "https://www.instagram.com/p/" + obj.graphql.shortcode_media.shortcode + "/";
			 //
			 //});

			 Logger.production("Found " + urlsToCollect.length + " posts published since: " + new Date(lastColletionDate).toString()); // add date from datepicker

			 while (urlsToCollect.length > 0) {
				 var arrToSend = urlsToCollect.splice(0, 10);
				 addEntity({
					 "placeholder1": arrToSend.toString(),
					 "gender": wfInputs.max_likers,
					 "coordinateY": wfInputs.max_comments,
					 "coordinateX": re.downloadVideoFiles,
					 "offset": "https://www.instagram.com/",
					 "body": re.targetInfo
				 });
			 }
			 finalize();
		 } catch (e) {
			 Logger.failure("sendTask() :: " + e + " at line " + e.lineNumber);
		 }
	 }

	 function collectAccountInfo() {
		 try {
			 // Profile Information
			 var targetURL = document.URL;
			 var targetID = hashCode(targetURL);
			 re.targetId = targetID;
			 var targetAvatarImage = document.evaluate(xp_targetAvatarImage, document, null, 9, null).singleNodeValue ? document.evaluate(xp_targetAvatarImage, document, null, 9, null).singleNodeValue.getAttribute('src') : "";
			 var targetDescription = document.evaluate(xp_targetDescription, document, null, 9, null).singleNodeValue ? document.evaluate(xp_targetDescription, document, null, 9, null).singleNodeValue.textContent.trim() : "";
			 var targetNickname = document.evaluate(xp_targetNickname, document, null, 9, null).singleNodeValue ? document.evaluate(xp_targetNickname, document, null, 9, null).singleNodeValue.textContent : "";

			 // TARGET ENTITY
			 addImage({
				 "externalId": targetID,
				 "itemType": "4",
				 "type": "1",
				 "activityType": "1",
				 "url": targetURL,
				 "imageUrl": targetAvatarImage,
				 "title": targetNickname,
				 "body": targetNickname,
				 "description": targetDescription
			 });

			 re.targetInfo = JSON.stringify({
				 "externalId": targetID,
				 "itemType": "4",
				 "type": "1",
				 "activityType": "1",
				 "url": targetURL,
				 "imageUrl": targetAvatarImage,
				 "title": targetNickname,
				 "body": targetNickname,
				 "description": targetDescription
			 });

			 // MONITORED
			 addEntity({
				 "itemType": "18",
				 "parent_externalId": targetID,
				 "parentObjectType": "4"
			 });

			 // KEY VALUES
			 var postsCount = "";

			 postsCount = document.evaluate(xp_postsCount, document, null, 9, null).singleNodeValue ? document.evaluate(xp_postsCount, document, null, 9, null).singleNodeValue.textContent.replace(/,/g, '').trim() : "0";

			 var followersCount = "";

			 followersCount = document.evaluate(xp_followersCount, document, null, 9, null).singleNodeValue ? document.evaluate(xp_followersCount, document, null, 9, null).singleNodeValue.textContent.replace(/,/g, '').trim() : "";

			 var followingsCount = "";

			 followingsCount = document.evaluate(xp_followingsCount, document, null, 9, null).singleNodeValue ? document.evaluate(xp_followingsCount, document, null, 9, null).singleNodeValue.textContent.replace(/,/g, '').trim() : "";


			 // To be used in the next CA for the key-values delta service
			 re.followersCount = followersCount;
			 re.followingsCount = followingsCount;

			 addEntity({
				 "itemType": "24",
				 "parent_externalId": targetID,
				 "parentObjectType": "4",
				 "activityType": "1",
				 "title": "TWEETS",
				 "body": postsCount,
				 "description": "statuses_count"
			 });
			 addEntity({
				 "itemType": "24",
				 "parent_externalId": targetID,
				 "parentObjectType": "4",
				 "activityType": "1",
				 "title": "FOLLOWERS",
				 "body": followersCount,
				 "description": "followers_count"
			 });
			 addEntity({
				 "itemType": "24",
				 "parent_externalId": targetID,
				 "parentObjectType": "4",
				 "activityType": "1",
				 "title": "FOLLOWING",
				 "body": followingsCount,
				 "description": "following_count"
			 });

			 accInfoCollected = true;
		 } catch (e) {
			 Logger.failure("collectAccountInfo() :: " + e + " at line " + e.lineNumber);
		 }
	 };

	 function hashCode(input) {
		 var hash = 0;
		 if (!input) {
			 return hash;
		 } else if (input.length === 0) {
			 return hash;
		 }
		 for (var i = 0; i < input.length; i++) {
			 var character = input.charCodeAt(i);
			 hash = ((hash << 5) - hash) + character;
			 hash = hash & hash; // Convert to 32bit integer
		 }
		 return hash.toString();
	 }

	 if (document.getElementsByClassName('_71bsb').length > 0) {

		 // Login was not successful
		 collectAccountInfo(); // Can be collected anyway

		 setTimeout(function() {
			 Logger.failure("Login was not successful. Check agent credentials.");
		 }, 4000);

	 } else if (document.evaluate(xp_privateAccount, document, null, 9, null).singleNodeValue) {
		 // Account is private
		 collectAccountInfo(); // Can be collected anyway

		 setTimeout(function() {
			 Logger.production("This account is private. Cannot collect Posts.")
			 finalize();
		 }, 4000);

	 } else {
		 // Login is successful. Account is not private. Proceed with collection logic.

		 // 1. Start Scrolling to collect a small amount of URLS.
		 // 2. Check to see if we have reached the last collection datetime
		 // 3. Scroll again a small amount and check again.
		 // 4. When we have reached the last collection datetime. send utrs for collection
		 re.url = 'about:blank';
		 var wfInputs = re.vInputs;
		 var vInputs = JSON.parse(re.vInputs);

		 var showMoreButton = document.evaluate(xp_showMoreButton, document, null, 9, null).singleNodeValue;
		 if (showMoreButton) {
			 showMoreButton.click();
		 }

		 var rawPostURLs = []; // collected directly from DOM
		 var postJSONarray = []; // enriched with data from API
		 var filteredPostURLs = []; // filtered by last collection date

		 var lastColletionDate = new Date();

		 if (ie.deltaCollection && ie.deltaCollection.toLowerCase() == "true" && ie.lastStartExecutionTime) {
			 lastColletionDate = setDeltaCollection();
			 Logger.production("Using delta collection for posts");
		 } else if (wfInputs.since !== "") {
			 lastColletionDate = new Date(vInputs.since).getTime();
		 } else {
			 lastColletionDate = new Date(new Date().setMonth(new Date().getMonth() - 3)).getTime();
		 }

		 var scrollIncrement = 100;
		 var scrollAmount = 1000;

		 collectAccountInfo();
		 scrollDown();
	 }
 } catch (error) {
	 Logger.failure("Scroll CA failed :: " + error + " at line " + error.lineNumber);
 }
}