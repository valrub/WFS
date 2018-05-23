function getPost(thisNode, parentExternalId) {
		addToQueue("getPost");
		try {
			Logger.production(" In getPost ");
			var vPostText = _extract.GetText({
					context: thisNode,
					xpathName: "vPostText",
					mandatory: "0"
				},
				"vPostText"
			).Value;

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
				Logger.production("1 aCopyPostAuthorUrl : " + aCopyPostAuthorUrl);
				aCopyPostUrl = "https://vk.com" + aCopyPostAuthorUrl;

			} else {
				Logger.production("2 aCopyPostAuthorUrl : " + aCopyPostAuthorUrl);
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
				Logger.production("1 aCopyPostUrl : " + aCopyPostUrl);
			} else {
				Logger.production("2 aCopyPostUrl : " + aCopyPostUrl);
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
				Logger.production("1 aPostUrl : " + aPostUrl);
			} else {
				Logger.production("2 aPostUrl : " + aPostUrl);
			}

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

			var comments = _extract.GetCollection({
				context: thisNode,
				xpathName: "commentContainers",
				mandatory: "0"
			}, "comments");
			var originalPoster = {};
			if (vCopyPostAuthor) {
				if (!aCopyPostAuthorUrl.indexOf("https")) {
					originalPoster.url = aCopyPostAuthorUrl;
					originalPoster.externalId = hashCode(vCopyPostAuthor);
				} else {
					originalPoster.url = "https://vk.com" + aCopyPostAuthorUrl;
					originalPoster.externalId = hashCode(vCopyPostAuthor);function main(re, ie, oe, executor) {
    //=====================================================================