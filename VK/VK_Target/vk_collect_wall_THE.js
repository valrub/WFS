function main(re, ie, oe, executor) {
    //=====================================================================
    if (re.executionContext.indexOf("wall") === -1) {
        executor.ready();
    }
    persistDataSettings.flushAt = 20;
    persistDataSettings.useSaveBinaryForVideos = true;
	//Initialize Global Settings
	setGlobalLogger(re, ie, oe, executor, debugLevel = 2);

	executionContext = {
		globalLogExtracted: false, //change to false before release;
		globalWPXP: xpaths.VK_Target
	};

	var _extract = new Extract(executionContext);
	var _process = new Process();

	//=====================================================================
	// GLOBAL VARIABLES

	var debug = true; // Change to false before release
	var maxResultsToCollect = re.placeholder4;
	var theTargetID = re.targetId;
	var totalAuthors = 0;
	var cntItems = 0;
	var collectedResults = 0;
	var _tmp;
	var thisNode;
	// Async flag for collecting next post
	var allPostAuthors = "";
	var __asyncQueue = [];
	var __blockPopUp = false;
	var collectedEntities = [];

	//=====================================================================
	var CAName = "VK Wall Collect";
	Logger.production(CAName + " Start Time: " + new Date(), "500100");

	//===============================================================================
	// -------------------  Here extract logic begins  ------------------------------

	/*_process.Run(collectWall, false, {
		pMarker: '4',
		functionName: 'collectWall'
	});*/
	collectWall();

	function getPost(thisNode, parentExternalId) {
		addToQueue("getPost");

		Logger.debug("POST" + thisNode.innerHTML);

		

		try{
			// // BEFORE COLLECTING COMMENTS TRY TO EXPAND ALL -----------------------------------------------------
			var thereAreMoreComments = document.evaluate(".//a[contains(text(), 'Show all')] | .//a[contains(text(), 'Show the last')]", thisNode, null, 7, null);

			var len = thereAreMoreComments.snapshotLength;

			Logger.debug('thereAreMoreComments.length = ' + len);

			var moreCommentsFound = (len > 0);
			var cnt;
			cnt = 0; 


			 if (moreCommentsFound)
			{
				Logger.debug('Am planning to expand comments (MORE THAN THREE)');

				//HOW MANY COMMENTS ARE MENTIONED?
				//xp = postCommentsValue 
				var vPostCommentsCnt = _extract.GetText({
					context: thisNode,
					xpathName: "valPostCommentsValue", //VAL14
					mandatory: "0"
				},
				"postCommentsValue"
			).Value;
			Logger.debug("SHOULD BE COMMENTS (vPostCommentsCnt) = " + vPostCommentsCnt);	


			// var vPostCommentsCntAlt = document.evaluate(".//a[contains(@class, 'like_btn comment')]/div[contains(@class, 'count')]", thisNode, null, 9, null).singleNodeValue.textContent.trim();
			// Logger.debug("SHOULD BE COMMENTS (vPostCommentsCntAlt) = " + vPostCommentsCnt);
			
			
				try {
						var el = thereAreMoreComments.snapshotItem(0); //First element to be processed

						if (el.fireEvent) {
							el.fireEvent('onclick');
						} else {
							var evObj = document.createEvent('Events');
							evObj.initEvent("click", true, false);
							el.dispatchEvent(evObj);
						}
						Logger.debug("SHOW MORE HAD BEEN - CLICKED!"); 
				} catch (e) {
					Logger.error("CLICK ERROR", "eventFire() :: " + e + " at line " + e.lineNumber);
				}



				// 	//Now, ensure that all comments are rendered
				var seeAllExpanded = setInterval(function(){
					cnt++;					
					//var postResultPosts = document.evaluate(".//a[contains(text(), 'Hide')]", thisNode, null, 7, null);	
					var postResultPosts = document.evaluate(".//div[contains(@class,'_reply_content')]/a", thisNode, null, 7, null);	
					
					//Logger.debug('FOUND COMMENTS = ' + postResultPosts.snapshotLength);
					var keepWaiting = (postResultPosts.snapshotLength < vPostCommentsCnt);				
					
					//Logger.debug("keepWaiting = " + keepWaiting);
					Logger.debug("cnt #" + cnt);
					//Logger.debug("((cnt > 10) || !keepWaiting) = " + ((cnt > 10) || !keepWaiting) );

					if ((cnt > 5) || !keepWaiting)
					{	
						Logger.production("MASPIK!", "500100");

						clearInterval(seeAllExpanded);
						removeFromQueue("getPost");
						processPost(thisNode, parentExternalId, 'AFTER EXPAND');
					}
				}, 3000);

			}else{
					Logger.debug('ONLY THREE or less comments found');
					
					removeFromQueue("getPost");
							
					processPost(thisNode, parentExternalId, 'WITHOUT EXPAND');
				}

		} catch (e) {
			handleExeption(e, "getPost");
		}
	}

	function processPost(thisNode, parentExternalId, callSrc) {
		addToQueue("processPost");

		Logger.debug('processPost was called from: ' + callSrc);
		Logger.debug("Lets see thisNode " + thisNode.innerHTML);

		//Get PostID (will be used later for comments collection)


		//------------------------------------------------------

		try {
			var vPostText = _extract.GetText({
					context: thisNode,
					xpathName: "vPostText",
					mandatory: "0"
				},
				"vPostText"
			).Value;


			var vPostTextAlt = _extract.GetAttribute({
					context: thisNode,
					xpathName: "//*[contains(@class,'_wall_post_cont')]/*[@class='wall_post_text']/img",
					mandatory: "0",
					attributeName: "alt"
				},
				"vPostTextAlt"
			).Value;


			if(!vPostText) // it could be emoji
			{	
				vPostText = vPostTextAlt;
			}

			Logger.debug('VAL_PostText Final = ' + vPostText);

			var vCopyPostText = _extract.GetText({
					context: thisNode,
					xpathName: "vCopyPostText",
					mandatory: "0"
				},
				"vCopyPostText"
			).Value;

			var vCopyPostAuthor = _extract.GetText({
					context: thisNode,
					xpathName: "vCopyPostAuthor",
					mandatory: "0"
				},
				"vCopyPostAuthor"
			).Value;

			var aCopyPostAuthorUrl = _extract.GetAttribute({
					context: thisNode,
					xpathName: "vCopyPostAuthor",
					mandatory: "0",
					attributeName: "href"
				},
				"aCopyPostAuthorUrl").Value;
			if (!(/https:\/\/vk.com/g.test(aCopyPostAuthorUrl))) {
				Logger.debug("1 aCopyPostAuthorUrl : " + aCopyPostAuthorUrl);
				aCopyPostUrl = "https://vk.com" + aCopyPostAuthorUrl;

			} else {
				Logger.debug("2 aCopyPostAuthorUrl : " + aCopyPostAuthorUrl);
			}

			var vPublishedCommentText = _extract.GetText({
					context: thisNode,
					xpathName: "vPublishedCommentText",
					mandatory: "0"
				},
				"vPublishedCommentText"
			).Value;

			var aCopyPostUrl = _extract.GetAttribute({
				context: thisNode,
				xpathName: "aCopyPostDate",
				attributeName: "href",
				mandatory: "0"
			}, "aCopyPostUrl").Value;

			if (!(/https:\/\/vk.com/g.test(aCopyPostUrl))) {
				aCopyPostUrl = "https://vk.com" + aCopyPostUrl;
				Logger.debug("1 aCopyPostUrl : " + aCopyPostUrl);
			} else {
				Logger.debug("2 aCopyPostUrl : " + aCopyPostUrl);
			}

			var aCopyPostDate = _extract.GetText({
					context: thisNode,
					xpathName: "aCopyPostDate",
					mandatory: "0"
				},
				"aCopyPostDate"
			).Value;

			var vPostDate = _extract.GetText({
					context: thisNode,
					xpathName: "vPostDate",
					mandatory: "0"
				},
				"vPostDate"
			).Value;

			var aPostUrl = _extract.GetAttribute({
				context: thisNode,
				xpathName: "aPostUrl",
				attributeName: "href",
				mandatory: "0"
			}, "aPostUrl").Value;
			if (!(/https:\/\/vk.com/g.test(aPostUrl))) {
				aPostUrl = "https://vk.com" + aPostUrl;
				Logger.debug("1 aPostUrl : " + aPostUrl);
			} else {
				Logger.debug("2 aPostUrl : " + aPostUrl);
			}

			var postID = aPostUrl.substring(aPostUrl.indexOf('com/wall') + 8, aPostUrl.length); //POSTID
			
			Logger.debug("PostID = " + postID);

			var likesKeyValue = _extract.GetText({
					context: thisNode,
					xpathName: "postLikesKeyValue",
					mandatory: "0"
				},
				"postLikesKeyValue"
			).Value;

			var sharesKeyValue = _extract.GetText({
					context: thisNode,
					xpathName: "postSharesKeyValue",
					mandatory: "0"
				},
				"postSharesKeyValue"
			).Value;

			var viewsKeyValue = _extract.GetText({
					context: thisNode,
					xpathName: "postViewsKeyValue",
					mandatory: "0"
				},
				"postViewsKeyValue"
			).Value;

			var aPostImg = _extract.GetCollection({
				context: thisNode,
				xpathName: "aPostImg",
				mandatory: "0"
			}, "aPostImg");


			var aPostVideo = _extract.GetCollection({
				context: thisNode,
				xpathName: "aPostVideo",
				mandatory: "0"
			}, "aPostVideo");

			var aPublishedCommentImg = _extract.GetCollection({
				context: thisNode,
				xpathName: "aPublishedCommentImg",
				mandatory: "0"
			}, "aPublishedCommentImg");

			var aPublishedCommentVideo = _extract.GetCollection({
				context: thisNode,
				xpathName: "aPublishedCommentVideo",
				mandatory: "0"
			}, "aPublishedCommentVideo");

			var aCopyPostImg = _extract.GetCollection({
				context: thisNode,
				xpathName: "aCopyPostImg",
				mandatory: "0"
			}, "aCopyPostImg");

			var aCopyPostVideo = _extract.GetCollection({
				context: thisNode,
				xpathName: "aCopyPostVideo",
				mandatory: "0"
			}, "aCopyPostVideo");


			//------------------------------------------------------
			// Now base search of comments on postID
			var commXP = ".//*[@id='replies" + postID + "']/div";
			Logger.debug("commXP = " + commXP);

			Logger.debug(" --------------------------------------------> 1");

			var comments = _extract.GetCollection({
				context: document,
				xpathName: commXP, //"commentContainers",
				mandatory: "0"
			}, "commentsX");

	

			var originalPoster = {};
			
			if (vCopyPostAuthor) {
				if (!aCopyPostAuthorUrl.indexOf("https")) {
					originalPoster.url = aCopyPostAuthorUrl;
					originalPoster.externalId = hashCode(vCopyPostAuthor);
				} else {
					originalPoster.url = "https://vk.com" + aCopyPostAuthorUrl;
					originalPoster.externalId = hashCode(vCopyPostAuthor);
				}

				originalPoster.itemType = "4";

				originalPoster.type = "1";
				originalPoster.title = vCopyPostAuthor;
				originalPoster.extractDate = "";
				originalPoster.activityType = "1";


				if (allPostAuthors.indexOf(originalPoster.externalId) === -1) {
					allPostAuthors += originalPoster.externalId + ";";
					addEntity(originalPoster);
					totalAuthors++;
				}

				var cTopic = {};
				cTopic.parent_externalId = theTargetID;
				cTopic.parentObjectType = "4";
				cTopic.type = "";
				cTopic.itemType = "2";
				cTopic.url = aCopyPostUrl;
				cTopic.body = vCopyPostText;
				cTopic.title = "";
				cTopic.description = "";
				cTopic.writeDate = aCopyPostDate;
				cTopic.writer_externalId = originalPoster.externalId;
				cTopic.extractDate = "";
				cTopic.activityType = "1";
				cTopic.externalId = "repostId_" + cTopic.url.match(/wall[\-]*(\d+(\_\d+)?)/g);

				addEntity(cTopic);

				if (aCopyPostImg.returnCode === "200") {
					collectImage(cTopic, aCopyPostImg);
				}

				if (aCopyPostVideo.returnCode === "200") {
					collectVideo(cTopic, aCopyPostVideo);
				}

				if (vPublishedCommentText) {
					var publishedComment = {};
					publishedComment.writer_externalId = theTargetID;
					publishedComment.parent_externalId = cTopic.externalId;
					publishedComment.parentObjectType = "4";
					publishedComment.body = vPublishedCommentText;
					publishedComment.itemType = "3"; //comment
					publishedComment.url = re.url + aCopyPostUrl;
					publishedComment.type = "9"; //shared link
					publishedComment.writeDate = vPostDate;
					publishedComment.externalId = "pComment_id_" + hashCode(publishedComment.writeDate + publishedComment.body);
					publishedComment.activityType = "1";

					addEntity(publishedComment);

					if (aPublishedCommentImg.returnCode === "200") {
						collectImage(publishedComment, aPublishedCommentImg);
					}

					if (aPublishedCommentVideo.returnCode === "200") {
						collectVideo(publishedComment, aPublishedCommentVideo);
					}

					if (comments.returnCode === "200") {
						Logger.debug('CALL TO collectComments line 393');
						collectComments(publishedComment, comments);
					}
				}

				if (likesKeyValue.length > 0) {

					Logger.debug("likesKeyValue : " + likesKeyValue, "500100");
					//Key-value for likes
					addEntity({
						itemType: "24", // Key-Value
						parent_externalId: cTopic.externalId,
						parentObjectType: cTopic.itemType,
						activityType: "1", // Integer
						title: "LIKES",
						body: likesKeyValue,
						description: "likes_count"
					});
					collectLikes(cTopic, thisNode);

				}

				if (sharesKeyValue.length > 0) {

					Logger.debug("sharesKeyValue : " + sharesKeyValue, "500100");
					//Key-value for likes
					addEntity({
						itemType: "24", // Key-Value
						parent_externalId: cTopic.externalId,
						parentObjectType: cTopic.itemType,
						activityType: "1", // Integer
						title: "SHARES",
						body: sharesKeyValue,
						description: "shares_count"
					});
					collectShares(cTopic, thisNode);

				}
				if (viewsKeyValue.length > 0) {
					Logger.debug("viewsKeyValue : " + viewsKeyValue, "500100");
					//Key-value for likes
					addEntity({
						itemType: "24", // Key-Value
						parent_externalId: cTopic.externalId,
						parentObjectType: cTopic.itemType,
						activityType: "1", // Integer
						title: "VIEWS",
						body: viewsKeyValue,
						description: "views_count"
					});
				}

			} else if (vPostText) {
				var topic = {};
				topic.parent_externalId = theTargetID;
				topic.parentObjectType = "4";
				topic.itemType = "2";
				topic.url = aPostUrl;
				topic.body = vPostText;
				topic.title = "";
				topic.description = "";
				topic.writeDate = vPostDate;
				topic.writer_externalId = theTargetID;
				topic.extractDate = "";
				topic.externalId = "postId" + topic.url.match(/wall[\-]*(\d+(\_\d+)?)/g);
				topic.activityType = "1";
				addEntity(topic);

				if (aPostImg.returnCode === "200") {
					collectImage(topic, aPostImg);

				} else { //No info found
					Logger.error("No images for this post." + aPostImg.returnCode);
				}

				if (aPostVideo.returnCode === "200") {
					collectVideo(topic, aPostVideo);
				} else { //No info found
					Logger.error("No video for this post.");
				}

				if (comments.returnCode === "200") {
					Logger.debug('CALL TO collectComments line 474');
					collectComments(topic, comments);
				}
				if (likesKeyValue.length > 0) {

					Logger.debug("likesKeyValue : " + likesKeyValue, "500100");
					//Key-value for likes
					addEntity({
						itemType: "24", // Key-Value
						parent_externalId: topic.externalId,
						parentObjectType: topic.itemType,
						activityType: "1", // Integer
						title: "LIKES",
						body: likesKeyValue,
						description: "likes_count"
					});
					collectLikes(topic, thisNode);
				}
				if (sharesKeyValue.length > 0) {

					Logger.debug("sharesKeyValue : " + sharesKeyValue, "500100");
					//Key-value for likes
					addEntity({
						itemType: "24", // Key-Value
						parent_externalId: topic.externalId,
						parentObjectType: topic.itemType,
						activityType: "1", // Integer
						title: "SHARES",
						body: sharesKeyValue,
						description: "shares_count"
					});
					collectShares(topic, thisNode);

				}
				if (viewsKeyValue.length > 0) {
					Logger.debug("viewsKeyValue : " + viewsKeyValue, "500100");
					//Key-value for likes
					addEntity({
						itemType: "24", // Key-Value
						parent_externalId: topic.externalId,
						parentObjectType: topic.itemType,
						activityType: "1", // Integer
						title: "VIEWS",
						body: viewsKeyValue,
						description: "views_count"
					});
				}

			}
			Logger.debug("__asyncQueue.length = " + __asyncQueue.length);

			var waitCollection = setInterval(function() {
				if (__asyncQueue.length === 1) {
					clearInterval(waitCollection);
					removeFromQueue("processPost");
					cntItems++;
					Logger.debug("We are going to collect next post");
					Logger.debug("__asyncQueue.length = " + __asyncQueue.length);
				}
			}, 500);
		} catch (e) {
			handleExeption(e, "getPost");
		}

	}





	function collectComments(parent, currNode) {
		addToQueue("collectComments");
		try {
			Logger.production(" In collectComments ", "500100");

			var iterator = currNode.Value;
			var curr = true;
			var i = 0; //iterator for the comment id


			// MMM --------------------------
			curr = iterator.iterateNext();
			while (curr) {
				//curr = iterator.iterateNext();
				
				Logger.debug('Current_Comment[' + i + '] >>>>>>>>>>>>>>>>>>>>>>>>>');
				//Logger.debug(curr.innerHTML);

				i++;

				if(curr === null){
					break;
				}
				var aCommentImg = _extract.GetCollection({
						context: curr,
						xpathName: "aCommentImg",
						mandatory: "0"
					}, "aCommentImg");

					var aCommentVideo = _extract.GetCollection({
						context: curr,
						xpathName: "aCommentVideo",
						mandatory: "0"
					}, "aCommentVideo");

				

				// VAL13
				var commentAuthor = _extract.GetText({
					context: curr,
					xpathName: "valCommentAuthor", 
					mandatory: "0"
				},
				"commentAuthor"
				).Value;
				Logger.debug('commentAuthor = ' + commentAuthor);

				var currentComment = _extract.GetText({
					context: curr,
					xpathName: "valCommentText", 
					mandatory: "0"
				},
				"currentComment"
				).Value;
				Logger.debug('currentComment = ' + currentComment);


				var currentCommentDate = _extract.GetText({
					context: curr,
					xpathName: "valCommentDate", 
					mandatory: "0"
				},
				"currentCommentDate"
				).Value;
				Logger.debug('currentCommentDate = ' + currentCommentDate);
				
				

				var comment = {};
				comment.itemType = "3";
				comment.type = "1";
				comment.parent_externalId = parent.externalId;
				comment.parentObjectType = parent.itemType;
				comment.url = parent.url;
				comment.writer_externalId = "";
				comment.writeDate = currentCommentDate; //.singleNodeValue.textContent;
				comment.externalId = "comment_id_" + hashCode(comment.url + i);

				var commenter = {};
				if (commentAuthor) { //.singleNodeValue.textContent) {
					var _id = _extract.GetAttribute({
						context: curr,
						xpathName: "valCommentAuthor", 
					   attributeName: "data-from-id", 
						mandatory: "0"
					},"_id").Value;
					Logger.debug('_id = ' + _id);

					commenter.externalId = hashCode(_id); //VAL


					var _url = _extract.GetAttribute({
						context: curr,
						xpathName: "valCommentAuthor", 
					   attributeName: "href", 
						mandatory: "0"
					},"_url").Value;
					Logger.debug('_url = ' + _url);
					

					if (_url) {
						commenter.url = _url;	
					} else {
						commenter.url = "about:blank";
					}





					commenter.itemType = "4";
					commenter.type = "1";
					commenter.title = commentAuthor; //.singleNodeValue.textContent;
					commenter.activityType = "1";

					comment.writer_externalId = commenter.externalId;
					if (allPostAuthors.indexOf(commenter.externalId) === -1) {
						allPostAuthors += commenter.externalId + ";";
						addEntity(commenter);
						totalAuthors++;
					}
				}
				
				if (currentComment) {
					comment.body = currentComment; //.singleNodeValue.textContent;
				}
				addEntity(comment);
				if (aCommentImg.returnCode === "200") {
					collectImage(comment, aCommentImg);
				}
				if (aCommentVideo.returnCode === "200") {
					collectVideo(comment, aCommentVideo);
				}

				curr = iterator.iterateNext();
			}
			addEntity({
				itemType: "24", // Key-Value
				parent_externalId: parent.externalId,
				parentObjectType: parent.itemType,
				activityType: "1", // Integer
				title: "COMMENTS",
				body: i,
				description: "comments_count"
			});
			// MMM |------------------------
			removeFromQueue("collectComments");
		} catch (e) {
			handleExeption(e, "collectComments");
		}
	}


	function collectImage(parent, currImgNode) {

	
		addToQueue("collectImage");

		try {
			Logger.production(" In collectImage ", "500100");
			
			

			var iterator = currImgNode.Value;
			var curr = iterator.iterateNext();


			

			while (curr) {
				//----------------------->
				var url = document.evaluate(".//a[contains(@class, 'image_cover')]", curr, null, 9, null);
				var loc = document.evaluate(".//a[contains(@class, 'media_place')]", curr, null, 9, null); 

				if(url.singleNodeValue)
					var theUrl = url.singleNodeValue.getAttribute('style').match(/http(.+\b)/g)[0];
				else
					var theUrl = 'No URL';
				
				if(loc.singleNodeValue)
				{
					var theLoc = loc.singleNodeValue.textContent.trim();

					let adrs = {};

					adrs.itemType = 15; // address
					adrs.type = 3; //location
					adrs.parent_externalId = parent.externalId;
					adrs.parentObjectType = parent.itemType;
					// adrs.description = responseObj[i].interaction.city;
					// adrs.title = responseObj[i].interaction.state_code;
					adrs.body = theLoc;
					adrs.title = theLoc;
					adrs.description = theLoc;
					adrs.url = theLoc;
					adrs.writer_externalId = parent.writer_externalId;
					// adrs.imageUrl = responseObj[i].interaction.postal_code;
					// adrs.coordinateX = responseObj[i].interaction.geo_long;
					// adrs.coordinateY = responseObj[i].interaction.geo_lat;

					addEntity(adrs);
				}else
					var theLoc = 'NO LOCATION';
				
				Logger.debug('ИТАК: ' + theLoc + '  -  ' + theUrl);
				//----------------------->


				var img = {};
				img.parent_externalId = parent.externalId;
				img.parentObjectType = parent.itemType;
				img.writer_externalId = parent.writer_externalId;
				img.writeDate = parent.writeDate;
				img.itemType = "5";

				
				img.imageUrl = theUrl; //linkToImg.match(/http(.+\b)/g)[0]; //curr.getAttribute("style").match(/http(.+\b)/g)[0];
				
				img.url = parent.url;
				img.externalId = "img_id_" + hashCode(img.imageUrl);
				img.activityType = "1";
				addImage(img);

				curr = iterator.iterateNext();

			}
			removeFromQueue("collectImage");
		} catch (e) {
			handleExeption(e, "collectImage");
		}
	}

	function collectVideo(parent, currVideoNode) {
		addToQueue("collectVideo");

		try {
			Logger.production(" In collectVideo ", "500100");
			var iterator = currVideoNode.Value;
			var curr = iterator.iterateNext();
			Logger.debug("currVideoNode.Length = " + currVideoNode.Length);
			while (curr) {
				var videoUrl = document.evaluate(".//video", curr, null, 9, null).singleNodeValue.getAttribute("src");
				var video = {};
				video.parent_externalId = parent.externalId;
				video.parentObjectType = parent.itemType;
				video.writer_externalId = parent.writer_externalId;
				video.writeDate = parent.writeDate;
				video.itemType = "22";
				video.imageUrl = curr.href;
				video.url = parent.url;
				video.body = videoUrl ? "<iframe src=" + videoUrl + "></iframe>" : "<iframe src=" + video.imageUrl + "></iframe>";
				video.externalId = "video_id_" + hashCode(video.imageUrl);
				video.activityType = "1";

				addImage(video);
				Logger.production(" In collectVideo ", "500100");
				curr = iterator.iterateNext();
			}

			removeFromQueue("collectVideo");

		} catch (e) {
			handleExeption(e, "collectVideo");
		}
	}

	function hashCode(input) {
		var hash = 0;
		if (!input) return hash;
		else if (input.length === 0) return hash;
		for (var i = 0; i < input.length; i++) {
			var character = input.charCodeAt(i);
			hash = ((hash << 5) - hash) + character;
			hash = hash & hash; // Convert to 32bit integer
		}
		return hash.toString();
	}

	function collectLikes(parent, currNode) {
		addToQueue("collectLikes");
		try {
			//Some properties data.        
			var dataId = currNode.getAttribute("data-post-id");
			if (dataId) {
				var likersUrl = re.url + "?w=likes%2Fwall" + dataId;

				addEntity({
					coordinateX: likersUrl,
					coordinateX_1: parent.externalId,
					coordinateY_1: parent.itemType,
					placeholder1: "https://vk.com/",
					coordinateY: "100",
					coordinateY_1_1: parent.url
				});
				Logger.debug('URL is ' + re.url + "?w=likes%2Fwall" + dataId);

			}
			removeFromQueue("collectLikes");
		} catch (e) {
			handleExeption(e, "collectLikes");
		}

	}

	function collectShares(parent, currNode) {
		addToQueue("collectShares");
		try {
			//Some properties data.        
			var dataId = currNode.getAttribute("data-post-id");
			if (dataId) {
				var sharersUrl = re.url + "?w=shares%2Fwall" + dataId;

				addEntity({
					coordinateX: sharersUrl,
					coordinateX_1: parent.externalId,
					coordinateY_1: parent.itemType,
					placeholder1: "https://vk.com/",
					coordinateY: "100",
					coordinateY_1_1: parent.url
				});
				Logger.debug('URL is ' + re.url + "?w=likes%2Fwall" + dataId);

			}
			removeFromQueue("collectShares");
		} catch (e) {
			handleExeption(e, "collectShares");
		}

	}



	function collectWall(pMarker, pContext) {
		try {
			var results = document.evaluate(xpaths.VK_Target.vPosts, document, null, 7, null);

			Logger.production("We have : " + results.snapshotLength + " posts.", "500500");

			var postInterval = setInterval(function() {


				if (checkAllCollected(collectedResults)) {

					var result = results.snapshotItem(cntItems);


					if (!isCollectionLimitReached() && result) {
						if (debug) Logger.production('Collect post #' + cntItems);
						getPost(result, theTargetID);


					} else {
						
						Logger.production("We reach the maximum number of posts", "500102");
						clearInterval(postInterval);
						Logger.production(CAName + " End Time: " + new Date());
						Logger.production('photos url is ' + re.placeholder2, "500100");
						Logger.production('friends url is ' + re.gender, "500100");
						finalize();

					}

				} else {
					
					//Logger.debug("checkAllCollected -> working..." + __asyncQueue);

				}

			}, 1000);


		} catch (e) {
			handleExeption(e, "collectWall");
		}

	}


	///////////////////////////////
	function addToQueue(name) {
		__asyncQueue.push(name);
	} //VAL13

	function removeFromQueue(name) {
		var index = __asyncQueue.indexOf(name);
		if (index !== -1) {
			if (debug) console.info("REMOVING ------------>>>>>>>>>>>>>>>>>> " + name);
			__asyncQueue.splice(index, 1);
		}
	}

	function checkAllCollected(collectedResults) {
		if (debug && __asyncQueue.length === 0 && collectedResults !== 0) {
			Logger.production("--- Collected ---\nCOMMENTS: " + collectedComments + "\nLIKES: " + collectedLikes + "\nTAGGED: " + collectedTags + "\nSHARES: " + collectedShares, "500500");
		}
		return (__asyncQueue.length === 0);
	}

	function isCollectionLimitReached() {
		if (cntItems >= maxResultsToCollect) {
			executor.reportError('200', 'INFO', "Limit of " + maxResultsToCollect + " results is reached! The flow won't collect more posts where target is tagged results!", false);
			return true;
		} else {
			executor.reportError('200', 'INFO', "Limit not reached! " + cntItems + " of " + maxResultsToCollect + " left", false);
			return false;
		}
	}

	function handleExeption(e, name, interval) {
		if (typeof interval === "number") {
			clearInterval(interval);
		} else if (interval instanceof Array) {
			for (var i = 0; i < interval.length; i++) {
				clearInterval(interval[i]);
			}
		}
		removeFromQueue(name);
		executor.reportError("500", "ERROR", name + "() :: " + e + " at line " + e.lineNumber, false);
	}



}