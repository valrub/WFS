function main(re, ie, oe, executor) {//=====================================================================
    //Initialize Global Settings

    setGlobalLogger(re, ie, oe, executor);

    if (ie.fullPost == "true") {
        executor.ready();
	}
    var WPXP = xpaths.VK_Search_Activities;

    executionContext = {
        globalLogExtracted: true, //change to false before release;
        globalWPXP: xpaths.VK_Search_Activities
    };
    persistDataSettings.flushAt = 50;

    

    //=====================================================================
    // GLOBAL VARIABLES

    var collectedWriters = [];
    var postsCounter = 0;
    //=====================================================================
    try {
        var _extract = new Extract(executionContext);
        var _process = new Process();

        _process.Run(getPosts,false, {pMarker:'1:', functionName: 'getPosts'});

    } catch (e) {
        Logger.failure(e);
    }


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



    function getPosts(pMarker, pContext) {
        
        if(re.url !== window.location.href) {
            Logger.failure("The search results are only available for logged in users. Check the agent!");
        }
        
        Logger.production("Start collection");
        
        postsCounter = 0;
        var _res= {
            totalCollected:0,
            returnCode: ""
        };

        try {
            var _tmp = _extract.GetCollection(
                {
                    xpathName: "searchResults",
                    mandatory: "0"
                },
                pMarker
            );

            if (_tmp.returnCode === "200") {
                var iterator = _tmp.Value;
                var length = _tmp.Length;
                cnt = 0;

                var thisNode = iterator.iterateNext();

                while (thisNode) {
                    var writerName = _extract.GetText(
                        {
                            xpathName: "postWriter",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "writerName"
                    ).Value;

                    var postWriterImage = _extract.GetAttribute(
                        {
                            xpathName: "postWriterImage",
                            attributeName: "src",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "postWriterImage"
                    ).Value;

                    var writerId = _extract.GetAttribute(
                        {
                            xpathName: "postWriter",
                            attributeName: "data-from-id",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "writerId"
                    ).Value;

                    var writerUrl = _extract.GetAttribute(
                        {
                            xpathName: "postWriter",
                            attributeName: "href",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "writerUrl"
                    ).Value;
                   
                    var writeDate = _extract.GetAttribute(
                        {
                            xpathName: "postDate",
                            attributeName: "time",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "writeDate"
                    ).Value;
                    
                    var postId = _extract.GetAttribute(
                        {
                            xpathName: "postWriter",
                            attributeName: "data-post-id",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "postId"
                    ).Value;

                    var postUrl = _extract.GetAttribute(
                        {
                            xpathName: "postUrl",
                            attributeName: "href",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "postUrl"
                    ).Value;

                    var parentPost = _extract.GetText(
                        {
                            xpathName: "parentPost",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "parentPost"
                    ).Value;

                    var postBody = _extract.GetText(
                        {
                            xpathName: "postBody",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "postBody"
                    ).Value;

                    postBody += _extract.GetText(
                        {
                            xpathName: "hidenText",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "postBody - hiden"
                    ).Value;

                    var postLikesValue = _extract.GetText(
                        {
                            xpathName: "postLikes",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "postLikesValue"
                    ).Value;

                    var postSharesValue = _extract.GetText(
                        {
                            xpathName: "postShares",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "postSharesValue"
                    ).Value;

                    var postImage = _extract.GetAttribute(
                        {
                            xpathName: "postImage",
                            attributeName: "style",
                            mandatory: "0",
                            context: thisNode
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
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "postVideo"
                    ).Value;

                    //----------------------Save-writer----------------------
                    var writer = {};

                    //writer.externalId = writerId.match(/[0-9]+/)[0]; //VAL

                    writer.sideB_externalId = writerId.match(/[0-9]+/)[0]; //VAL
                    writer.externalId = hashCode(writer.sideB_externalId); //VAL

                    writer.itemType = "4"; // Web entity
                    writer.type = "1"; //Person
                    writer.activityType = "1"; //Social Network
                    writer.url = writerUrl;
                    writer.title = writerName;
                    writer.imageUrl = postWriterImage;

                    //Check is the writer already collected
                    if (!(' ' + writerId in collectedWriters)) {
                        collectedWriters[(' ' + writerId)] = true;
                        addImage(writer);
                    } else {
                        console.log(writerId + " is already collected");
                    }


                    //-------------------Save post--------------------------

                    var post = {};
                    Logger.production("post url: " + postUrl);
                    post.externalId = "post " + postId;
                    post.url = postUrl;
                    post.itemType = "2"; // Topic
                    post.activityType = "1"; // Social Network
                    post.body = postBody;
                    post.writer_externalId = writer.externalId;
                    post.writeDate = timeConverter(writeDate);
                    post.parent_externalId = writer.externalId;
                    post.parentObjectType = writer.itemType;


                    addEntity(post);
                    postsCounter++;

                    if (postImage != null) {
                        collectImage(post, postImage);

                    }

                    if (postVideo != null) {
                        collectVideo(post, postVideo);
                    }



                    //------------------------------------------------------------
                    thisNode = iterator.iterateNext();

                }


                _res.totalCollected = postsCounter;
                _res.returnCode = "200";

            } else {
                _res.totalCollected = 0;
                _res.returnCode = "204";
                Logger.warning("No posts on this page.");
                //re.placeholder2 = false;
                finalize();
            }
        }
        catch(e) {
            Logger.error("getPosts('getPosts', '5' - DID NOT WORK - " + e.message);
            _res.totalCollected = postsCounter;
            _res.returnCode = "504 " + e.message;
        }
        return _res;

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

    function collectImage(parent, currImgNode) {

        var img = {};
        img.parent_externalId = parent.externalId;
        img.parentObjectType = parent.itemType;
        img.writer_externalId = parent.writer_externalId;
        img.writeDate = parent.writeDate;
        img.itemType = "5";
        img.imageUrl = currImgNode.match(/http.+jpg/)[0];
        img.url = currImgNode.match(/http.+jpg/)[0];
        img.externalId = "img_id_" + hashCode(img.imageUrl);

        addImage(img);

    }

    function collectVideo(parent, currVideoNode) {

        var video = {};
        video.parent_externalId = parent.externalId;
        video.parentObjectType = parent.itemType;
        video.writer_externalId = parent.writer_externalId;
        video.writeDate = parent.writeDate;
        video.itemType = "22";
        video.imageUrl = currVideoNode;
        video.url = video.imageUrl;
        video.body = "<iframe src=" + video.imageUrl + "></iframe>";
        video.externalId = "video_id_" + hashCode(video.imageUrl);
        if (video.imageUrl != "") {
            addImage(video);
        } else {
            Logger.debug("Check the video element for this post: " + parent.externalId);
        }

    }

    finalize();
}   