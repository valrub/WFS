function main(re, ie, oe, executor) {
//=====================================================================
    //Initialize Global Settings
    setGlobalLogger(re, ie, oe, executor);
    var WPXP = xpaths.VK_Search_Activities;
    executionContext = {
        globalLogExtracted: false, //change to false before release;
        globalWPXP: xpaths.VK_Search_Activities
    };

    var _extract = new Extract(executionContext);
    var _process = new Process();

    //=====================================================================
    // GLOBAL VARIABLES
    var collectedAuthors = [];
    var cntItems = 0;
    var totalAuthors = 0;
    var _tmp;

    //=====================================================================

    /*if (re.url === "") {
     re.gender = "false";
     } else {
     urlsForAccountInfo = re.allUrls.split(";");
     re.url = "" + urlsForAccountInfo.shift();
     if ((re.url == NaN || re.url == "") || re.url == undefined) {
     Logger.production("next url is undefined " + re.url);
     re.gender = "false";
     re.url = "" + urlsForAccountInfo.shift();
     } else {
     re.allUrls = urlsForAccountInfo.join(";");
     Logger.production("next url " + re.url);
     re.gender = "true";
     }

     }*/
    if (/https:\/\/vk\.com/.test(re.url.toString())) {
        urlsForAccountInfo = re.allUrls.split(";");
        re.url = "" + urlsForAccountInfo.shift();
        re.allUrls = urlsForAccountInfo.join(";");
        re.gender = "true";
    } else {
        re.gender = "false";
        Logger.debug("end url " + re.url);
        finalize(true);
    }

    //===============================================================================
    // -------------------  Here extract logic begins  ------------------------------

    _process.Run(getPosts,false, {pMarker:'1:', functionName: 'getPosts'});

    // ----------------------------- HANDLERS  --------------------------------------


    function getPosts(pMarker, pContext) {

        Logger.production("Start collection");

        postsCounter = 0;
        var _res= {
            totalCollected:0,
            returnCode: ""
        };

        try {
            
            var vWallHidden = _extract.GetText(
                {
                    xpathName: "vWallHidden",
                    mandatory: "0"
                },
                pMarker + "vWallHidden"
            ).Value;
            
            if (vWallHidden) {
                Logger.error("This post is hidden.");
                executor.ready();
            }

            var writerName = _extract.GetText(
                {
                    xpathName: "postWriter",
                    mandatory: "0"
                },
                pMarker + "writerName"
            ).Value;

            var writerId = _extract.GetAttribute(
                {
                    xpathName: "postWriter",
                    attributeName: "data-from-id",
                    mandatory: "0",
                },
                pMarker + "writerId"
            ).Value;

            var postWriterImage = _extract.GetAttribute(
                {
                    xpathName: "postWriterImage",
                    attributeName: "src",
                    mandatory: "0"
                },
                pMarker + "postWriterImage"
            ).Value;

            var writerUrl = _extract.GetAttribute(
                {
                    xpathName: "postWriter",
                    attributeName: "href",
                    mandatory: "0",
                },
                pMarker + "writerUrl"
            ).Value;

            var writeDate = _extract.GetText(
                {
                    xpathName: "postDate",
                    mandatory: "0"
                },
                pMarker + "writeDate"
            ).Value;

            var postUrl = _extract.GetAttribute(
                {
                    xpathName: "postUrl",
                    attributeName: "href",
                    mandatory: "0"
                },
                pMarker + "postUrl"
            ).Value;

            var parentPost = _extract.GetText(
                {
                    xpathName: "parentPost",
                    mandatory: "0"
                },
                pMarker + "parentPost"
            ).Value;

            var postBody = _extract.GetText(
                {
                    xpathName: "postBody",
                    mandatory: "0"
                },
                pMarker + "postBody"
            ).Value;

            postBody += _extract.GetText(
                {
                    xpathName: "hidenText",
                    mandatory: "0"
                },
                pMarker + "postBody - hiden"
            ).Value;

            /* var postImage = _extract.GetAttribute(
             {
             xpathName: "postImage",
             attributeName: "style",
             mandatory: "0"
             },
             pMarker + "postImage"
             ).Value;

             if (postImage != null) {
             postImage = postImage.match(/http.+jpg/)[0];
             }

             var postVideo = _extract.GetAttribute(
             {
             xpathName: "postVideo",
             attributeName: "href",
             mandatory: "0"
             },
             pMarker + "postVideo"
             ).Value;*/

            var postImage = _extract.GetCollection({
                xpathName: "postImage",
                mandatory: "0"
            }, "postImage");

            var postVideo = _extract.GetCollection({
                xpathName: "postVideo",
                mandatory: "0"
            }, "postVideo");

            var postLikesValue = _extract.GetText(
                {
                    xpathName: "postLikes",
                    mandatory: "0"
                },
                pMarker + "postLikesValue"
            ).Value;

            var postSharesValue = _extract.GetText(
                {
                    xpathName: "postShares",
                    mandatory: "0"
                },
                pMarker + "postSharesValue"
            ).Value;

            var postCommentsValue = _extract.GetText(
                {
                    xpathName: "postCommentsValue",
                    mandatory: "0"
                },
                pMarker + "postCommentsValue"
            ).Value;

            var comments = _extract.GetCollection(
                {
                    xpathName: "commentContainers",
                    mandatory: "0"
                },
                pMarker +  "commentContainers"
            );


            var copyPostText = _extract.GetText(
                {
                    xpathName: "copyPostText",
                    mandatory: "0"
                }, "copyPostText"
            ).Value;

            var copyPostAuthor = _extract.GetText(
                {
                    xpathName: "copyPostAuthor",
                    mandatory: "0"
                }, "copyPostAuthor"
            ).Value;

            Logger.production("VAL: copyPostAuthor = " + copyPostAuthor);

            var copyPostAuthorUrl = _extract.GetAttribute(
                {
                    xpathName: "copyPostAuthor",
                    mandatory: "0",
                    attributeName: "href"
                }, "copyPostAuthorUrl"
            ).Value;

            Logger.production("VAL: copyPostAuthorUrl = " + copyPostAuthorUrl);

            var copyPostUrl = _extract.GetAttribute(
                {
                    xpathName: "copyPostDate",
                    attributeName: "href",
                    mandatory: "0"
                }, "copyPostUrl"
            ).Value;

            var copyPostDate = _extract.GetText(
                {
                    xpathName: "copyPostDate",
                    mandatory: "0"
                },
                "copyPostDate"
            ).Value;

            var copyPostImg = _extract.GetCollection({
                xpathName: "copyPostImg",
                mandatory: "0"
            }, "copyPostImg");

            var copyPostVideo = _extract.GetCollection({

                xpathName: "copyPostVideo",
                mandatory: "0"
            }, "copyPostVideo");

            var publishedCommentText = _extract.GetText({

                    xpathName: "publishedCommentText",
                    mandatory: "0"
                },
                "publishedCommentText"
            ).Value;

            var publishedCommentImg = _extract.GetCollection({

                xpathName: "publishedCommentImg",
                mandatory: "0"
            }, "publishedCommentImg");

            var publishedCommentVideo = _extract.GetCollection({

                xpathName: "publishedCommentVideo",
                mandatory: "0"
            }, "publishedCommentVideo");

            //-------------------Save writer--------------------------


            if (writerId.toString() !== "NaN") {
                Logger.production("We will collect writer with ID :: " + writerId);
                var writer = {};
                writer.externalId = "writer_Id_" + hashCode(writerId);
                writer.itemType = "4"; // Web entity
                writer.type = "1"; //Person
                writer.activityType = "1"; //Social Network
                writer.url = writerUrl;
                writer.title = writerName;
                writer.imageUrl = postWriterImage;

                //Check is the writer already collected
                if (!(' ' + writerId in collectedAuthors)) {
                    collectedAuthors[(' ' + writerId)] = true;
                    addImage(writer);
                    cntItems++;
                } else {
                    Logger.production(writerId + " is already collected");
                }
            }


            //-------------------Save post--------------------------
            if (copyPostAuthor.toString() !== "NaN") {
                Logger.production("we will collect copy post");
                var originalPoster = {};
                originalPoster.externalId = "writer_Id_" + hashCode(copyPostAuthor);
                originalPoster.itemType = "4";
                originalPoster.url = re.url + copyPostAuthorUrl;
                originalPoster.type = "1";
                originalPoster.title = copyPostAuthor;
                originalPoster.extractDate = "";

                if (!(' ' + writerId in collectedAuthors)) {
                    collectedAuthors[(' ' + writerId)] = true;
                    addEntity(originalPoster);
                    cntItems++;
                } else {
                    Logger.production(writerId + " is already collected");
                }

                var cTopic = {};
                cTopic.parent_externalId = writer.externalId;
                cTopic.parentObjectType = "4";
                cTopic.type = "";
                cTopic.itemType = "2";
                cTopic.url = re.url + copyPostUrl;
                cTopic.body = copyPostText;
                cTopic.title = "";
                cTopic.description = "";
                cTopic.writeDate = copyPostDate;
                cTopic.writer_externalId = originalPoster.externalId;
                cTopic.extractDate = "";
                cTopic.externalId = "repostId_" + hashCode(cTopic.writeDate + cTopic.body);
                addEntity(cTopic);
                cntItems++;


                if (copyPostVideo.returnCode === "200") {
                    //collectVideo(cTopic, copyPostVideo);
                }
                else if (copyPostImg.returnCode === "200") {
                    collectImage(cTopic, copyPostImg);

                }

                if (publishedCommentText.toString() !== "NaN") {
                    var publishedComment = {};
                    publishedComment.writer_externalId = writer.externalId;
                    publishedComment.parent_externalId = cTopic.externalId;
                    publishedComment.parentObjectType = "4";
                    publishedComment.body = publishedCommentText;
                    publishedComment.itemType = "3"; //comment
                    publishedComment.url = re.url + copyPostUrl;
                    publishedComment.type = "9"; //shared link
                    publishedComment.writeDate = writeDate;
                    publishedComment.externalId = "pComment_id_" + hashCode(publishedComment.writeDate + publishedComment.body);

                    addEntity(publishedComment);

                    if (publishedCommentImg.returnCode === "200") {
                        Logger.production("we will collect image from share");
                        collectImage(publishedComment, publishedCommentImg);

                    }

                    if (publishedCommentVideo.returnCode === "200") {
                        //collectVideo(publishedComment, publishedCommentVideo);

                    }

                    if (comments.returnCode === "200") {
                        //collectComments(publishedComment, comments);
                    }
                }

            }
            else if (postBody.toString() !== "NaN") {
                Logger.production("we will collect  post");
                var post = {};

                post.externalId = postUrl;
                post.url = postUrl;
                post.itemType = "2"; // Topic
                post.activityType = "1"; // Social Network
                post.body = postBody;
                post.writer_externalId = writer.externalId;
                post.writeDate = writeDate;
                post.parent_externalId = writer.externalId;
                post.parentObjectType = writer.itemType;


                addEntity(post);
                cntItems++;
                if (postImage.returnCode === "200") {
                    Logger.production("we will collect image from post");
                    collectImage(post, postImage);

                } else { //No info found
                    Logger.debug("No images for this post.");
                }

                if (postVideo.returnCode === "200") {
                    Logger.production("we will collect video from post");
                    collectVideo(post, postVideo);
                } else { //No info found
                    Logger.debug("No video for this post.");
                }
                var likesKeyValue = {};
                likesKeyValue.itemType = "24"; //Key-value
                likesKeyValue.activityType = "1"; //Numeric
                likesKeyValue.body = postLikesValue;
                likesKeyValue.title = "LIKES";
                likesKeyValue.description = "likes_count";
                likesKeyValue.parent_externalId = post.externalId;
                likesKeyValue.parentObjectType = "2"; //Topic

                addEntity(likesKeyValue);
                cntItems++;

                var sharesKeyValue = {};
                sharesKeyValue.itemType = "24"; //Key-value
                sharesKeyValue.activityType = "1"; //Numeric
                sharesKeyValue.body = postSharesValue;
                sharesKeyValue.title = "SHARES";
                sharesKeyValue.description = "shares_count";
                sharesKeyValue.parent_externalId = post.externalId;
                sharesKeyValue.parentObjectType = "2"; //Topic

                addEntity(sharesKeyValue);
                cntItems++;

                if(postCommentsValue != null) {
                    var commentsKeyValue = {};
                    commentsKeyValue.itemType = "24"; //Key-value
                    commentsKeyValue.activityType = "1"; //Numeric
                    commentsKeyValue.body = postCommentsValue;
                    commentsKeyValue.title = "COMMENTS";
                    commentsKeyValue.description = "comments_count";
                    commentsKeyValue.parent_externalId = post.externalId;
                    commentsKeyValue.parentObjectType = "2"; //Topic

                    addEntity(commentsKeyValue);
                    cntItems++;
                }
                if (comments.returnCode === "200") {
                    Logger.production("We will collect comments.");
                    collectComments(post, comments);
                } else {
                    postsCounter = cntItems;
                    _res.totalCollected = postsCounter;
                    _res.returnCode = "200";
                }
            }
        }
        catch(e) {
            Logger.error("getPosts('getPosts', '5' - DID NOT WORK - " + e.message);
            _res.totalCollected = postsCounter;
            _res.returnCode = "504 " + e.message;
        }
        return _res;

    }

    function collectComments(parent, currNode) {
        Logger.production("we will collect comments of : " + currNode);
        var iterator = currNode.Value;
        var curr = iterator.iterateNext();
        var i = 0; //iterator for the comment id

        while (curr) {
            i++;
            var commentText = _extract.GetText({
                context: curr,
                xpathName: "commentText",
                mandatory: "0"
            }, "commentText").Value;

            var commentImg = _extract.GetCollection({
                context: curr,
                xpathName: "commentImg",
                mandatory: "0"
            }, "commentImg");

            var commentVideo = _extract.GetCollection({
                context: curr,
                xpathName: "commentVideo",
                mandatory: "0"
            }, "commentVideo");

            var commentAuthor = _extract.GetText({
                context: curr,
                xpathName: "commentAuthor",
                mandatory: "0"
            }, "commentAuthor").Value;

            var commentAuthorUrl = _extract.GetAttribute({
                context: curr,
                xpathName: "commentAuthor",
                attributeName: "href",
                mandatory: "0"
            }, "commentAuthorUrl").Value;

            var commentAuthorId = _extract.GetAttribute({
                context: curr,
                xpathName: "commentAuthor",
                attributeName: "data-from-id",
                mandatory: "0"
            }, "commentAuthorId").Value;

            var commentAuthorImg = _extract.GetAttribute({
                context: curr,
                xpathName: "commentAuthorImg",
                attributeName: "src",
                mandatory: "0"
            }, "commentAuthorImg").Value;


            if (commentAuthorId.toString() !== "NaN") {

                var commnetWriter = {};

                commnetWriter.externalId = "writer_Id_" + hashCode(commentAuthorId);
                commnetWriter.itemType = "4"; // Web entity
                commnetWriter.type = "1"; //Person
                commnetWriter.activityType = "1"; //Social Network
                commnetWriter.url = commentAuthorUrl;
                commnetWriter.title = commentAuthor;
                commnetWriter.imageUrl = commentAuthorImg;

                //Check is the writer already collected
                if (!(' ' + commnetWriter in collectedAuthors)) {
                    collectedAuthors[(' ' + commnetWriter)] = true;
                    addEntity(commnetWriter);
                } else {
                    console.log(commnetWriter + " is already collected");
                }
            }


            var comment = {};
            comment.itemType = "3";
            comment.type = "1";
            comment.parent_externalId = parent.externalId;
            comment.parentObjectType = parent.itemType;
            comment.url = parent.url;
            comment.writer_externalId = "";
            comment.writeDate = "";
            comment.externalId = "comment_id_" + hashCode(comment.url + i);

            if (commentText.toString() !== "NaN") {
                comment.body = commentText.toString();
                addEntity(comment);
            }
            
            if (commentImg.returnCode === "200") {
                //Logger.production("we will collect image from comment");
                //collectImage(comment, commentImg);
            }
            if (commentVideo.returnCode === "200") {
                //Logger.production("we will collect video from comment");
                //collectVideo(comment, commentVideo);
            }
            curr = iterator.iterateNext();
        }
    }


    function collectImage(parent, currImgNode) {

        Logger.production("we will collect image of : " + parent.externalId);
        var iterator = currImgNode.Value;
        var curr = iterator.iterateNext();

        while (curr) {
            var img = {};
            img.parent_externalId = parent.externalId;
            img.parentObjectType = parent.itemType;
            img.writer_externalId = parent.writer_externalId;
            img.writeDate = parent.writeDate;
            img.itemType = "5";
            img.imageUrl = curr.getAttribute("style").match(/http(.+\b)/g)[0];
            img.url = curr.getAttribute("style").match(/http(.+\b)/g)[0];
            img.externalId = "img_id_" + hashCode(img.imageUrl);
            curr = iterator.iterateNext();

            addImage(img);

            /*if (img.externalId != 0) {
             addImage(img);
             } else {
             Logger.debug("Check the image element for this post: " + parent.externalId);
             }*/
        }

    }

    function collectVideo(parent, currVideoNode) {
        Logger.production("we will collect video of : " + parent.externalId);
        var iterator = currVideoNode.Value;
        var curr = iterator.iterateNext();

        while (curr) {
            var video = {};
            video.parent_externalId = parent.externalId;
            video.parentObjectType = parent.itemType;
            video.writer_externalId = parent.writer_externalId;
            video.writeDate = parent.writeDate;
            video.itemType = "22";
            video.imageUrl = curr.href;
            video.url = video.imageUrl;
            video.body = "<iframe src=" + video.imageUrl + "></iframe>";
            video.externalId = "video_id_" + hashCode(video.imageUrl);
            curr = iterator.iterateNext();
            addImage(video);
        }
        /*var video = {};
         video.parent_externalId = parent.externalId;
         video.parentObjectType = parent.itemType;
         video.writer_externalId = parent.writer_externalId;
         video.writeDate = parent.writeDate;
         video.itemType = "22";
         video.imageUrl = currVideoNode;
         video.url = video.imageUrl;
         video.body = "<iframe src=" + video.imageUrl + "></iframe>";
         video.externalId = "video_id_" + hashCode(video.imageUrl);

         if (video.externalId != 0) {
         addImage(video);
         } else {
         Logger.debug("Check the video element for this post: " + parent.externalId);
         }*/

    }

    function timeConverter(UNIX_timestamp){
        var a = new Date(UNIX_timestamp * 1000);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
        return time;
    }
    //......................................................................
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
    finalize();
}