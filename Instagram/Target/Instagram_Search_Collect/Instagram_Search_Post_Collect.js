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
var xp_loadedComments = _extract.GetXPATH("loadedComments");
var xp_showMoreButton = _extract.GetXPATH("showMoreButton");
var xp_postAuthor = _extract.GetXPATH("postAuthor");
var xp_postAuthorImg = _extract.GetXPATH("postAuthorImg");
var xp_postDate = _extract.GetXPATH("postDate");
var xp_postDescription = _extract.GetXPATH("postDescription");
var xp_hasVideo = _extract.GetXPATH("hasVideo");
var xp_postImageSrc = _extract.GetXPATH("postImageSrc");
var xp_postVideoViews = _extract.GetXPATH("postVideoViews");
var xp_postImageLikes = _extract.GetXPATH("postImageLikes");
var xp_postImageLikesAlt = _extract.GetXPATH("postImageLikesAlt");
var xp_locationElement = _extract.GetXPATH("locationElement");
var xp_loadMoreComments = _extract.GetXPATH("loadMoreComments");
var xp_taggedPeople = _extract.GetXPATH("taggedPeople");
 


 //---------------------------------------------------------------------------------------------

    try {
    	var maxComments = 200;
		re.body = "";
		var scheduledImages = 0;
		var validUrl = document.URL;
		Logger.production('Current Urls is ' + validUrl);
		//variable used in dupeCheckFunction
		var collectedEntities = [];
		var urlsArray = re.placeholder1.split(',');
		var counter = parseInt(re.placeholder7);
		var commentsAreReady = false;
		re.downloadVideoFiles = true;


		// Check every 5 sec if comments are loaded
		var infiniteLoop = function() {
			try {
				if (commentsAreReady) {
					collect();

				} else {
					setTimeout(infiniteLoop, 5000);
				}
			} catch (error) {
				finalize()
				Logger.failure("Collection error: " + error);
			}
		}
		infiniteLoop();

		// Prepare Next URL
		if (counter == 1) {
			re.placeholder3 = 'false';
		} else {
			re.placeholder3 = 'true';
		}
		re.placeholder2 = urlsArray.shift();
		re.placeholder7 = (counter - 1).toString();
		re.placeholder1 = urlsArray.join();

		//===========================================



		function loadAllComments(amount) {
			var maxTime = 60000;
			var currentTime = 1000;

			var looper = function() {
				// LOAD SOME COMMENTS
				var loadedComments = document.evaluate(xp_loadedComments, document, null, 7, null);
				var showMoreButton = document.evaluate(xp_showMoreButton, document, null, 9, null).singleNodeValue;

				if (showMoreButton) {
					// There are still more comments to load

					if (loadedComments.snapshotLength < parseInt(amount)) {

						if (maxTime > currentTime) {
							// Click "Show More Comments"
							showMoreButton.click();
							currentTime += 1000;
							setTimeout(looper, 1000);
						} else {
							// Loading Comments took way too much time
							Logger.production("Loading comments didn't finish in the specified time interval.");
							console.log("Loading comments didn't finish in the specified time interval.");
							commentsAreReady = true;
						}

					} else {
						// We have loaded enough comments
						Logger.production("Loading Comments is done! Total: " + loadedComments.snapshotLength);
						console.log("Loading Comments is done! Total: " + loadedComments.snapshotLength);
						commentsAreReady = true;
					}

				} else {
					// All Comments Are Loaded
					Logger.production("All comments are loaded. Total: " + loadedComments.snapshotLength);
					console.log("All comments are loaded. Total: " + loadedComments.snapshotLength);
					commentsAreReady = true;
				}
			};
			looper();
		}

		// Start to Load Comments
		if (ie.max_comments) {
			loadAllComments(parseInt(ie.max_comments));
			Logger.production("collecting " + ie.max_comments + " comments");
		} else {
			loadAllComments(200);
		}


		function collect() {
			try {

				// POST OWNER
				var postAuthorUrl = '';
                var postAuthor = document.evaluate(xp_postAuthor, document, null, 9, null).singleNodeValue;
                
                Logger.production("VAL: xp_postAuthor = " + xp_postAuthor );
                Logger.production("VAL: postAuthor = " + postAuthor );

				if (!postAuthor) {
					Logger.debug("Xpath not found of postAuthor", "400011");
				}
				if (postAuthor.getAttribute("href").indexOf('https') === -1) {
					postAuthorUrl = "https://www.instagram.com" + postAuthor.getAttribute("href");
				} else {
					postAuthorUrl = postAuthor.getAttribute("href");
				}

				var postAuthorName = postAuthor.textContent;
				var postAuthorImg = document.evaluate(xp_postAuthorImg, document, null, 9, null).singleNodeValue ? document.evaluate(xp_postAuthorImg, document, null, 9, null).singleNodeValue.getAttribute("src") : "";

				var postOwner = {
					"externalId": hashCode(postAuthorUrl),
					"itemType": "4",
					"type": "1",
					"activityType": "1",
					"url": postAuthorUrl,
					"imageUrl": postAuthorImg,
					"title": postAuthorName,
					"body": postAuthorName
				};
				addWithDupeCheck(postOwner);
				console.log("OWNER OBJECT: " + JSON.stringify(postOwner));
				//Logger.production('PostOwner object is:' + JSON.stringify(postOwner));



				// POST OBJECT
				var postTargetUrl = window.location.href.toString();
				var postDate = document.evaluate(xp_postDate, document, null, 9, null).singleNodeValue ? document.evaluate(xp_postDate, document, null, 9, null).singleNodeValue.getAttribute("datetime") : "";
				var postDescription = document.evaluate(xp_postDescription, document, null, 9, null).singleNodeValue ? document.evaluate(xp_postDescription, document, null, 9, null).singleNodeValue.textContent : "";

				var hasVideo = document.evaluate(xp_hasVideo, document, null, 9, null);
				var isVideo = hasVideo.singleNodeValue ? true : false;
				if (isVideo) {
					var postVideoSrc = hasVideo.singleNodeValue.getAttribute('src');
				} else {
					var postImageSrc = document.evaluate(xp_postImageSrc, document, null, 9, null).singleNodeValue ? document.evaluate(xp_postImageSrc, document, null, 9, null).singleNodeValue.getAttribute('src') : "";
				}


				var post = {
					"parent_externalId": postOwner.externalId,
					"parentObjectType": postOwner.itemType,
					"writer_externalId": postOwner.externalId,
					"externalId": hashCode(postTargetUrl),
					"itemType": isVideo ? "22" : "5",
					"activityType": "1",
					"url": postTargetUrl,
					"imageUrl": isVideo ? postVideoSrc : postImageSrc,
                    //"imageUrl": postImageSrc,
					"title": "",
					"description": postDescription,
					"writeDate": getTime(postDate),
					"body": isVideo ? "<iframe width='560' height='315' src='" + postVideoSrc + "' frameborder='0' allowfullscreen></iframe>" : ""
				};

				re.placeholder20 = post.externalId;
				re.placeholder18 = validUrl;

				//addImage(post)
				console.log("OWNER OBJECT: " + JSON.stringify(postOwner));
				//Logger.production('Post object is:' + JSON.stringify(post));
				if (isVideo) {
					if (ie.downloadVideoFiles == 'true') {
						addImage(post);
					} else if (ie.downloadVideoFiles == 'false') {
						addEntity(post);
					}
				} else {
					addImage(post);
				}

				if (isVideo) {
					var postVideoViews = document.evaluate(xp_postVideoViews, document, null, 9, null).singleNodeValue;
					if (postVideoViews) {
						var postVideoViewsNumber = postVideoViews.textContent.replace(',', '');
					}

					var postImageLikes = document.evaluate(xp_postImageLikes, document, null, 9, null).singleNodeValue;
					if (!postImageLikes) {
						Logger.debug("Xpath not found of postImageLikes", "400011");
					}

					Logger.production('post image likes are' + postImageLikes);
					if (postImageLikes === null) {
						//Logger.production('post image likes less than 10');
						postImageLikes = document.evaluate(xp_postImageLikesAlt, document, null, 7, null);
						var postImageLikesNumber = postImageLikes.snapshotLength;
						//Logger.production('post image likes are ' + postImageLikesNumber);
					} else {
						var postImageLikesNumber = postImageLikes.textContent.replace(',', '');
						Logger.production('post image likes number is ' + postImageLikesNumber);
					}
				} else {

					var postImageLikes = document.evaluate(xp_postImageLikes, document, null, 9, null).singleNodeValue;
					if (!postImageLikes) {
						Logger.debug("Xpath not found of postImageLikes", "400011");
					}

					Logger.production('post image likes are' + postImageLikes);
					if (postImageLikes === null) {
						//Logger.production('post image likes less than 10');
						postImageLikes = document.evaluate(xp_postImageLikesAlt, document, null, 7, null);
						var postImageLikesNumber = postImageLikes.snapshotLength;
						//Logger.production('post image likes are ' + postImageLikesNumber);
					} else {
						var postImageLikesNumber = postImageLikes.textContent.replace(',', '');
						Logger.production('post image likes number is ' + postImageLikesNumber);
					}
				}


				// Location object

				if (document.evaluate(xp_locationElement, document, null, 9, null).singleNodeValue) {
					var locationElement = document.evaluate(xp_locationElement, document, null, 9, null).singleNodeValue;

					var locationEntity = {
						itemType: "15", // Address
						type: "3", // Location
						parent_externalId: post.externalId,
						parentObjectType: post.itemType,
						body: locationElement.textContent, // Name of Location,
						writer_externalId: postOwner.externalId, // Writer External ID
						title: locationElement.textContent
					};

					addEntity(locationEntity);
				}


				var likes = postVideoViewsNumber || postImageLikesNumber;
				likes = parseInt(likes);

				if (likes && likes > 0) {
					if (isVideo) {
						var likesCount = {
							"itemType": "24",
							"activityType": "1",
							"parent_externalId": post.externalId,
							"parentObjectType": post.itemType,
							"body": likes.toString(),
							"description": "likes_count",
							"title": "LIKES",
						};
						var viewsCount = {
							"itemType": "24",
							"activityType": "1",
							"parent_externalId": post.externalId,
							"parentObjectType": post.itemType,
							"body": likes.toString(),
							"description": "views_count",
							"title": "VIEWS",
						};
						addEntity(viewsCount);
					} else {
						var likesCount = {
							"itemType": "24",
							"activityType": "1",
							"parent_externalId": post.externalId,
							"parentObjectType": post.itemType,
							"body": likes.toString(),
							"description": "likes_count",
							"title": "LIKES",
						};
					}

					addEntity(likesCount);
					console.log("LIKES / VIEW: " + JSON.stringify(likesCount));
					Logger.debug('Likes object is:' + JSON.stringify(likesCount));
				}



				// COMMENTS
				var comments = document.evaluate(xp_loadMoreComments, document, null, 7, null);
				var commentsNumber = comments.snapshotLength;
				if (comments && commentsNumber > 0) {
					var commentCount = {
						"itemType": "24",
						"activityType": "1",
						"parent_externalId": post.externalId,
						"parentObjectType": post.itemType,
						"body": (commentsNumber - 1).toString(),
						"description": "comments_count",
						"title": "COMMENTS"
					};
					addEntity(commentCount);
					console.log("COMMENTS NUMBER: " + JSON.stringify(commentCount));
					Logger.production('Comment count object is:' + JSON.stringify(commentCount));
					if (ie.max_comments) {
						maxComments = ie.max_comments;
					}
					for (var i = 1; i < commentsNumber; i++) {
						if (i >= maxComments + 1) {
							i = commentsNumber + 1;
						} else {
							var currentComment = comments.snapshotItem(i);
							var commentAuthor = document.evaluate("./a[not(contains(text(), 'Load more comments'))]", currentComment, null, 9, null).singleNodeValue;
							var commentAuthorUrl = "";
							if (commentAuthor) {
								commentAuthorUrl = commentAuthor.getAttribute('href');
								if (commentAuthor.getAttribute('href').indexOf('https://www.instagram.com') === -1) {
									commentAuthorUrl = 'https://www.instagram.com' + commentAuthor.getAttribute('href');
								}
							}

							var xhttp = new XMLHttpRequest();
							xhttp.onreadystatechange = function() {
								if (this.readyState == 4 && this.status == 200) {

									console.warn("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=" + "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=");
									console.log("-----====" + currentComment);
									console.warn("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=" + "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=");


									if (commentAuthor) {

										var commentOwner = {
											"externalId": hashCode(commentAuthorUrl),
											"itemType": "4",
											"type": "1",
											"activityType": "1",
											"url": commentAuthorUrl,
											"title": commentAuthor.textContent.trim(),
											"imageUrl": xhttp.responseText.match(/(https:\/\/[^"]*?\.(jpg|png))/gi)[0]
										};

										addWithDupeCheck(commentOwner);
										console.log("COMMENT OWNER: " + JSON.stringify(commentOwner))

										var commentId = hashCode(postTargetUrl.split('.com/')[1] + i + commentOwner.externalId);
										var commentText = document.evaluate("./span", currentComment, null, 9, null).singleNodeValue.textContent;
										//console.log(commentText) ;  
										var comment = {
											"externalId": commentId,
											"itemType": "3",
											"type": "1",
											"activityType": "1",
											"url": post.url,
											"parent_externalId": post.externalId,
											"parentObjectType": post.itemType,
											"body": commentText,
											"writer_externalId": commentOwner.externalId
										};
										addEntity(comment);
										console.log("COMMENT TEXT: " + JSON.stringify(comment));
										Logger.debug('Comment object is:' + JSON.stringify(comment));
									}
								}

							};
							xhttp.open("GET", commentAuthorUrl, false);
							xhttp.send();
						}

					}
				}

				// TAGGED PEOPLE
				var taggedPeople = document.evaluate(xp_taggedPeople, document, null, 7, null);
				var taggedPeopleNumber = taggedPeople.snapshotLength;

				for (var j = 0; j < taggedPeopleNumber; j++) {
					var currentTaggedPerson = taggedPeople.snapshotItem(j);
					var currentTaggedPersonUrl = "";

					if (currentTaggedPerson.getAttribute('href').indexOf('https://www.instagram.com') === -1) {
						currentTaggedPersonUrl = 'https://www.instagram.com' + currentTaggedPerson.getAttribute('href');
					} else {
						currentTaggedPersonUrl = currentTaggedPerson.getAttribute('href');
					}

					var xhttpTagg = new XMLHttpRequest();
					xhttpTagg.onreadystatechange = function() {
						if (this.readyState == 4 && this.status == 200) {


							var taggedPerson = {
								"externalId": hashCode(currentTaggedPersonUrl),
								"itemType": "4",
								"type": "1",
								"activityType": "1",
								"url": currentTaggedPersonUrl,
								"title": currentTaggedPerson.textContent + " Tagg",
								"imageUrl": xhttpTagg.responseText.match(/(https:\/\/[^"]*?\.(jpg|png))/gi)[0]
							};
							addWithDupeCheck(taggedPerson);
							console.log("TAGGED PERSON: " + JSON.stringify(taggedPerson));
							//Logger.production('Tagged person object is:' + JSON.stringify(taggedPerson));

							var taggedRelation = {
								"itemType": "12",
								"type": "27",
								"activityType": "1",
								"parent_externalId": taggedPerson.externalId,
								"parentObjectType": taggedPerson.itemType,
								"sideB_externalId": post.externalId,
								"sideB_ObjectType": post.itemType
							};
							addEntity(taggedRelation);
							//console.log("TAG RELATION: " + JSON.stringify(taggedRelation));
							//Logger.production('Tagged person relation object is:' + JSON.stringify(taggedRelation));
						}


					};
					xhttpTagg.open("GET", currentTaggedPersonUrl, false);
					xhttpTagg.send();
				}

				finalize();

			} catch (e) {
				finalize();
				Logger.production('collect() failed ' + e.message);
			}
		}

		function scrollDown(callback, xpath, max, parameters) {
			try {
				var loadedElements = 0;
				var loadTime = 0;
				var maxLoadTime = 30000;
				var currentXpath = "";
				var previousLoadedElements = 0;
				var scrollInterval = setInterval(function() {
					currentXpath = document.evaluate(xpath, document, null, 7, null);
					if (currentXpath.snapshotLength < max) {
						window.scrollBy(0, 200);
						if (loadedElements == currentXpath.snapshotLength) {
							loadTime += 500;
							if (loadTime >= maxLoadTime) {
								//Logger.production('No more posts to Collect (scrolling has stopped)');
								// clear interval
								clearInterval(scrollInterval);
								// callback
								//Logger.production('currentXpath.snapshotLength < max');
								callback.apply(this, ['true']);
							}
						} else {
							loadedElements = currentXpath.snapshotLength;
							loadTime = 0;
							if (loadedElements >= previousLoadedElements + 10) {
								//sendTask();
								previousLoadedElements += 10;
							};
						}
					} else {
						// clear interval
						clearInterval(scrollInterval);
						// callback
						//Logger.production('I am in Else');
						callback.apply(this, ['true']);
					}
				}, 500);
			} catch (e) {
				console.log(e);
				//Logger.failure("scrollDown() :: " + e + " at line " + e.lineNumber);
			}
		}

		function addWithDupeCheck(entity) {
			if (!(entity.externalId in collectedEntities)) {
				collectedEntities[entity.externalId] = true;
				//console.log(entity);
				addImage(entity);
			} else {
				if (debug) {
					console.log("INFO. The entity (" + entity.title + ") is already collected.");
				}
			}
		}

		function getTime(timestamp) {
			try {
				return timestamp.slice(0, -5);
			} catch (e) {
				Logger.error(e);
			}
		}

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

		//     function addImage(entity) {
		//         try {
		//             if (re.downloadVideoFiles && entity.itemType == "22") {
		//                 Logger.production("use downloadVideoFiles function: " + re.downloadVideoFiles);
		//                 executor.downloadVideo(
		//                     executor.createVideoDownloadRequest(entity.url, "image", entity)
		//                 );
		//             } else {
		//                 if (entity.itemType == "22" && entity.image) {
		//                     Logger.production("use saveBinary function");
		//                     scheduledImages += 1;
		//                     executor.saveBinary(entity.image, onSuccess, onError, entity);
		//                 } else if (entity.imageUrl) {
		//                     scheduledImages += 1;
		//                     executor.saveBinary(entity.imageUrl, onSuccess, onError, entity);
		//                 } else {
		//                     addEntity(entity);
		//                 }
		//             }
		//         } catch (e) {
		//             Logger.error(e);
		//         }
		//     }
	} catch (error) {
		Logger.production("Post Data Collection error: " + error)
	}
}