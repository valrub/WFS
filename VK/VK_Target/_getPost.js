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
                    collectComments(publishedComment, comments);
                }
            }

            if (likesKeyValue.length > 0) {

                Logger.production("likesKeyValue : " + likesKeyValue);
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

                Logger.production("sharesKeyValue : " + sharesKeyValue);
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
                Logger.production("viewsKeyValue : " + viewsKeyValue);
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
                Logger.debug("No images for this post.");
            }

            if (aPostVideo.returnCode === "200") {
                collectVideo(topic, aPostVideo);
            } else { //No info found
                Logger.debug("No video for this post.");
            }

            if (comments.returnCode === "200") {
                collectComments(topic, comments);
            }
            if (likesKeyValue.length > 0) {

                Logger.production("likesKeyValue : " + likesKeyValue);
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

                Logger.production("sharesKeyValue : " + sharesKeyValue);
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
                Logger.production("viewsKeyValue : " + viewsKeyValue);
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
        Logger.production("__asyncQueue.length = " + __asyncQueue.length);

        var waitCollection = setInterval(function() {
            if (__asyncQueue.length === 1) {
                clearInterval(waitCollection);
                removeFromQueue("getPost");
                cntItems++;
                Logger.production("We are going to collect next post");
                Logger.production("__asyncQueue.length = " + __asyncQueue.length);

            }
        }, 500);
    } catch (e) {
        handleExeption(e, "getPost");
    }

}