/**
* @Purpose: Library for collecting data from Twitter using Library-Scraping approach
* @Author: Atanas Rabadzhiyski
* @Released: 16/01/2017
* @Version: 200.003.006
**/
/** CHANGELOG
 * 
 @Author: Valentin -- 28/08/2018 -- 200.003.029
 * Fixed Search with location
 * 
* @Author: Adriana Alexandrova -- 16/02/2017 -- 200.003.011
*
* @Change: Changed key values collection
* ------------------------------------------
* @Author: Petar Petrov -- 16/01/2017 -- 200.003.006
* @Change: Added Identifier for user Id.
* ------------------------------------------
* @Author: Adriana Alexandrova/ Martina Peneva -- 07/09/2016 -- 200.003.005
* @Change: Added Logger functionality
* @Change: Detect comments that are written by deleted accounts or accounts that have private tweets.
* ------------------------------------------
* @Author: Martina Peneva and Adriana Alexandrova -- 18/08/2016 -- 200.003.003
* @Change: Fixed bug in socialCollect. Added Logger functionality.
* ------------------------------------------
* @Author: Adriana Alexandrova -- 10/08/2016 -- 200.003.002
* @Change: Added daysBack functionality for v6
* ------------------------------------------
* @Author: Boyko Ivanov -- 08/08/2016 -- 200.003.002
* @Change: Version raised to 200.003.002, beacuse of naming conflict with older verion 1.0.016 which in 7 was consedered as the latest one.
* @Change: Collecting Following/Followers/Tweets counter and the account info as we collect for the actual target.
* ------------------------------------------
* @Author: Martina Peneva -- 26/07/2016 -- 001.003.001
* @Change: Added social download functionality.
* ------------------------------------------
* @Author: Adriana Alexandrova -- 01/07/2016 -- 001.002.003
* @Change: Added collection for videos in tweets and replies.
* ------------------------------------------
* @Author: Martina Peneva -- 30/06/2016 -- 001.002.002
* @Change: Fixed issue with tracking collection of the topics and comments.
* @Change: Convert the date format from input param in valid format for Twitter.
* ------------------------------------------
* @Author: Boyko Ivanov -- 09/06/2016 -- 001.002.001
* @Change: Collect Twitter Accounts by Keyword functionality added.
* @Change: Collect background image of profile fix.
* ------------------------------------------
* @Author: Boyko Ivanov -- 03/06/2016 -- 001.001.003
* @Change: Collect background image of profile.
* @Change: Unnecessary URL in the topic body removed.
* ------------------------------------------
* @Author: Petar Petrov -- 27/04/2016 -- 001.001.001
* @Change: Fixed problem with collecting comments of comments.
* @Change: Resolved recursion issue when collecting tweets.
* ------------------------------------------
* @Author: Martina Peneva -- 27/04/2016 -- 001.001.000
* @Change: Collect specific object from Twitter - tweet.
* ------------------------------------------
* @Author: Martina Peneva -- 07/04/2016 -- v1.0.015/16
* @Change: Collect GEO information.
* @Change: Fix key values fields - title and description.
* @Change: Add option to search for hashtags.
* ------------------------------------------
* @Author: Atanas Rabadzhiyski -- 07/03/2016 -- v1.0.014
* @Change: Changes in the way the search URL is generated
* ------------------------------------------
* @Author: Atanas Rabadzhiyski -- 18/02/2016 -- v1.0.013
* @Change: New functions for collecting tweets from search page
* ------------------------------------------
* @Author: Atanas Rabadzhiyski -- 12/02/2016 -- v1.0.012
* @Change: Only public data will be collected if there is no agent
* ------------------------------------------
* @Author: Nikolay Ivanov -- 22/12/2015 -- v1.0.011
* @Change: Changed class name for embedded images in tweet
* ------------------------------------------
* @Author: Nikolay Ivanov -- 01/12/2015 -- v1.0.010
* @Change: Added deltaDaysBack
* ------------------------------------------
**/
/* --------------------------------------------------- */
/* ------------------ SET FUNCTIONS ------------------ */
/* --------------------------------------------------- */
// NEW

var numberOfTimesAttemptedToAddImage = 0;

var requestCounter = 0;
var url = "";
var parameters = {};
var nextPageUrl = "";
var searchCursor = "";
var dateOfOldestTweet = "21 Mar 2006";
var cursor;
var finalDaysCorrection = 0;
// ON/OFF
var collectAvatars = true; // true = download the avatars; false = don't download them
var collectComments = true; // true = collect the comments; false = don't collect them
var collectLikes = true; // true = collect the likes; false = don't collect them
// Max value (defaults)
var maxTweets = 1000;
var maxFollowing = 500;
var maxFollowers = 500;
var searchMaxAccounts = 108;
var maxProfilesSocial = 10;
var maxTweetsSocial = 200;
// Delta
var sinceTimestamp = 0;
//Days back default
var daysBackDefault = 90;
// Interval timeouts
var followersTimeout = 500;
// Collected data
var collectedAccounts = [];
var accountsSocialDownload = [];
var collectedTweetsIds = [];
// Entities counter
var collectedRecords = 0;
var collectedTweets = 0;
var collectedFollowing = 0;
var collectedFollowers = 0;
var scheduledImagesScraping = 0;
var searchCollectedAccounts = 0;
// Pages counter
var tweetsPagesCounter = 0;
var followersPagesCounter = 0;
var followingPagesCounter = 0;
//Control counters
var addImageScrapingsInvoke = 0;
var successInvokes = 0;
var errorInvokes = 0;
// Async flags
var loadMoreFollowers = false;
var loadMoreFollowing = false;
var scheduledInfoPerAccoount = 0;
var hasMoreTweets = true;
var hasMoreFollowers = true;
var hasMoreFollowing = true;
var socialDownload = "false";
var flagRecentActivity = true;
var currentMinPosition = "";
var collectedNumberTweets = 0;
//var socialDownloadIsReady = false;
// Ready flags
var collectNextPage = true;
var tweetsCollected = false;
var followingCollected = false;
var followersCollected = false;
var searchAccountsCollected = false; //true if searchCollectedAccounts >= searchMaxAccounts
var searchAccountsNextPage = true; //true if next page with accounts is ready to be collected
// XPATHS
var searchAccountXPaths = {};
searchAccountXPaths.resultsContainer = ".//*[@data-min-position]";
searchAccountXPaths.accountContainer = ".//*[contains(@class,'js-actionable-user')]";
searchAccountXPaths.accountTitle = ".//*[contains(@class,'ProfileNameTruncated')]//a";
searchAccountXPaths.accountBody = ".//*[contains(@class,'ProfileCard-screenname')]//a/span";
searchAccountXPaths.accountAvatar = ".//*[contains(@class,'ProfileCard-avatarImage')]";
searchAccountXPaths.accountDescription = ".//*[contains(@class,'ProfileCard-bio')]";
var profileXPaths = {};
profileXPaths.keyValTweet = ".//*[@data-nav='tweets']";
profileXPaths.keyValFollowing = ".//*[@data-nav='following']";
profileXPaths.keyValFollowers = ".//*[@data-nav='followers']";
profileXPaths.joinedDate = ".//*[@class='ProfileHeaderCard-joinDate']";
profileXPaths.location = ".//span[contains(@class,'ProfileHeaderCard-location')]";
profileXPaths.websiteOuter = ".//span[contains(@class,'ProfileHeaderCard-urlText')]/a";
profileXPaths.backgroundImage = ".//div[@class='ProfileCanopy-headerBg']/img";
profileXPaths.id = ".//*[contains(@class, 'UserActions')]//*[@data-user-id]";
var tweetXPaths = {};
tweetXPaths.dateTimeMs = ".//*[contains(@id,'stream-item-tweet-')]//*[@data-tweet-id]//*[@data-time-ms]";
tweetXPaths.tweets = ".//*[contains(@id, 'stream-item-tweet-')]//*[@data-tweet-id]";
// global key values
var min_position = '';
var keepKeyValues = {};
var allRetweetIds = '';

var allVideoIds = '';
var tweetPlaces = {};

function setKeyValues() {
    return JSON.stringify(keepKeyValues);
}

function setLastTweets() {
    return hasMoreTweets;
}

function setLastFollowers() {
    return hasMoreFollowers;
}

function setLastFollowing() {
    return hasMoreFollowing;
}

function setKeyvaluesObject(stringObject) {
    keepKeyValues = JSON.parse(stringObject);
}

function setSocialDownload(boolean) {
    socialDownload = boolean;
}

function getSocialProfiles() {
    return JSON.stringify(accountsSocialDownload);
}
// List of tweets with GEO coordinates
var tweetsWithGeo = "";
// make list of tweets global
function setListOfTweets() {
    return tweetsWithGeo;
}
// make executor object global
var re, ie, oe, executor;

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

function setExecutor(runtime, input, output, exe) {
    re = runtime;
    ie = input;
    oe = output;
    executor = exe;
    maxFollowers = 500;
    maxFollowing = 500;
    // Flags
    try {
        // Followers
        if (/maxFollowers=\d+/.test(re.options)) {
            maxFollowers = re.options.match(/maxFollowers=([0-9]+)/)[1];
            // Logger.production('options string is ' + re.options);
            // Logger.production('max followers before comparison is ' + maxFollowers);
            if (maxFollowers > 1000) {
                maxFollowers = 1000;
            }
            //Logger.production('max followers is ' + maxFollowers);
        }
        // Following
        if (/maxFollowing=\d+/.test(re.options)) {
            maxFollowing = re.options.match(/maxFollowing=([0-9]+)/)[1];
            //Logger.production('max following before comparison is ' + maxFollowing);
            if (maxFollowing > 1000) {
                maxFollowing = 1000;
            }
            //Logger.production('max following is ' + maxFollowing);
        }
        // Tweets
        if (/maxTweets=\d+/.test(re.options)) {
            maxTweets = re.options.match(/maxTweets=([0-9]+)/)[1];
        }
        if (re.MaxComments) {
            maxTweets = re.MaxComments;
        }
        // Public data
        if (/-agent/.test(re.options)) {
            collectLikes = false;
        }
        //Social Download - maxProfiles
        if (/maxProfilesSocial=\d+/.test(re.options)) {
            maxProfilesSocial = re.options.match(/maxProfilesSocial=([0-9]+)/)[1];
        }
        //Social Download - maxTweets
        // if (/maxTweetsSocial=\d+/.test(re.options)) {
        //  if (parseInt(re.options.match(/maxTweetsSocial=([0-9]+)/)[1]) <= 1000) {
        //      maxTweetsSocial = re.options.match(/maxTweetsSocial=([0-9]+)/)[1];
        //  }
        // }
        if (/^\d+$/.test(ie.socialProfiles)) {
            maxProfilesSocial = parseInt(ie.socialProfiles);
        }
        if (/^\d+$/.test(ie.maxSocialTweets)) {
            maxTweetsSocial = parseInt(ie.maxSocialTweets);
        }

    } catch (e) {
        Logger.error("Exception thown while creating flags: " + e.message);
    }
    // Delta
    try {
        if (ie.isDeltaRunning && ie.isDeltaRunning.toLowerCase() == "true") {
            if (ie.lastStartExecutionTime && ie.lastStartExecutionTime.length > 18) {
                // ie.lastStartExecutionTime is in format "2015-12-14 11:32:15.15 +0200"
                // Mozilla Date class need this format "2015-12-14T11:51:59"
                var sinceTime = ie.lastStartExecutionTime.split(".")[0].replace(" ", "T");
                // deltaDaysBack
                var daysCorrection = 0;
                if (ie.deltaDaysBack && /^\d+$/.test(ie.deltaDaysBack)) {
                    daysCorrection = parseInt(ie.deltaDaysBack, 10);
                } else {
                    // Default deltaDaysBack per requirements should be 2
                    daysCorrection = 2;
                }
                Logger.production("sinceTime: " + sinceTime);
                finalDaysCorrection = daysCorrection;
                sinceTimestamp = parseInt((Date.parse(sinceTime) / 1000) - (daysCorrection * 86400), 10);
                Logger.production("sinceTimestamp: " + sinceTimestamp);
            }
        }
    } catch (e) {
        Logger.error("Exception thown while calculating delta: " + e.message);
    }
}
re.keyValueFollowers = '';
re.keyValueFollowing = '';
re.collectedFollowers = '';
re.collectedFollowing = '';

function setTarget(id) {
    targetId = id;
    // Monitored
    addEntity({
        itemType: "18", // Monitored
        parent_externalId: targetId,
        parentObjectType: "4" // Web Entity
    });
}
/* --------------------------------------------------- */
/* ------------------ GET FUNCTIONS ------------------ */
/* --------------------------------------------------- */
//for asynchronous functions
function domRequestAsynch(url, callback, parameters) {
    try {
        var xhr = new XMLHttpRequest();
        Logger.debug("async domrequest :: " + url + " URL " + JSON.stringify(parameters));
        xhr.ajaxUrl = url;
        xhr.parameters = parameters;
        xhr.open("GET", xhr.ajaxUrl, true);
        xhr.onload = domResponseListener;
        xhr.callback = callback;
        xhr.send();
    } catch (e) {
        Logger.error("Exception thown while creating an async DOM request: " + e.message);
    }
}

function domRequest(url, callback, parameters) {
    try {
        requestCounter++;
        Logger.production("domrequest :: " + url + " URL " + JSON.stringify(parameters));
        var xhr = new XMLHttpRequest();
        xhr.ajaxUrl = url;
        xhr.parameters = parameters;
        xhr.open("GET", xhr.ajaxUrl, false);
        xhr.onload = domResponseListener;
        xhr.callback = callback;
        xhr.send();
    } catch (e) {
        Logger.error("Exception thown while creating a synchronous DOM request: " + e.message);
    }
}

function domResponseListener() {
    try {
        Logger.debug(this.readyState + " Status of the request. Status of response " + this.status + ". URL " + this.ajaxUrl);
        if (this.status === 200) {
            var response = this.responseText;
            Logger.debug(response);
            Logger.debug(JSON.stringify(this.parameters));
            Logger.debug(this.readyState + " Status of the request. URL " + this.ajaxUrl);
            this.callback(response, this.parameters);
        } else {
            Logger.error("Status was " + this.status + " for url " + this.ajaxUrl);
        }
        Logger.debug(this.status + " Status of the response. URL :: " + this.ajaxUrl);
    } catch (e) {
        Logger.error("Exception thown while listening for a response: " + e.message);
    }
}
/* -------------------------------------------- */
/* ------------------ TWEETS ------------------ */
/* -------------------------------------------- */
var searchUrl = "";
var searchPhrase = "";

function searchTweets(keyword) {
    if (!keyword) {
        keyword = ie.keyword;
    }
	
	//-------------------------------------------
	Logger.production('VAL - keyword = ' + keyword); //VAL remove after
	//-------------------------------------------
	
    try {
        collectProfileLocation = true;
        // URL base
        // Check if the flow should search for hashtag or keyword
        if (keyword.indexOf("#") != -1) {
            searchPhrase = keyword.replace("#", "%23");
			
        } else {
            searchPhrase = keyword;
        }
        //Twitter_Enhanced_Search - v7 uses since/until and v6 uses days_back
        //Twitter_Enhanced_Target - v7 uses since and v6 use days_back
        if (ie.days_back.toLowerCase() === 'ignore' || !ie.days_back) {
            var dateArray;
            if (ie.since && ie.since != "") {
                Logger.debug("since: " + ie.since);
                if (/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/.test(ie.since)) {
                    var since = new Date(ie.since);
                    since.setDate(since.getDate());
                    var sinceDate = since.getFullYear() + "-" + (('0' + (since.getMonth() + 1)).slice(-2)) + "-" + ('0' + since.getDate()).slice(-2);
                    searchPhrase += " since:" + sinceDate;
                } else {
                    Logger.failure("Wrong date format given. Please use format YYYY-MM-DD");
                }
            }
            if (ie.until && ie.until != "") {
                if (/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/.test(ie.until)) {
                    //The until date is incremented by 1 in order to return the latest tweets
                    var until = new Date(ie.until);
                    until.setDate(until.getDate() + 1);
                    var untilDate = until.getFullYear() + "-" + (('0' + (until.getMonth() + 1)).slice(-2)) + "-" + ('0' + until.getDate()).slice(-2);
                    searchPhrase += " until:" + untilDate;
                } else {
                    Logger.failure("Wrong date format given. Please use format YYYY-MM-DD");
                }
            }
            Logger.debug("Will download tweets since " + ie.since + " until " + ie.until);
        } else {
            var daysBack = daysBackDefault; //90
            if (/^\d+$/.test(ie.days_back)) {
                daysBack = parseInt(ie.days_back);
            }
            Logger.debug("Will download tweets up to " + daysBack + " days back.");
            //Subtract the number of days from today to get the date
            var d = new Date();
            d.setDate(d.getDate() - daysBack);
            var oldest = new Date(dateOfOldestTweet);
            if (oldest > d) {
                d = oldest;
                Logger.warning("Too many days back. The first tweet ever was posted on 21 March 2006. This date will be used as reference.");
            }
            //The date used by the Twitter url is in format yyyy-mm-dd
            var date = d.getFullYear() + "-" + (('0' + (d.getMonth() + 1)).slice(-2)) + "-" + ('0' + d.getDate()).slice(-2);
            searchPhrase += " since:" + date;
        }
        if (ie.countryName) {
             //searchPhrase += '%20near%3A"' + ie.countryName + '"';
             searchPhrase += ' near "' + ie.countryName + '"';
        }
        if (ie.mentionedAccounts) {
            searchPhrase += '%20from%3A' + ie.mentionedAccounts;
        }
        if (ie.excludedWords) {
            searchPhrase += '%20-"' + ie.excludedWords + '"';
        }
		
		
		Logger.production("VAL-12: searchPhrase - BEFORE ENCODING: " + searchPhrase);
		
		finalSearchPhrase = encodeURIComponent(searchPhrase);
		Logger.production("VAL-13: finalSearchPhrase - AFTER ENCODING: " + finalSearchPhrase);
		
        searchUrl = "https://twitter.com/search?f=tweets&q=" + finalSearchPhrase;
        Logger.production("VAL-14: search url: " + searchUrl);
		
        var parameters = {
            keyword: keyword,
            // isTarget should be true in case we want to collect comments of the tweets. The parameter is used for social download - for new profiles we do not collect
            isTarget: true
        };
        domRequest(searchUrl, searchTweetsResponseHandler, parameters);
    } catch (e) {
        Logger.error("Exception thrown while searching for tweets: " + e.message);
    }
}

function searchTweetsResponseHandler(response, parameters) {
    try {
        tweetsPagesCounter += 1;
        Logger.production("TWEETS PAGE # " + tweetsPagesCounter);
        var html = "";
        var parser = new DOMParser();
        if (response.indexOf("<!DOCTYPE html>") > -1) {
            html = parser.parseFromString(response, "text/html");
        } else {
            response = JSON.parse(response);
            html = parser.parseFromString(response.items_html, "text/html");
        }
        // COLLECT DATA
        var tweetsXpath = ".//*[contains(@id, 'stream-item-tweet-')]//*[@data-tweet-id]";
        var tweets = html.evaluate(tweetXPaths.tweets, html, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (var tw = 0; tw < tweets.snapshotLength; tw++) {
            var tweet = tweets.snapshotItem(tw);
            Logger.production("TWEETS :: " + collectedTweets + " / " + maxTweets);
            if (collectedTweets >= maxTweets) {
                tweetsCollected = true;
                console.log("INFO. The max amount of tweets is collected. Finilizing...");
                Logger.production("The flow reached the default limitation of " + maxTweets + " tweets for execution! The max amount of tweets is collected. Finilizing...");
                //break;

                var tweetAuthorInterval = setInterval(function() {
                    //Logger.production(' I am Inside final interval of followers and waiting for ' + scheduledInfoPerAccoount +' sheduled accounts to be collected');
                    if (scheduledInfoPerAccoount === 0) {
                        clearInterval(tweetAuthorInterval);
                        tw = tweets.snapshotLength;
                        tweetsCollected = true;
                        finalize();
                    }
                }, followersTimeout);
            }
            collectedNumberTweets++;
            processTweet(tweet, parameters, html);
        }
        Logger.production("TweetCollected " + tweetsCollected);
        // LOAD NEXT PAGE
        //Logger.production("tweetsCollected: " + tweetsCollected);
        if (tweetsCollected === false) {
            // Min Position
            var counterMinPosition = 5;
            var checkMin_position = setInterval(function() {
                if (counterMinPosition === 0) {
                    clearInterval(checkMin_position);
                }
                counterMinPosition--;
            }, 1000);

            if (tweetsPagesCounter === 1 && html.evaluate(".//*[contains(@class, 'stream-container')][@data-max-position]", html, null, 9, null).singleNodeValue !== null) {
                min_position = html.evaluate(".//*[contains(@class, 'stream-container')][@data-max-position]", html, null, 9, null).singleNodeValue.getAttribute("data-max-position");
            } else {
                min_position = response.min_position;
                //if (response.has_more_items === false) {
                //  min_position = false;
                //}
            }
            Logger.debug("min_position: " + min_position);
            if (currentMinPosition === min_position) {
                min_position = false;
            }
            // DOM Request
            if (min_position) {
                var nextPageUrl = "https://twitter.com/i/search/timeline?f=tweets&q=" + searchPhrase + "&max_position=" + min_position;
                Logger.debug("nextPageUrl: " + nextPageUrl);
                currentMinPosition = min_position;
                domRequestAsynch(nextPageUrl, searchTweetsResponseHandler, parameters);
            } else {
                Logger.production("The flow reached the time limitation for execution! Finilizing...");
                tweetAuthorInterval = setInterval(function() {
                    //Logger.production(' I am Inside final interval of followers and waiting for ' + scheduledInfoPerAccoount +' sheduled accounts to be collected');
                    if (scheduledInfoPerAccoount === 0) {
                        clearInterval(tweetAuthorInterval);
                        //Logger.production("finalizeScraping() 512: ");
                        finalize();
                        
                    }
                }, followersTimeout);
            }
        }
        //Logger.production("exit " + min_position);
    } catch (e) {
        Logger.error("Exception thrown while handling searching for tweets: " + e.message);
    }
}

function collectTweets(username, maximumTweets) {
    //Logger.production(" 5 collectTweets function in socialDownload");
    try {
        collectProfileLocation = true;
        tweetsCollected = false;
        var url = "https://twitter.com/" + username + "/with_replies";
        var parameters = {
            targetUsername: username
        };
        if (maximumTweets !== undefined) {
            parameters.maxTweets = maximumTweets;
            parameters.isTarget = false;
            Logger.debug("collectTweets() social download.");
        } else {
            parameters.maxTweets = maxTweets;
            parameters.isTarget = true;
            Logger.debug("collectTweets() target.");
        }
        var timeCounter = 0;
        domRequest(url, tweetsResponseHandler, parameters);

        Logger.debug("collectTweets() :: sent request to URL " + url + " with parameters " + JSON.stringify(parameters));
        var checkPagesCollected = setInterval(function() {
            if (collectNextPage) {
                if ((url != nextPageUrl) && (nextPageUrl != "")) {
                    url = nextPageUrl;
                    domRequest(url, tweetsResponseHandler, parameters);
                    Logger.debug("collectTweets() :: sent request to URL " + url + " with parameters " + JSON.stringify(parameters));
                }
            } else {
                timeCounter++;
                console.log("INFO. Waiting for tweets to be collect...");
                if (timeCounter == 30) {
                    clearInterval(checkPagesCollected);
                    flagRecentActivity = true;
                }
            }

            if (tweetsCollected) {
                clearInterval(checkPagesCollected);
                flagRecentActivity = true;
            }

        }, 1000);
    } catch (e) {
        Logger.error("Exception thrown while colecting tweets: " + e.message);
    }
}

function tweetsResponseHandler(response, parameters) {
    //Logger.production(" 6 tweetsResponseHandler function in socialDownload");
    try {
        //Logger.debug("tweetsResponseHandler() :: got response from server. Last collected page " + tweetsPagesCounter + "  " + response);
        var emptyResponse = false;
        collectNextPage = false;
        tweetsPagesCounter += 1;
        console.log("TWEETS PAGE # " + tweetsPagesCounter);
        Logger.debug("tweetsResponseHandler() :: got response from server. Start collecting page " + tweetsPagesCounter);
        var html = "";
        var parser = new DOMParser();
        if (response.indexOf("<!DOCTYPE html>") > -1) {
            html = parser.parseFromString(response, "text/html");
            parameters.targetId = html.evaluate(profileXPaths.id, html, null, 9, null).singleNodeValue.getAttribute("data-user-id");
        } else {
            response = JSON.parse(response);
            if (response.items_html.match("class=")) {
                html = parser.parseFromString(response.items_html, "text/html");
            } else {
                emptyResponse = true;
            }
        }
        Logger.debug("tweetsResponseHandler() :: Parsed html of page " + tweetsPagesCounter + " for target username " + parameters.targetUsername);
        // COLLECT DATA
        if (!emptyResponse) {
            var daysBack = daysBackDefault; //90
            var daysBackDate = new Date();
            if (ie.since && ie.since != "") {
                Logger.debug("since: " + ie.since);
                if (/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/.test(ie.since)) {
                    daysBack = ie.since;
                    daysBackDate = new Date(daysBack);
                } else {
                    Logger.failure("Wrong date format given. Please use format YYYY-MM-DD");
                }
            } else {
                if (ie.days_back && /^\d+$/.test(ie.days_back)) {
                    daysBack = parseInt(ie.days_back);
                }
                //Subtract the number of days from today to get the date
                daysBackDate.setDate(daysBackDate.getDate() - daysBack);
            }

            var tweetsXpath = ".//*[contains(@id, 'stream-item-tweet-')]//*[@data-tweet-id]";
            var tweets = html.evaluate(tweetsXpath, html, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            Logger.debug("tweetsResponseHandler() :: got response from server. Start collecting page " + tweetsPagesCounter + " content " + tweets.snapshotItem(0));
            for (var i = 0; i < tweets.snapshotLength; i++) {
                var tweet = tweets.snapshotItem(i);
                if (tweet === null) {
                    break;
                }
                var tweetTimestamp = html.evaluate(".//*[@data-time-ms]", tweet, null, 9, null).singleNodeValue ? html.evaluate(".//*[@data-time-ms]", tweet, null, 9, null).singleNodeValue.getAttribute("data-time-ms") : "";
                var tweetDate = new Date(Number(tweetTimestamp));
                var tweetDates = parseInt((Date.parse(tweetDate) / 1000) - (finalDaysCorrection * 86400), 10);
                console.log("TWEETS :: " + collectedTweets + " / " + parameters.maxTweets);
                Logger.production("tweet timestamp: " + tweetDate + "\n max tweets: " + parameters.maxTweets + "\n since: " + daysBackDate);
                Logger.production("tweetTimestamp: " + tweetTimestamp + " " + "tweetDates: " + tweetDates + " " + "sinceTimestamp: " + sinceTimestamp + " " + "daysBackDate: " + daysBackDate);
                if (collectedTweets >= parameters.maxTweets || tweetDate < daysBackDate) {
                    tweetsCollected = true;
                    hasMoreTweets = false;
                    // prepare collectedTweets for next profile
                    collectedTweets = 0;
                    tweetsPagesCounter = 0;
                    console.log("INFO. The max amount of tweets is collected. Finalizing...");
                    Logger.production("The flow reached the days back or max tweets limitation for execution! Finalizing! collectedTweets: " + collectedTweets + " parameters.maxTweets:" + parameters.maxTweets);
                    break;
                    // /*finalizeScraping();*/
                    //finalize();
                } else if (tweetDates < sinceTimestamp || tweetDate < daysBackDate) {
                    tweetsCollected = true;
                    hasMoreTweets = false;
                    // prepare collectedTweets for next profile
                    collectedTweets = 0;
                    tweetsPagesCounter = 0;
                    console.log("INFO. The delta point is reached. Finalizing...");
                    Logger.production("The delta point is reached. Finalizing...");
                    break;
                    //finalizeScraping();
                    //finalize();
                } else {
                    Logger.debug("tweetsResponseHandler() :: invoke processTweet() for " + i + "-th time");
                    if (i == tweets.snapshotLength - 1) {
                        processTweet(tweet, parameters, html, true);
                    } else {
                        processTweet(tweet, parameters, html);
                    }
                }
            }
            // LOAD NEXT PAGE
            if (tweetsCollected === false) {
                if (!response.has_more_items) {
                    hasMoreTweets = response.has_more_items;
                    nextPageUrl = "";
                    min_position = "";
                }
                // Min Position
                if (tweetsPagesCounter == 1 && html.evaluate("(.//*[contains(@id, 'stream-item-tweet-')])[last()]", html, null, 9, null).singleNodeValue) {
                    min_position = html.evaluate("(.//*[contains(@id, 'stream-item-tweet-')])[last()]", html, null, 9, null).singleNodeValue.getAttribute("data-item-id");
                } else {
                    min_position = response.min_position;
                }
                // DOM Request
                if (min_position) {
                    nextPageUrl = "https://twitter.com/i/profiles/show/" + parameters.targetUsername + "/timeline/with_replies?contextual_tweet_id=" + min_position + "&include_available_features=1&include_entities=1&max_position=" + min_position;
                }
                Logger.debug("tweetsResponseHandler() :: prepare next page " + nextPageUrl);
            }
        } else {
            hasMoreTweets = false;
            tweetsCollected = true;
            collectedTweets = 0;
            tweetsPagesCounter = 0;
            nextPageUrl = "";
            min_position = "";
        }
    } catch (e) {
        Logger.error("Exception thrown while handling the collection of tweets: " + e.message);
    }
}

function processTweet(tweet, parameters, html, lastTweetOnPage) {
    try {
        //Logger.production("HTML: " + html);
        // Check for username
        if (!parameters.targetUsername) {
            parameters.targetUsername = tweet.getAttribute("data-screen-name");
        }
        // Tweet
        collectedTweets++;
        Logger.production("processTweet() :: Start collecting tweet " + collectedTweets);
        var tweetDetails = {};
        tweetDetails.externalId = tweet.getAttribute("data-tweet-id");
        if (!(' ' + tweetDetails.externalId in collectedTweetsIds)) {
            Logger.production(tweetDetails.externalId + " start collecting");
            // Continue with collecting the tweet and related data
            tweetDetails.activityType = "1"; // Social Network
            tweetDetails.url = "https://twitter.com" + tweet.getAttribute("data-permalink-path");
            tweetDetails.writeDate = tweet.getElementsByClassName("tweet-timestamp")[0].getAttribute("title").replace(" -", "");
            tweetDetails.writer_externalId = tweet.getAttribute("data-user-id");
            tweetDetails.offset = re.offset;
            parameters.tweetUrl = tweetDetails.url;
            var tweetTextContainer = tweet.getElementsByClassName("TweetTextSize")[0];
            var textToRemove = "";
            try {
                if (tweetTextContainer.getElementsByTagName("a").length) {
                    var arrAnc = tweetTextContainer.getElementsByTagName("a");
                    for (var i = 0; i < arrAnc.length; i++) {
                        /*-------------------------------------here will be added collecting of tagged people------------------------------------------------
                        ------------ xpath for finding text where tagged peaople are inside tweet -> .//*[contains(@class, 'tweet-text-container')]/p */
                        if (arrAnc[i].getAttribute('class')) {
                            if (arrAnc[i].getAttribute('class').match('u-hidden')) {
                                textToRemove = arrAnc[i].textContent;
                            }
                        }
                    }
                }
            } catch (e) {
                Logger.error(e.message + " at line " + e.lineNumber + tweetDetails.url + "\n" + tweetTextContainer.innerHTML);
            }
            Logger.production("processTweet(VAL) :: tweetTextContainer " + tweetTextContainer.outerHTML + " textToRemove " + textToRemove);
            if (textToRemove) {
                tweetDetails.body = tweetTextContainer.textContent.replace(textToRemove, '');
            } else {
                tweetDetails.body = tweetTextContainer.textContent;
            }
            if (html.evaluate('.//*[@class="QuoteTweet-container"]', tweet, null, XPathResult.ANY_TYPE, null)) {
                var innerTexts = html.evaluate('.//*[@class="QuoteTweet-container"]//text()', tweet, null, XPathResult.ANY_TYPE, null);
                tweetDetails.body = tweetDetails.body + ' "';
                var innerText = innerTexts.iterateNext();
                while (innerText) {
                    tweetDetails.body = tweetDetails.body + innerText.textContent;
                    innerText = innerTexts.iterateNext();
                }
                tweetDetails.body = (tweetDetails.body + '"').replace('""', '');
            }
            Logger.debug("processTweet() :: Start collecting tweet " + JSON.stringify(tweetDetails));
            //if (tweetDetails.externalId=='618822790309785600'){
            if (tweet.hasAttribute("data-is-reply-to") && !(tweet.hasAttribute("data-retweet-id"))) {
                // REPLY (COMMENT)
                parameters.tweetType = "3"; // Comment
                Logger.debug("processTweet() :: Start collecting tweet is comment");
            } else {
                // TWEET (TOPIC)
                tweetDetails.itemType = "2"; // Topic
                tweetDetails.parent_externalId = tweet.getAttribute("data-user-id");
                tweetDetails.parentObjectType = "4"; // Web-Entity
                if (tweet.getElementsByClassName("js-geo-pivot-link")[0]) {
                    collectTweetAddress(tweet.getElementsByClassName("js-geo-pivot-link")[0].getAttribute("data-place-id"), tweetDetails.externalId, tweetDetails.writer_externalId, "2");
                }
                
                collectedTweetsIds[' ' + tweetDetails.externalId] = true;
                addEntity(tweetDetails);

                re.body2.push(tweetDetails.url);
                Logger.debug(re.body2);

                var topicWithCoordinates = html.evaluate(".//div[@class='content']//span[contains(@class, 'Tweet-geo')]", tweet, null, 9, null).singleNodeValue;
                if (topicWithCoordinates) {
                    tweetsWithGeo = tweetsWithGeo + tweetDetails.externalId + ",";
                }
                parameters.tweetType = "2"; // Topic
                // Author
                var tweetAuthorDetails = {};
                tweetAuthorDetails.externalId = tweet.getAttribute("data-user-id");
                tweetAuthorDetails.itemType = "4"; // Web-Entity
                tweetAuthorDetails.type = "1"; // Person
                tweetAuthorDetails.activityType = "1"; // Social Network
                tweetAuthorDetails.url = "https://twitter.com/" + tweet.getAttribute("data-screen-name");
                tweetAuthorDetails.title = tweet.getAttribute("data-name");
                tweetAuthorDetails.body = tweet.getAttribute("data-screen-name");
                tweetAuthorDetails.imageUrl = tweet.getElementsByClassName("avatar")[0].getAttribute("src");
				
				
				//VAL - REMOVE LATER -----------
				Logger.production('<tweetAuthorDetails> ' + tweetAuthorDetails);
				//------------------------------
				
				
                scheduledInfoPerAccoount += 1;
                domRequestAsynch(tweetAuthorDetails.url, searchAccountsInfoResponseHandler, tweetAuthorDetails);
                //var testSrc = tweet.getElementsByClassName("avatar")[0].getAttribute("src");
                //Logger.production("currentUrl = " + window.location.href);
                //if (testSrc.indexOf('https')) {
                //  tweetAuthorDetails.imageUrl = tweet.getElementsByClassName("avatar")[0].getAttribute("src");
                //}else{
                //  tweetAuthorDetails.imageUrl = tweet.getElementsByClassName("avatar")[0].getAttribute("src").replace('http',"https");
                //}

                if (!(' ' + tweetAuthorDetails.externalId in collectedAccounts)) {
                    Logger.debug("processTweet() :: writer was not collected");
                    if (socialDownload == "false") {
                        collectedAccounts[' ' + tweetAuthorDetails.externalId] = true;
                        addImage(tweetAuthorDetails);
                    } else {
                        collectedAccounts[' ' + tweetAuthorDetails.externalId] = {
                            activities: 1,
                            place: accountsSocialDownload.length
                        };
                        Logger.debug("processTweet() :: Add writer for social download");
                        accountsSocialDownload.push({
                            activities: collectedAccounts[' ' + tweetAuthorDetails.externalId]["activities"],
                            profile: tweetAuthorDetails
                        });
                    }
                } else {
                    if (socialDownload == "true") {
                        Logger.debug("processTweet() :: Increase the number of activities of the profile");
                        collectedAccounts[' ' + tweetAuthorDetails.externalId]["activities"] += 1;
                        accountsSocialDownload[collectedAccounts[' ' + tweetAuthorDetails.externalId]["place"]]["activities"] = collectedAccounts[' ' + tweetAuthorDetails.externalId]["activities"];
                    }
                    console.log("The account " + tweetAuthorDetails.title + " is already collected.");
                }
                Logger.debug("processTweet() :: Collect author of tweet " + JSON.stringify(tweetAuthorDetails));
                // Attached photos
                var images = tweet.getElementsByClassName("media-thumbnail");
                if (images.length === 0) {
                    images = tweet.getElementsByClassName("js-old-photo");
                }
                // Quick Fix 22.12.2015 - attached images in tweet
                if (images.length === 0) {
                    images = tweet.getElementsByClassName("js-adaptive-photo");
                }
                for (var i = 0; i < images.length; i++) {
                    var imageDetails = {};
                    imageDetails.imageUrl = images[i].getAttribute("data-image-url");
                    if (imageDetails.imageUrl) {
                        imageDetails.itemType = "5"; // Image
                        imageDetails.activityType = "1"; // Social Network
                        imageDetails.imageUrl = imageDetails.imageUrl.replace(":large", "");
                        imageDetails.externalId = imageDetails.imageUrl.match(/media\/([a-zA-Z0-9-_]+)/)[1];
                        imageDetails.url = tweetDetails.url;
                        imageDetails.writeDate = tweetDetails.writeDate;
                        imageDetails.offset = re.offset;
                        imageDetails.parent_externalId = tweetDetails.externalId;
                        imageDetails.parentObjectType = tweetDetails.itemType;
                        imageDetails.writer_externalId = tweetDetails.parent_externalId;
                        addImage(imageDetails);
                        Logger.debug("processTweet() :: Collect images of tweet " + JSON.stringify(imageDetails));
                    }
                }
            }
            //if (html.evaluate(".//*[contains(@class, 'AdaptiveMedia-videoContainer')]", tweet, null, 9, null).singleNodeValue) {
            if (html.evaluate(".//*[contains(@class,'card-type-player')]", tweet, null, 9, null).singleNodeValue || html.evaluate(".//*[contains(@class, 'AdaptiveMedia-videoContainer')]", tweet, null, 9, null).singleNodeValue) {
                // take the attribute that holds video-url
                allVideoIds += tweetDetails.externalId + ';';
                // var videoUrl = html.evaluate(".//*[contains(@class, 'AdaptiveMedia-videoContainer')]//*[contains(@class, 'PlayableMedia-player')]", tweet, null, 9, null).singleNodeValue.getAttribute("style");
                // videoUrl = videoUrl.match(/\/[0-9]+/);
                // var video = {
                //  externalId: "player_tweet_" + tweetDetails.externalId,
                //  itemType: "22",
                //  url: tweetDetails.url,
                //  body: '<iframe src=https://twitter.com/i/videos/tweet/"' + tweetDetails.externalId + '"/>',
                //  activityType: "1",
                //  imageUrl: "https://video.twimg.com/ext_tw_video" + videoUrl + "/pu/pl/V2oDHiBuJoSmpLu4.m3u8",
                //  writer_externalId: tweetDetails.writer_externalId,
                //  parentObjectType: tweetDetails.itemType,
                //  parent_externalId: tweetDetails.externalId
                // }
                // addImageScraping(video);
            }

            // Key-Values
            var keyValues = {};
            keyValues.retweets = tweet.getElementsByClassName("ProfileTweet-action--retweet")[0].textContent.replace(",", "").match(/[0-9]+/)[0];
            keyValues.favorites = tweet.getElementsByClassName("ProfileTweet-action--favorite")[0].textContent.replace(",", "").match(/[0-9]+/)[0];
            keyValues.replies = tweet.getElementsByClassName("ProfileTweet-action--reply")[0].textContent.replace(",", "").match(/[0-9]+/)[0];
            // should work only for tweets
            if (tweetDetails.itemType == "2") {
                if (keyValues.retweets) {
                    addEntity({
                        itemType: "24",
                        parent_externalId: tweetDetails.externalId,
                        parentObjectType: tweetDetails.itemType, // Topic
                        activityType: "1", // Integer
                        title: "SHARES",
                        body: keyValues.retweets,
                        description: "shares_count"
                    });
                }
                if (keyValues.favorites) {
                    addEntity({
                        itemType: "24",
                        parent_externalId: tweetDetails.externalId,
                        parentObjectType: tweetDetails.itemType, // Topic
                        activityType: "1", // Integer
                        title: "LIKES",
                        body: keyValues.favorites,
                        description: "likes_count"
                    });
                }
                if (keyValues.replies) {
                    addEntity({
                        itemType: "24",
                        parent_externalId: tweetDetails.externalId,
                        parentObjectType: tweetDetails.itemType, // Topic
                        activityType: "1", // Integer
                        title: "COMMENTS",
                        body: keyValues.replies,
                        description: "comments_count"
                    });
                }
                Logger.debug("processTweet() :: Collect key values of tweet ");
            }
            parameters.tweetId = tweetDetails.externalId;

            // Favorites
            if (parameters.isTarget) {
                if (keyValues.favorites > 0 && collectLikes === true) {
                    parameters.favouritesCount = keyValues.favorites;
                    collectFavorites(parameters);
                }
            }
            // Collects ids of all retweets. Likers of original tweets will be collected at the end of the web flow
            if (tweet.hasAttribute("data-retweet-id")) {
                allRetweetIds += parameters.tweetId + ";";
            }

            // Replies
            // collect shared tweets. we do not collect the replies of the original tweet
            if (tweet.hasAttribute("data-retweet-id")) {
                var sharedTweet = {};
                sharedTweet.externalId = tweet.getAttribute("data-retweet-id");
                sharedTweet.itemType = "3"; // Comment
                sharedTweet.type = "9"; // share
                sharedTweet.parent_externalId = tweetDetails.externalId;
                sharedTweet.parentObjectType = "2"; // Topic
                sharedTweet.activityType = "1";
                sharedTweet.url = tweetDetails.url;
                sharedTweet.body = tweetDetails.body;
                sharedTweet.writer_externalId = parameters.targetId;
                addEntity(sharedTweet);
            } else {
                // Replies
                if (parameters.isTarget) {
                    if (collectComments === true) {
                        
                        // if(keyValues.replies){
                        //     parameters.tweetType = "3";
                        //     parameters.retweeted = false;
                        //     collectReplies(parameters);
                        //     Logger.debug("processTweet() :: Invoke collectComments() - Collect replies of tweet.");
                        // }
                        collectReplies(parameters);
                        Logger.debug("processTweet() :: Invoke collectComments() - Collect replies of tweet.");
                    }
                }
            }
            collectedNumberTweets--;
        } else {
            Logger.debug("processTweet() :: The tweet " + tweetDetails.externalId + " is already collected.");
            console.log("The tweet " + tweetDetails.externalId + " is already collected.");
        }
        // Proceed with next page
        if (lastTweetOnPage) {
            collectNextPage = true;
        }

    } catch (e) {
        Logger.error("Exception thrwon while processing a tweet: " + e.message);
    }
}

function collectTweetAddress(dataPlaceId, parentId, writerId, itemType) {
    if (tweetPlaces.hasOwnProperty(dataPlaceId)) {
        tweetPlaces[dataPlaceId].push(parentId + ' ' + writerId + ' ' + itemType);
    } else {
        tweetPlaces[dataPlaceId] = [];
        tweetPlaces[dataPlaceId].push(parentId + ' ' + writerId + ' ' + itemType);
    }
}

function callVMFLocations(tweetUrl, re, ie, oe, executor){
    makeVMFRequest(re, ie, oe, executor)({
        input: {
            platform: "twitter-tweet-location",
            task: "twitterCollectLocation",
            useAgent: "none"
        },
        targets: tweetUrl
    });
}

/* ----------------------------------------------- */
/* ------------------ FAVORITES ------------------ */
/* ----------------------------------------------- */
function collectFavorites(parameters) {
    try {
        var url = "https://twitter.com/i/activity/favorited_popup?id=" + parameters.tweetId;
        domRequest(url, favoritesResponseHandler, parameters);
        Logger.debug("collectFavorites() :: Collect LIKES for tweet " + url);
    } catch (e) {
        Logger.error("Exception thrown while collecting favorites: " + e.message);
    }
}

function favoritesResponseHandler(response, parameters) {
    try {
        Logger.debug("favoritesResponseHandler() :: Start collecting likes");
        response = JSON.parse(response);
        if (response.htmlUsers) {
            var parser = new DOMParser();
            var htmlString = response.htmlUsers;
            var html = parser.parseFromString(htmlString, "text/html");
            var likers = html.evaluate("//li[@data-item-type='user']/div", html, null, 7, null);
            var likerId = "";
            var likeCount = 0;
            for (var i = 0; i < likers.snapshotLength; i++) {
                var liker = likers.snapshotItem(i);
                likeCount++;
                // Liker
                var likerDetails = {};
                likerDetails.externalId = liker.getAttribute("data-user-id");
                likerDetails.itemType = "4"; // Web-Entity
                likerDetails.type = "1"; // Person
                likerDetails.activityType = "1"; // Social Network
                likerDetails.url = "https://twitter.com/" + liker.getAttribute("data-screen-name");
                likerDetails.body = liker.getAttribute("data-screen-name");
                likerDetails.title = liker.getElementsByClassName("fullname")[0].textContent;
                likerDetails.description = liker.getElementsByClassName("bio")[0].textContent;
                likerDetails.imageUrl = liker.getElementsByClassName("avatar")[0].getAttribute("src").replace("_normal", "");
                scheduledInfoPerAccoount += 1;
                domRequestAsynch(likerDetails.url, searchAccountsInfoResponseHandler, likerDetails);
                if (!(' ' + likerDetails.externalId in collectedAccounts)) {
                    if (socialDownload == "false") {
                        collectedAccounts[' ' + likerDetails.externalId] = true;
                        addImage(likerDetails);
                    } else {
                        collectedAccounts[' ' + likerDetails.externalId] = {
                            activities: 1,
                            place: accountsSocialDownload.length
                        };
                        accountsSocialDownload.push({
                            activities: collectedAccounts[' ' + likerDetails.externalId]["activities"],
                            profile: likerDetails
                        });
                    }
                } else {
                    if (socialDownload == "true") {
                        collectedAccounts[' ' + likerDetails.externalId]["activities"] += 1;
                        accountsSocialDownload[collectedAccounts[' ' + likerDetails.externalId]["place"]]["activities"] = collectedAccounts[' ' + likerDetails.externalId]["activities"];
                    }
                    console.log("The account " + likerDetails.title + " is already collected.");
                }
                Logger.debug("favoritesResponseHandler() :: LIKER " + JSON.stringify(likerDetails));
                // this is supported only for liked of topics
                if (parameters.tweetType == "2") {
                    // Like
                    var likeDetails = {};
                    likeDetails.externalId = parameters.tweetId + "_" + likerDetails.externalId;
                    likeDetails.itemType = "3"; // Comment
                    likeDetails.type = "2"; // Like
                    likeDetails.parent_externalId = parameters.tweetId;
                    likeDetails.parentObjectType = parameters.tweetType; // tweet
                    likeDetails.activityType = "1"; // Social Network
                    likeDetails.url = parameters.tweetUrl;
                    likeDetails.writer_externalId = likerDetails.externalId;
                    addEntity(likeDetails);
                    Logger.debug("favoritesResponseHandler() :: LIKE " + JSON.stringify(likeDetails));
                }
            }
        }
    } catch (e) {
        Logger.error("Exception thrown while handling the collection of favorites: " + e.message);
    }
}
/* --------------------------------------------- */
/* ------------------ REPLIES ------------------ */
/* --------------------------------------------- */
function collectReplies(parameters) {
    try {
        var url = "https://twitter.com/" + parameters.targetUsername + "/status/" + parameters.tweetId;
        domRequest(url, repliesResponseHandler, parameters);
        Logger.debug("collectReplies() :: Collect comments for tweet " + url);
    } catch (e) {
        Logger.error("Exception thrown while collecting replies: " + e.message);
    }
}

function repliesResponseHandler(response, parameters) {
    try {
        Logger.debug("repliesResponseHandler() :: Start collecting comments.");
        var parser = new DOMParser();
        var html = parser.parseFromString(response, "text/html");
        //Logger.production("response = " + response);
        if (parameters.tweetType == 3) {
            
            // UPPER LEVEL TWEETS
            var upperTweets = html.evaluate("//*[contains(@class, 'permalink-in-reply-tos')]|//li//div[contains(@class, '-stream-tweet')]", html, null, 7, null);
            var upperCounter = 0;
            var tweetParent = "";
            var tweetToComment = "";
            var tweetParentType = "";
            Logger.debug("repliesResponseHandler() :: If main tweet(s) was not collected");
            //Check if the main tweet exists. If not stop collecting
            if (!upperTweets.snapshotLength) {
                Logger.debug("repliesResponseHandler() :: The main tweet of the comment is hidden so we cannot collect it.");
                return;
            }
            
            //upperTweets = document.evaluate("//*[contains(@class, 'permalink-in-reply-tos')]|//li//div[contains(@class, '-stream-tweet')]",upperTweets[0],null,7,null);
            for (var i = 1; i < upperTweets.snapshotLength; i++) {
                var upperTweet = upperTweets.snapshotItem(i);
                upperCounter++;

                
                var tweetDetails = {};
                tweetDetails.externalId = upperTweet.getAttribute("data-tweet-id");
                tweetDetails.activityType = "1"; // Social Network
                tweetDetails.url = "https://twitter.com" + upperTweet.getAttribute("data-permalink-path");
                if (html.evaluate(".//*[contains(@class, 'tweet-text')]", upperTweet, null, 9, null).singleNodeValue !== null) {
                    tweetDetails.body = html.evaluate(".//*[contains(@class, 'tweet-text')]", upperTweet, null, 9, null).singleNodeValue.textContent;
                }
                if (html.evaluate(".//*[contains(@class, 'tweet-timestamp')]", upperTweet, null, 9, null).singleNodeValue !== null) {
                    tweetDetails.writeDate = html.evaluate(".//*[contains(@class, 'tweet-timestamp')]", upperTweet, null, 9, null).singleNodeValue.getAttribute("title").replace("- ", "");
                }
                tweetDetails.writer_externalId = upperTweet.getAttribute("data-user-id");
                tweetDetails.offset = re.offset;
                if (upperCounter == 1) {
                    // TOPIC
                    //var single = html.evaluate("(//*[contains(@class, 'permalink-in-reply-tos')]|//li//div[contains(@class, '-stream-tweet')])[1]",upperTweet,null,9,null).singleNodeValue;
                    //tweetDetails.externalId = single.getAttribute("data-tweet-id");
                    tweetDetails.itemType = "2";
                    tweetDetails.parent_externalId = "twitter.com";//upperTweet.getAttribute("data-user-id");
                    tweetDetails.parentObjectType = "4"; // Web-Entity
                    tweetParent = tweetDetails.externalId;
                    tweetParentType = "2";
                    //Logger.production("tweetparent = " + tweetParent);
                } else {
                    // COMMENT
                    //Logger.production("tweetparent = " + tweetParent);
                    tweetDetails.itemType = "3"; // Comment
                    tweetDetails.type = "1"; // Comment
                    tweetDetails.parent_externalId = tweetParent;
                    tweetDetails.parentObjectType = "2";
                    if (upperCounter >= 3) {
                        //tweetDetails.to_comment_externalId = tweetToComment;
                    }
                    tweetToComment = tweetDetails.externalId;
                }
                if (upperTweet.getElementsByClassName("js-geo-pivot-link")[0]) {
                    collectTweetAddress(upperTweet.getElementsByClassName("js-geo-pivot-link")[0].getAttribute("data-place-id"), tweetDetails.externalId, tweetDetails.writer_externalId, tweetDetails.itemType);
                }
                if (!(' ' + tweetDetails.externalId in collectedTweetsIds)) {
                    collectedTweetsIds[' ' + tweetDetails.externalId] = true;
                    addEntity(tweetDetails);
                    Logger.production(JSON.stringify(tweetDetails));
                    // Collect relevant data to the tweet
                    // Author
                    var tweetAuthorDetails = {};
                    tweetAuthorDetails.externalId = upperTweet.getAttribute("data-user-id");
                    tweetAuthorDetails.itemType = "4"; // Web-Entity
                    tweetAuthorDetails.type = "1"; // Person
                    tweetAuthorDetails.activityType = "1"; // Social Network
                    tweetAuthorDetails.url = "https://twitter.com/" + upperTweet.getAttribute("data-screen-name");
                    tweetAuthorDetails.title = upperTweet.getAttribute("data-name");
                    tweetAuthorDetails.body = upperTweet.getAttribute("data-screen-name");
                    scheduledInfoPerAccoount += 1;
                    domRequestAsynch(tweetAuthorDetails.url, searchAccountsInfoResponseHandler, tweetAuthorDetails);
                    if (html.evaluate(".//img[contains(@class, 'avatar')]", upperTweet, null, 9, null).singleNodeValue !== null) {
                        tweetAuthorDetails.imageUrl = html.evaluate(".//img[contains(@class, 'avatar')]", upperTweet, null, 9, null).singleNodeValue.getAttribute("src");
                    }
                    if (!(' ' + tweetAuthorDetails.externalId in collectedAccounts)) {
                        if (socialDownload == "false") {
                            collectedAccounts[' ' + tweetAuthorDetails.externalId] = true;
                            addImage(tweetAuthorDetails);
                        } else {
                            collectedAccounts[' ' + tweetAuthorDetails.externalId] = {
                                activities: 1,
                                place: accountsSocialDownload.length
                            };
                            accountsSocialDownload.push({
                                activities: collectedAccounts[' ' + tweetAuthorDetails.externalId]["activities"],
                                profile: tweetAuthorDetails
                            });
                        }
                    } else {
                        if (socialDownload == "true") {
                            collectedAccounts[' ' + tweetAuthorDetails.externalId]["activities"] += 1;
                            accountsSocialDownload[collectedAccounts[' ' + tweetAuthorDetails.externalId]["place"]]["activities"] = collectedAccounts[' ' + tweetAuthorDetails.externalId]["activities"];
                        }
                        console.log("The account " + tweetAuthorDetails.title + " is already collected.");
                    }
                    Logger.debug("repliesResponseHandler() :: main Tweet " + JSON.stringify(tweetDetails));
                    Logger.debug("repliesResponseHandler() :: main Tweet writer " + JSON.stringify(tweetAuthorDetails));
                    // If there is image in one of the upper tweets
                    var imageContainer = html.evaluate(".//*[contains(@class, 'AdaptiveMedia-photoContainer')]//img", upperTweet, null, 7, null);
                    if (imageContainer.snapshotLength > 0) {
                        for (var j = 0; j < imageContainer.snapshotLength; j++) {
                            specificImage = imageContainer.snapshotItem(j);
                            var image = {
                                externalId: specificImage.getAttribute("src").match(/media\/(.*?)\./)[1],
                                itemType: "5",
                                url: tweetDetails.url,
                                activityType: "1",
                                imageUrl: specificImage.getAttribute("src"),
                                writer_externalId: tweetDetails.writer_externalId,
                                parentObjectType: "2",
                                parent_externalId: tweetDetails.externalId
                            };
                            addImage(image);
                            Logger.production("IMG tweet: " + JSON.stringify(tweetDetails));
                            Logger.debug("repliesResponseHandler() :: Images in tweet " + JSON.stringify(imageContainer));
                        }
                    }
                    // collect if there is video
                    //if (html.evaluate(".//*[contains(@class, 'AdaptiveMedia-videoContainer')]", upperTweet, null, 9, null).singleNodeValue) {
                    if (html.evaluate(".//*[contains(@class,'card-type-player')]", upperTweet, null, 9, null).singleNodeValue || html.evaluate(".//*[contains(@class, 'AdaptiveMedia-videoContainer')]", upperTweet, null, 9, null).singleNodeValue) {

                        allVideoIds += tweetDetails.externalId + ';';
                        // take the attribute that holds video-url
                        // var videoUrl = html.evaluate(".//*[contains(@class, 'AdaptiveMedia-videoContainer')]//*[contains(@class, 'PlayableMedia-player')]", upperTweet, null, 9, null).singleNodeValue.getAttribute("style");
                        // videoUrl = videoUrl.match(/\/[0-9]+/);
                        // var video = {
                        //  externalId: "player_tweet_" + tweetDetails.externalId,
                        //  itemType: "22",
                        //  url: tweetDetails.url,
                        //  body: '<iframe src=https://twitter.com/i/videos/tweet/"' + tweetDetails.externalId + '"/>',
                        //  activityType: "1",
                        //  imageUrl: "https://video.twimg.com/ext_tw_video" + videoUrl + "/pu/pl/V2oDHiBuJoSmpLu4.m3u8",
                        //  writer_externalId: tweetDetails.writer_externalId,
                        //  parentObjectType: tweetDetails.itemType,
                        //  parent_externalId: tweetDetails.externalId
                        // }
                        // addImageScraping(video);
                    }
                } else {
                    console.log("The tweet " + tweetDetails.externalId + " is already collected.");
                }
            }
            Logger.debug("repliesResponseHandler() :: If the tweet is a main tweet - author " + JSON.stringify(mainAuthor));
            // TWEET
            var mainTweetObject;
            if (html.evaluate("//*[contains(@class, 'permalink-tweet-container')]//*[contains(@class, 'permalink-tweet')]", html, null, 9, null).singleNodeValue !== null) {
                mainTweetObject = html.evaluate("//*[contains(@class, 'permalink-tweet-container')]//*[contains(@class, 'permalink-tweet')]", html, null, 9, null).singleNodeValue;
            }
            // Author
            var mainAuthor = {};
            mainAuthor.externalId = mainTweetObject.getAttribute("data-user-id");
            mainAuthor.itemType = "4"; // Web-Entity
            mainAuthor.type = "1"; // Person
            mainAuthor.activityType = "1"; // Social Network
            mainAuthor.url = "https://twitter.com/" + mainTweetObject.getAttribute("data-screen-name");
            mainAuthor.title = mainTweetObject.getAttribute("data-name");
            mainAuthor.body = mainTweetObject.getAttribute("data-screen-name");
            scheduledInfoPerAccoount += 1;
            domRequestAsynch(mainAuthor.url, searchAccountsInfoResponseHandler, mainAuthor);
            if (html.evaluate(".//img[contains(@class, 'avatar')]", mainTweetObject, null, 9, null).singleNodeValue !== null) {
                mainAuthor.imageUrl = html.evaluate(".//img[contains(@class, 'avatar')]", mainTweetObject, null, 9, null).singleNodeValue.getAttribute("src");
            }

            if (!(' ' + mainAuthor.externalId in collectedAccounts)) {
                if (socialDownload == "false") {
                    collectedAccounts[' ' + mainAuthor.externalId] = true;
                    addImage(mainAuthor);
                } else {
                    collectedAccounts[' ' + mainAuthor.externalId] = {
                        activities: 1,
                        place: accountsSocialDownload.length
                    };
                    accountsSocialDownload.push({
                        activities: collectedAccounts[' ' + mainAuthor.externalId]["activities"],
                        profile: mainAuthor
                    });
                }
            } else {
                if (socialDownload == "true") {
                    collectedAccounts[' ' + mainAuthor.externalId]["activities"] += 1;
                    accountsSocialDownload[collectedAccounts[' ' + mainAuthor.externalId]["place"]]["activities"] = collectedAccounts[' ' + mainAuthor.externalId]["activities"];
                }
                console.log("The account " + mainAuthor.title + " is already collected.");
            }
            // Tweet
            var mainTweet = {};
            mainTweet.externalId = mainTweetObject.getAttribute("data-item-id");
            mainTweet.itemType = "3"; // Comment
            mainTweet.type = "1"; // Comment
            mainTweet.parent_externalId = tweetParent;
            mainTweet.parentObjectType = "2"; // Topic
            if (tweetToComment) {
                //mainTweet.to_comment_externalId = tweetToComment ;
            }
            mainTweet.activityType = "1";
            mainTweet.url = "https://twitter.com" + mainTweetObject.getAttribute("data-permalink-path");
            if (html.evaluate(".//*[contains(@class, 'tweet-text')]", mainTweetObject, null, 9, null).singleNodeValue !== null) {
                mainTweet.body = html.evaluate(".//*[contains(@class, 'tweet-text')]", mainTweetObject, null, 9, null).singleNodeValue.textContent;
            }
            if (html.evaluate(".//*[contains(@class, 'tweet-timestamp')]", mainTweetObject, null, 9, null).singleNodeValue !== null) {
                mainTweet.writeDate = html.evaluate(".//*[contains(@class, 'tweet-timestamp')]", mainTweetObject, null, 9, null).singleNodeValue.getAttribute("title").replace("- ", "");
            }

            mainTweet.writer_externalId = mainAuthor.externalId;
            mainTweet.offset = re.offset;
            // covers this case of reply https://twitter.com/val_rub/status/334681198653743104
            if (mainTweet.parent_externalId === '') {
                mainTweet.itemType = "2"; // topic
                mainTweet.type = "1"; // Comment
                mainTweet.parent_externalId = mainTweet.writer_externalId;
                mainTweet.parentObjectType = "4";
            }
            if (mainTweetObject.getElementsByClassName("js-geo-pivot-link")[0]) {
                //body: mainTweetObject.getElementsByClassName("js-geo-pivot-link")[0].textContent
                collectTweetAddress(mainTweetObject.getElementsByClassName("js-geo-pivot-link")[0].getAttribute("data-place-id"), mainTweet.externalId, mainTweet.writer_externalId, mainTweet.itemType);
            }
            if (!(' ' + mainTweet.externalId in collectedTweetsIds)) {
                collectedTweetsIds[' ' + mainTweet.externalId] = true;
                addEntity(mainTweet);
            } else {
                console.log("The tweet " + mainTweet.externalId + " is already collected.");
            }
            Logger.debug("repliesResponseHandler() :: If the tweet is a main tweet - tweet " + JSON.stringify(mainTweet));
        }
        // REPLIES
        var replies = html.evaluate("//*[contains(@class, 'replies-to')]|//div[contains(@class, 'js-stream-tweet')]", html, null, 7, null);
        var toCommentCounter = 0;
        var toCommentId = '';
        for (var i = 0; i < replies.snapshotLength; i++) {
            var reply = replies.snapshotItem(i);
            // Reply
            var replyDetails = {};
            replyDetails.itemType = "3"; // Comment
            replyDetails.type = "1"; // Comment
            replyDetails.activityType = "1"; // Social Network
            replyDetails.parent_externalId = parameters.tweetId;
            replyDetails.parentObjectType = "2";
            if (html.evaluate(".//*[contains(@class, 'tweet-text')]", reply, null, 9, null).singleNodeValue !== null) {
                replyDetails.body = html.evaluate(".//*[contains(@class, 'tweet-text')]", reply, null, 9, null).singleNodeValue.textContent;
            }
            replyDetails.externalId = reply.getAttribute("data-item-id");
            if (toCommentCounter === 0) {
                toCommentId = replyDetails.externalId;
            }
            if (html.evaluate(".//*[@class='stream-item-header']/a", reply, null, 9, null).singleNodeValue !== null) {
                replyDetails.writer_externalId = html.evaluate(".//*[@class='stream-item-header']/a", reply, null, 9, null).singleNodeValue.getAttribute("data-user-id");
            }
            if (html.evaluate(".//*[contains(@class,'tweet-timestamp')]", reply, null, 9, null).singleNodeValue !== null) {
                replyDetails.writeDate = html.evaluate(".//*[contains(@class,'tweet-timestamp')]", reply, null, 9, null).singleNodeValue.getAttribute("title").replace(" -", "");
            }
            if (html.evaluate(".//*[contains(@class,'tweet-timestamp')]", reply, null, 9, null).singleNodeValue !== null) {
                replyDetails.url = "https://twitter.com" + html.evaluate(".//*[contains(@class,'tweet-timestamp')]", reply, null, 9, null).singleNodeValue.getAttribute("href");
            }
            replyDetails.offset = re.offset;
            if (mainTweet && tweetParent) {
                if (mainTweet.externalId) {
                    replyDetails.parent_externalId = tweetParent;
                    replyDetails.parentObjectType = "2";
                    // replyDetails.to_comment_externalId = mainTweet.externalId;
                }
            }
            var repliesWithCoordinates = html.evaluate(".//div[@class='content']//span[contains(@class, 'Tweet-geo')]", reply, null, 9, null).singleNodeValue;
            if (repliesWithCoordinates) {
                tweetsWithGeo = tweetsWithGeo + replyDetails.externalId + ",";
            }
            //collect replies to comments
            var repliesToComments = html.evaluate("./../../.[not(contains(@class,'ThreadedConversation--loneTweet'))]", reply, null, XPathResult.ANY_TYPE, null);
            var replieToComments = repliesToComments.iterateNext();
            if (replieToComments) {
                toCommentCounter = toCommentCounter + 1;
                if (toCommentCounter > 1) {
                    replyDetails.to_comment_externalId = toCommentId;
                }
            } else {
                toCommentCounter = 0;
                toCommentId = '';
            }
            if (reply.getElementsByClassName("js-geo-pivot-link")[0]) {
                collectTweetAddress(reply.getElementsByClassName("js-geo-pivot-link")[0].getAttribute("data-place-id"), replyDetails.externalId, replyDetails.writer_externalId, replyDetails.itemType);
            }
            Logger.debug("repliesResponseHandler() :: If the tweet is a main tweet - reply(" + i + ") of " + replies.snapshotLength + "  " + JSON.stringify(replyDetails));
            if (!(' ' + replyDetails.externalId in collectedTweetsIds)) {
                collectedTweetsIds[' ' + replyDetails.externalId] = true;
                addEntity(replyDetails);
                // Attached images
                try {
                    var attachments = html.evaluate(".//div[@data-image-url]", reply, null, 7, null);
                    for (var j = 0; j < attachments.snapshotLength; j++) {
                        var attachment = attachments.snapshotItem(j);
                        var attachmentDetails = {};
                        attachmentDetails.externalId = attachment.getAttribute("data-image-url").match(/media\/(.*?)\./)[1];
                        attachmentDetails.itemType = "5"; // Image
                        attachmentDetails.activityType = "1"; // Social Network
                        attachmentDetails.parent_externalId = replyDetails.externalId;
                        attachmentDetails.parentObjectType = replyDetails.itemType;
                        attachmentDetails.url = replyDetails.url;
                        attachmentDetails.imageUrl = attachment.getAttribute("data-image-url");
                        attachmentDetails.writeDate = replyDetails.writeDate;
                        attachmentDetails.writer_externalId = replyDetails.writer_externalId;
                        addImage(attachmentDetails);
                        Logger.debug("repliesResponseHandler() :: If the tweet is a main tweet - images(" + j + ") of " + attachments.snapshotLength + "  " + JSON.stringify(attachmentDetails));
                    }
                    // collect if there is video
                    //if (html.evaluate(".//*[contains(@class, 'AdaptiveMedia-videoContainer')]", reply, null, 9, null).singleNodeValue) {
                    if (html.evaluate(".//*[contains(@class,'card-type-player')]", reply, null, 9, null).singleNodeValue || html.evaluate(".//*[contains(@class, 'AdaptiveMedia-videoContainer')]", reply, null, 9, null).singleNodeValue) {
                        // take the attribute that holds video-url
                        //
                        allVideoIds += replyDetails.externalId + ';';
                        // var videoUrl = html.evaluate(".//*[contains(@class, 'AdaptiveMedia-videoContainer')]//*[contains(@class, 'PlayableMedia-player')]", reply, null, 9, null).singleNodeValue.getAttribute("style");
                        // videoUrl = videoUrl.match(/\/[0-9]+/);
                        // var video = {
                        //  externalId: "player_tweet_" + replyDetails.externalId,
                        //  itemType: "22",
                        //  url: replyDetails.url,
                        //  body: '<iframe src=https://twitter.com/i/videos/tweet/"' + replyDetails.externalId + '"/>',
                        //  activityType: "1",
                        //  imageUrl: "https://video.twimg.com/ext_tw_video" + videoUrl + "/pu/pl/V2oDHiBuJoSmpLu4.m3u8",
                        //  writer_externalId: replyDetails.writer_externalId,
                        //  parentObjectType: replyDetails.itemType,
                        //  parent_externalId: replyDetails.externalId
                        // }
                        // addImageScraping(video);
                   }
                } catch (e) {
                    Logger.error(e.message + " at line " + e.lineNumber);
                }
                // Author
                var replyAuthor = {};
                replyAuthor.externalId = reply.getAttribute("data-user-id");
                replyAuthor.itemType = "4"; // Web-Entity
                replyAuthor.type = "1"; // Person
                replyAuthor.activityType = "1"; // Social Network
                replyAuthor.url = "https://twitter.com/" + reply.getAttribute("data-screen-name");
                replyAuthor.title = reply.getAttribute("data-name");
                replyAuthor.body = reply.getAttribute("data-screen-name");
                if (html.evaluate(".//img[contains(@class, 'avatar')]", reply, null, 9, null).singleNodeValue !== null) {
                    replyAuthor.imageUrl = html.evaluate(".//img[contains(@class, 'avatar')]", reply, null, 9, null).singleNodeValue.getAttribute("src");
                }
                if (!(' ' + replyAuthor.externalId in collectedAccounts)) {
                    if (socialDownload == "false") {
                        collectedAccounts[' ' + replyAuthor.externalId] = true;
                        addImage(replyAuthor);
                    } else {
                        collectedAccounts[' ' + replyAuthor.externalId] = {
                            activities: 1,
                            place: accountsSocialDownload.length
                        };
                        accountsSocialDownload.push({
                            activities: collectedAccounts[' ' + replyAuthor.externalId]["activities"],
                            profile: replyAuthor
                        });
                    }
                } else {
                    if (socialDownload == "true") {
                        collectedAccounts[' ' + replyAuthor.externalId]["activities"] += 1;
                        accountsSocialDownload[collectedAccounts[' ' + replyAuthor.externalId]["place"]]["activities"] = collectedAccounts[' ' + replyAuthor.externalId]["activities"];
                    }
                    console.log("The account " + replyAuthor.title + " is already collected.");
                }
                Logger.debug("repliesResponseHandler() :: If the tweet is a main tweet - reply(" + i + ") author " + JSON.stringify(replyAuthor));
            } else {
                console.log("The tweet " + replyDetails.externalId + " is already collected.");
            }
        }
    } catch (e) {
        Logger.error("Exception thrown while handling the collection of replies: " + e.message);
    }
}
/* --------------------------------------------- */
/* ------------------ PROFILE ------------------ */
/* --------------------------------------------- */
function collectProfile(username, userid) {
    try {
        var url = "https://twitter.com/" + username;
        var parameters = {
            userid: userid
        };
        domRequestAsynch(url, profileResponseHandler, parameters);
    } catch (e) {
        Logger.error("Exception thrown while collecting profiles: " + e.message);
    }
}

function profileResponseHandler(response, parameters) {
    // profile Location
    try {
        var parser = new DOMParser();
        var html = parser.parseFromString(response, "text/html");
        if (html.evaluate(profileXPaths.location, html, null, 9, null).singleNodeValue) {
            var location = html.evaluate(profileXPaths.location, html, null, 9, null).singleNodeValue.textContent;
            addEntity({
                itemType: "15", // Address
                type: "2",
                parent_externalId: parameters.userid,
                parentObjectType: "4", // Web-Entity
                body: location,
                writer_externalId: parameters.userid,
                gender: "P"
            });
        }
    } catch (e) {
        Logger.error("Exception thrown while handling the collection of profiles: " + e.message);
    }
}
var currUsername = "";

function collectTarget(username, parameters) {
    //Logger.production(" 2 collectTarget function  in socialDownload");
    try {
        var url = "https://twitter.com/" + username;
        currUsername = username;
        domRequest(url, targetResponseHandler, parameters);
    } catch (e) {
        Logger.error("Exception thrown while collecting the target: " + e.message);
    }
}

function targetResponseHandler(response, parameters) {
    //Logger.production(" 3 targetResponseHandler function in socialDownload");
    try {
        var parser = new DOMParser();
        var html = parser.parseFromString(response, "text/html");
        var target = {
            itemType: "4", // Web-Entity
            type: "1", // Person
            activityType: "1" // Social Network
        };
        var heading = html.evaluate(".//h1", html, null, 9, null).singleNodeValue.textContent;
        if (heading === "Account suspended") {
            Logger.error("Account of user " + currUsername + "is suspended!");
        } else if (!html.evaluate(".//*[@class='ProfileNav']", html, null, 9, null).singleNodeValue) {
            Logger.error("Account of user " + currUsername + "not found!");
        } else {
            target.externalId = html.evaluate(profileXPaths.id, html, null, 9, null).singleNodeValue.getAttribute("data-user-id");
            target.title = html.evaluate(".//*[@class='ProfileHeaderCard']//h1/a", html, null, 9, null).singleNodeValue.textContent;
            target.body = html.evaluate(".//*[@class='ProfileHeaderCard']//h2/a/span", html, null, 9, null).singleNodeValue.textContent;
            target.url = "https://twitter.com/" + target.body;
            target.imageUrl = html.evaluate(".//*[@class='ProfileAvatar']//img", html, null, 9, null).singleNodeValue.getAttribute("src");
            if (html.evaluate(".//*[@class='ProfileHeaderCard']//p[contains(@class, '-bio')]", html, null, 9, null)) {
                target.description = html.evaluate(".//*[@class='ProfileHeaderCard']//p[contains(@class, '-bio')]", html, null, 9, null).singleNodeValue.textContent;
            }
            addImage(target);
            if (parameters.isTarget == "true") {
                var monitored = {};
                monitored.itemType = "18"; // Monitored
                monitored.parent_externalId = target.externalId;
                monitored.parentObjectType = "4"; // Web-Entity
                addEntity(monitored);
            } else {
                console.log("SOCIAL    " + JSON.stringify(target));
                Logger.debug("SOCIAL    " + JSON.stringify(target));
            }
        }
        // Target identifier for user Id
        addEntity({
            itemType: "16", // Identifier
            type: "5", // User ID
            parent_externalId: target.externalId,
            parentObjectType: "4",
            body: target.externalId
        });

    } catch (e) {
        Logger.error("Exception thrown while handling the collection of the target: " + e.message);
    }
    // Target Key-Values
    try {
        var keyValues = {};
        if (html.evaluate(profileXPaths.keyValTweet, html, null, 9, null).singleNodeValue) {
            keyValues.tweets = html.evaluate(profileXPaths.keyValTweet, html, null, 9, null).singleNodeValue.getAttribute('title');
        }
        if (html.evaluate(profileXPaths.keyValFollowing, html, null, 9, null).singleNodeValue) {
            keyValues.following = html.evaluate(profileXPaths.keyValFollowing, html, null, 9, null).singleNodeValue.getAttribute('title');
            re.keyValueFollowing = keyValues.following;
        }
        if (html.evaluate(profileXPaths.keyValFollowers, html, null, 9, null).singleNodeValue) {
            keyValues.followers = html.evaluate(profileXPaths.keyValFollowers, html, null, 9, null).singleNodeValue.getAttribute('title');
            re.keyValueFollowers = keyValues.followers;
        }
        // fix for tweets key value
        var keyTitle = '';
        for (var key in keyValues) {
            keyTitle = key + "_count";
            if (key.toUpperCase() == 'TWEETS') {
                keyTitle = 'statuses_count';
            }
            keyValues[key] = keyValues[key].replaceAll(",", ".");
            if (keyValues[key].indexOf("M") > -1) {
                keyValues[key] = parseFloat(keyValues[key].replaceAll("M", "")) * 1000000;
            } else if (keyValues[key].indexOf("K") > -1) {
                keyValues[key] = parseFloat(keyValues[key].replaceAll("K", "")) * 1000;
            }
            keyValues[key] = keyValues[key].toString().replaceAll(".", "");
            keyValues[key] = parseInt(keyValues[key]);
            addEntity({
                itemType: "24",
                parent_externalId: target.externalId,
                parentObjectType: "4", // Web Entity
                activityType: "1", // Integer
                title: key.toUpperCase(),
                body: keyValues[key],
                description: keyTitle
            });
            keepKeyValues[key] = keyValues[key];
        }
        keepKeyValues.targetId = target.externalId;
    } catch (e) {
        Logger.error("Exception thrown while collecting the target's key values: " + e.message);
    }
    // Target Location & Join Date & Profile Background Image
    try {

        if (html.evaluate(profileXPaths.joinedDate, html, null, 9, null).singleNodeValue) {
            var joinedDate = html.evaluate(profileXPaths.joinedDate, html, null, 9, null).singleNodeValue.textContent.replace("Joined", "");
            addEntity({
                itemType: "17", // Date
                type: "5", // Joined
                parent_externalId: target.externalId,
                parentObjectType: "4", // Web-Entity
                body: joinedDate
            });
        } else {
            Logger.production("Changed XPath :: joinDateOuter");
        }
        if (html.evaluate(profileXPaths.location, html, null, 9, null).singleNodeValue) {
            var location = html.evaluate(profileXPaths.location, html, null, 9, null).singleNodeValue.textContent;
            addEntity({
                itemType: "15", // Address
                type: "2",
                parent_externalId: target.externalId,
                parentObjectType: "4", // Web-Entity
                body: location,
                writer_externalId: target.externalId,
                gender: "P"
            });
        } else {
            Logger.production("Changed XPath :: locationOuter");
        }
        if (html.evaluate(profileXPaths.websiteOuter, html, null, 9, null).singleNodeValue) {
            var website = html.evaluate(profileXPaths.websiteOuter, html, null, 9, null).singleNodeValue.getAttribute("title");
            addEntity({
                itemType: "16", // Identifier
                type: "1", // Home-Page
                parent_externalId: target.externalId,
                parentObjectType: "4", // Web-Entity
                body: website
            });
        } else {
            Logger.production("Changed XPath :: websiteOuter or doensn't have websiteOuter");
        }
        if (html.evaluate(profileXPaths.backgroundImage, html, null, 9, null).singleNodeValue) {
            var targetBackgroundImage = {
                itemType: "5", // Image
                type: "3",
                parent_externalId: target.externalId,
                parentObjectType: "4", // Web Entity
                activityType: "1", // Social Network
                url: target.url,
                writer_externalId: target.externalId
            };
            var targetBackgroundImageUrl = html.evaluate(profileXPaths.backgroundImage, html, null, 9, null).singleNodeValue.getAttribute("src");
            if (targetBackgroundImageUrl) {
                targetBackgroundImage.externalId = target.externalId + "_" + targetBackgroundImageUrl.match(/(\w+)\/\w+$/)[1];
                targetBackgroundImage.imageUrl = targetBackgroundImageUrl;
                addImage(targetBackgroundImage);
            } else {
                console.log("No background image for this account. " + target.url);
                Logger.warning("No background image for this account. " + target.url);
            }
        } else {
            Logger.error("Changed XPath :: targetBackgroundImage");
        }
    } catch (e) {
        Logger.error("Exception thrown while handling the collection of the target's join date, profile background image and location: " + e.message);
    }
}

function searchAccounts(keyword = ie.keyword, collectAccountInfo = false) {
    try {
        // URL base
        searchPhrase = encodeURIComponent(keyword);
        // Since
        if (/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/.test(ie.since)) {
            searchPhrase += " since:" + ie.since;
        }
        // Until
        if (/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/.test(ie.until)) {
            searchPhrase += " until:" + ie.until;
        }
        var parameters = {
            keyword: keyword,
            collectAccountInfo: collectAccountInfo
        };
        var timeCounter = 0;
        searchAccountsInterval = setInterval(function() {
            if (searchAccountsNextPage) {
                timeCounter = 0;
                if (searchCollectedAccounts === 0) {
                    searchUrl = "https://twitter.com/search?f=users&q=" + searchPhrase;
                } else {
                    searchUrl = "https://twitter.com/search?f=users&q=" + searchPhrase + "&max_position=" + searchCursor;
                }
                Logger.debug("searchUrl: " + searchUrl);
                domRequest(searchUrl, searchAccountsResponseHandler, parameters);
            } else {
                timeCounter++;
                console.log("INFO. Waiting for accounts to be collected...\nCollected accounts till now: " + searchCollectedAccounts);
                if (timeCounter == 10) {
                    searchAccountsCollected = true;
                }
            }
            if (searchAccountsCollected) {
                Logger.production("Collected accounts: " + searchCollectedAccounts);
                clearInterval(searchAccountsInterval);
            }
        }, 1000);
    } catch (e) {
        Logger.error("Exception thrown while collecting accounts: " + e.message);
    }
}

function searchAccountsResponseHandler(response, parameters) {
    try {
        searchAccountsNextPage = false;
        var html = "";
        var parser = new DOMParser();
        if (response.indexOf("<!DOCTYPE html>") > -1) {
            html = parser.parseFromString(response, "text/html");
        } else {
            response = JSON.parse(response);
            html = parser.parseFromString(response.items_html, "text/html");
        }
        //set next page accounts
        if (html.evaluate(searchAccountXPaths.resultsContainer, html, null, 9, null).singleNodeValue !== null) {
            searchCursor = html.evaluate(searchAccountXPaths.resultsContainer, html, null, 9, null).singleNodeValue.getAttribute("data-min-position");
        }

        console.log(searchCursor);
        var accounts = html.evaluate(searchAccountXPaths.accountContainer, html, null, 5, null);
        var account = accounts.iterateNext();
        if (!account) {
            searchAccountsCollected = true;
            console.log("NO MORE RESULTS!")
        } else {
            while (account) {
                searchAccountCollect(html, account, parameters);
                searchCollectedAccounts++;
                account = accounts.iterateNext();
                if (searchCollectedAccounts >= searchMaxAccounts) {
                    searchAccountsCollected = true;
                    break;
                }
            }
        }
        searchAccountsNextPage = true;
    } catch (e) {
        Logger.error("Exception thrown while handling the accounts search: " + e.message);
    }
}

function searchAccountCollect(html, account, parameters) {
    try {
        var accountEntity = {
            itemType: "4", // Web-Entity
            type: "1", // Person
            activityType: "1" // Social Network
        };
        accountEntity.externalId = account.getAttribute("data-user-id");
        if (html.evaluate(searchAccountXPaths.accountTitle, account, null, 9, null).singleNodeValue !== null) {
            accountEntity.title = html.evaluate(searchAccountXPaths.accountTitle, account, null, 9, null).singleNodeValue.textContent.trim();
        }
        if (html.evaluate(searchAccountXPaths.accountBody, account, null, 9, null).singleNodeValue !== null) {
            accountEntity.body = html.evaluate(searchAccountXPaths.accountBody, account, null, 9, null).singleNodeValue.textContent.trim();
        }

        accountEntity.url = "https://twitter.com/" + accountEntity.body;
        if (html.evaluate(searchAccountXPaths.accountAvatar, account, null, 9, null).singleNodeValue !== null) {
            accountEntity.imageUrl = html.evaluate(searchAccountXPaths.accountAvatar, account, null, 9, null).singleNodeValue.getAttribute("src");
        }
        if (html.evaluate(searchAccountXPaths.accountDescription, account, null, 9, null).singleNodeValue !== null) {
            accountEntity.description = html.evaluate(searchAccountXPaths.accountDescription, account, null, 9, null).singleNodeValue.textContent.trim();
        }
        addImage(accountEntity);
        if (parameters.collectAccountInfo) {
            scheduledInfoPerAccoount += 1;
            //console.log(scheduledInfoPerAccoount);
            domRequestAsynch(accountEntity.url, searchAccountsInfoResponseHandler, accountEntity);
        }
    } catch (e) {
        Logger.error("Exception thrown while collecting search accounts: " + e.message);
    }
}

function searchAccountsInfoResponseHandler(response, accountEntity) {
    var parser = new DOMParser();
    var html = parser.parseFromString(response, "text/html");
    // Target Key-Values
    try {
        var keyValues = {};
        if (html.evaluate(profileXPaths.keyValTweet, html, null, 9, null).singleNodeValue) {
            keyValues.tweets = html.evaluate(profileXPaths.keyValTweet, html, null, 9, null).singleNodeValue.getAttribute('title');
        }
        if (html.evaluate(profileXPaths.keyValFollowing, html, null, 9, null).singleNodeValue) {
            keyValues.following = html.evaluate(profileXPaths.keyValFollowing, html, null, 9, null).singleNodeValue.getAttribute('title');
        }
        if (html.evaluate(profileXPaths.keyValFollowers, html, null, 9, null).singleNodeValue) {
            keyValues.followers = html.evaluate(profileXPaths.keyValFollowers, html, null, 9, null).singleNodeValue.getAttribute('title');
        }
        // fix for tweets key value
        var keyTitle = '';
        for (var key in keyValues) {
            keyTitle = key + "_count";
            if (key.toUpperCase() == 'TWEETS') {
                keyTitle = 'statuses_count';
            }

            keyValues[key] = keyValues[key].replaceAll(",", ".");
            if (keyValues[key].indexOf("M") > -1) {
                keyValues[key] = parseFloat(keyValues[key].replaceAll("M", "")) * 1000000;
            } else if (keyValues[key].indexOf("K") > -1) {
                keyValues[key] = parseFloat(keyValues[key].replaceAll("K", "")) * 1000;
            }
            keyValues[key] = keyValues[key].toString().replaceAll(".", "");
            keyValues[key] = parseInt(keyValues[key]);
            addEntity({
                itemType: "24",
                parent_externalId: accountEntity.externalId,
                parentObjectType: "4", // Web Entity
                activityType: "1", // Integer
                title: key.toUpperCase(),
                body: keyValues[key],
                description: keyTitle
            });
            //keepKeyValues[key] = keyValues[key];
        }
        //keepKeyValues.targetId = target.externalId;
    } catch (e) {
        Logger.error(e.message + " at line " + e.lineNumber);
    }
    // Target Location & Join Date & Profile Background Image
    try {
        if (html.evaluate(profileXPaths.joinedDate, html, null, 9, null).singleNodeValue) {
            var joinedDate = html.evaluate(profileXPaths.joinedDate, html, null, 9, null).singleNodeValue.textContent.replace("Joined", "");
            addEntity({
                itemType: "17", // Date
                type: "5", // Joined
                parent_externalId: accountEntity.externalId,
                parentObjectType: "4", // Web-Entity
                body: joinedDate
            });
        } else {
            Logger.debug("Changed XPath :: joinDateOuter");
        }
        if (html.evaluate(profileXPaths.location, html, null, 9, null).singleNodeValue) {
            var location = html.evaluate(profileXPaths.location, html, null, 9, null).singleNodeValue.textContent;
            addEntity({
                itemType: "15", // Address
                type: "2",
                parent_externalId: accountEntity.externalId,
                parentObjectType: "4", // Web-Entity
                body: location,
                writer_externalId: accountEntity.externalId,
                gender: "P"
            });
        } else {
            Logger.debug("Changed XPath :: locationOuter");
        }
        if (html.evaluate(profileXPaths.websiteOuter, html, null, 9, null).singleNodeValue) {
            var website = html.evaluate(profileXPaths.websiteOuter, html, null, 9, null).singleNodeValue.getAttribute("title");
            addEntity({
                itemType: "16", // Identifier
                type: "1", // Home-Page
                parent_externalId: accountEntity.externalId,
                parentObjectType: "4", // Web-Entity
                body: website
            });
        } else {
            Logger.debug("Changed XPath :: websiteOuter or doensn't have websiteOuter");
        }
        if (html.evaluate(profileXPaths.backgroundImage, html, null, 9, null).singleNodeValue) {
            var targetBackgroundImage = {
                itemType: "5", // Image
                type: "3",
                parent_externalId: accountEntity.externalId,
                parentObjectType: "4", // Web Entity
                activityType: "1", // Social Network
                url: accountEntity.url,
                writer_externalId: accountEntity.externalId
            };

            if (html.evaluate(profileXPaths.backgroundImage, html, null, 9, null).singleNodeValue !== null) {
                var targetBackgroundImageUrl = html.evaluate(profileXPaths.backgroundImage, html, null, 9, null).singleNodeValue.getAttribute("src");
            }

            if (targetBackgroundImageUrl) {
                targetBackgroundImage.externalId = accountEntity.externalId + "_" + targetBackgroundImageUrl.match(/(\w+)\/\w+$/)[1];
                targetBackgroundImage.imageUrl = targetBackgroundImageUrl;
                addImage(targetBackgroundImage);
            } else {
                console.log("No background image for this account. " + accountEntity.url);
            }
        } else {
            Logger.error("Changed XPath :: targetBackgroundImage");
        }
    } catch (e) {
        Logger.error("Exception thrown while handling collecting search accounts: " + e.message);
    }
    scheduledInfoPerAccoount -= 1;
    //Logger.production('There are ' + scheduledInfoPerAccoount + ' accounts left to be collected');
    //console.log(scheduledInfoPerAccoount);
}
/* ----------------------------------------------- */
/* ------------------ FOLLOWING ------------------ */
/* ----------------------------------------------- */
function collectFollowing(username, cursor) {
    try {
        if (cursor == undefined) {
            url = "https://twitter.com/" + username + "/following";
        } else {
            url = "https://twitter.com/" + username + "/following/users?include_available_features=1&include_entities=1&max_position=" + cursor;
        }
        var parameters = {
            targetUsername: username
        };
        //Logger.production("collectFollowing() url:: " + url);
        // Collect the first page
        domRequest(url, followingResponseHandler, parameters);
        // Collect the next pages
        var followingInterval = setInterval(function() {
            //Logger.production("collectFollowing() :: followingCollected " + followingCollected);
            if (!followingCollected) {
                if (loadMoreFollowing) {
                    loadMoreFollowing = false;
                    //Logger.production("collectFollowing() :: Collect next page of following " + url);
                    domRequest(url, followingResponseHandler, parameters);
                } else {
                    Logger.production("Waiting...");
                }
            } else {
                Logger.production("Finalizing...");
                Logger.production("Remaining followers/following to be collected: " + numberOfTimesAttemptedToAddImage);

                re.collectedFollowing = followingCollected;
                //Logger.production("collectFollowing() :: followingCollected - finalizing...");
                clearInterval(followingInterval);
                var counterAccounts = 0;
                //Check when all followers info is collected
                followingInterval = setInterval(function() {
                    Logger.production("inside followingInterval scheduledInfoPerAccoount: " + scheduledInfoPerAccoount);
                    if (scheduledInfoPerAccoount === 1) {
                        counterAccounts++;
                    }

                    //Logger.production(' I am Inside final interval of followings and waiting for ' + scheduledInfoPerAccoount +' sheduled accounts to be collected');
                    if (scheduledInfoPerAccoount === 0 || counterAccounts === 1) {
                        clearInterval(followingInterval);
                        Logger.production("finalizeScraping() 1907: ");
                        //finalizeScraping();
                        finalize();
                    }
                }, followersTimeout);
            }
        }, followersTimeout);
    } catch (e) {
        Logger.error(e.message + " at line " + e.lineNumber);
        executor.ready();
    }
}

function followingResponseHandler(response, parameters) {
    try {
        followingPagesCounter++;
        // Logger.production(' following :: Response here is ' + response);
        //Logger.production("followingResponseHandler() :: Start collecting following page " + followingPagesCounter);
        var html = "";
        var parser = new DOMParser();
        if (response.indexOf("<!DOCTYPE html>") > -1) {
            html = parser.parseFromString(response, "text/html");
            parameters.targetId = html.evaluate(profileXPaths.id, html, null, 9, null).singleNodeValue ? html.evaluate(profileXPaths.id, html, null, 9, null).singleNodeValue.getAttribute("data-user-id") : "";
            //Logger.production(parameters.targetId);
            if (!parameters.targetId) {
                Logger.production("Missing xpath: " + profileXPaths.id);
            }
        } else {
            response = JSON.parse(response);
            html = parser.parseFromString(response.items_html, "text/html");
            //Logger.production("followingResponseHandler() :: json response for page " + JSON.stringify(html));
        }
        var followings = html.evaluate(".//*[contains(@id,'stream-item-user-')]", html, null, 7, null);
        var followingCounter = 0;
        if (followingPagesCounter != 1 || re.placeholder4 > 0) {
            cursor = response.min_position;
            // hasMoreFollowing = false;
        }
        if (cursor !== undefined) {
            Logger.production('followingsResponseHandler() :: Following cursor before loading next page is  : ' + cursor);
        } else {
            Logger.production('followingsResponseHandler() :: Following cursor before loading next page is undefined');
        }
        Logger.production("followingResponseHandler() :: On this page we have " + followings.snapshotLength + " followings");
        for (var i = 0; i < followings.snapshotLength; i++) {
            var following = followings.snapshotItem(i);
            if (collectedFollowing >= maxFollowing) {
                hasMoreFollowing = false;
                //Logger.production("finalizeScraping() 1954: ");
                i = followings.snapshotLength;
                finalize();
                
            }
            followingCounter++;
            collectedFollowing++;

            var fUrl = html.evaluate(".//*[@class='u-linkComplex-target']", following, null, 9, null).singleNodeValue ? html.evaluate(".//*[@class='u-linkComplex-target']", following, null, 9, null).singleNodeValue.textContent : "";
            var fTitle = html.evaluate(".//*[contains(@class, 'ProfileNameTruncated-link')]", following, null, 9, null).singleNodeValue ? html.evaluate(".//*[contains(@class, 'ProfileNameTruncated-link')]", following, null, 9, null).singleNodeValue.textContent : "unknown";
            var fBody = html.evaluate(".//*[@class='u-linkComplex-target']", following, null, 9, null).singleNodeValue ? html.evaluate(".//*[@class='u-linkComplex-target']", following, null, 9, null).singleNodeValue.textContent : "";
            var fDescription = html.evaluate(".//*[contains(@class, 'ProfileCard-bio')]", following, null, 9, null).singleNodeValue ? html.evaluate(".//*[contains(@class, 'ProfileCard-bio')]", following, null, 9, null).singleNodeValue.textContent : "";

            // Following account
            var followingAccount = {};
            followingAccount.externalId = following.getAttribute("data-item-id");
            followingAccount.itemType = "4"; // Web-Entity
            followingAccount.type = "1"; // Person
            followingAccount.activityType = "1"; // Social Network
            followingAccount.url = "https://twitter.com/" + fUrl;
            followingAccount.title = fTitle;
            followingAccount.body = fBody;
            followingAccount.description = fDescription;
            
            Logger.production("Current follower is " + JSON.stringify(followingAccount));
            try {
                followingAccount.imageUrl = html.evaluate(".//*[contains(@class, 'ProfileCard-avatarImage')]", following, null, 9, null).singleNodeValue.getAttribute("src");
                addImage(followingAccount); // DOWNLOAD IMAGE
            } catch (e) {
                Logger.error(e.message + " at line " + e.lineNumber);
            }
            //collecting Following/Followers/Tweets counter and the account info as we collect for the actual target
            //we use searchAccountsInfoResponseHandler that is used in Twitter Advanced Search
            scheduledInfoPerAccoount += 1;
            domRequestAsynch(followingAccount.url, searchAccountsInfoResponseHandler, followingAccount);
            //Logger.production('There are ' + scheduledInfoPerAccoount + ' following accounts that should be collected');
            Logger.debug("followingResponseHandler() :: Following( " + collectedFollowing + " ) / maxFollowing( " + maxFollowing + " )" + JSON.stringify(followingAccount));
            // Following relation
            var followingRelation = {
                itemType: "12", // Relation
                type: "34", // Following
                parent_externalId: parameters.targetId,
                parentObjectType: "4", // Web-Entity
                sideB_externalId: followingAccount.externalId,
                sideB_ObjectType: "4" // Web-Entity
            };
            addEntity(followingRelation);
        }
        // LOAD NEXT PAGE
        if (collectedFollowing < maxFollowing) {
            // Cursor
            if (followingPagesCounter == 1) {
                cursor = html.evaluate(".//*[@data-min-position]", html, null, 9, null).singleNodeValue ? html.evaluate(".//*[@data-min-position]", html, null, 9, null).singleNodeValue.getAttribute("data-min-position") : 0;
                if (cursor === 0) {
                    //Logger.production(html);
                    Logger.production("Could not find xpath: " + ".//*[@data-min-position]");
                }
            } else {
                cursor = response.min_position;
            }
            if (cursor) {
                Logger.production('followingsResponseHandler() :: Following cursor in loading next page is  : ' + cursor);
            } else {
                Logger.production('followingsResponseHandler() :: Following cursor in loading next page is undefined');
            }
            // DOM Request
            if (cursor != 0) {
                url = "https://twitter.com/" + parameters.targetUsername + "/following/users?include_available_features=1&include_entities=1&max_position=" + cursor;
                loadMoreFollowing = true;
                Logger.production("collectFollowing() :: URL of next page will be " + url);
            } else {
                followingCollected = true;

            }
        } else {
            followingCollected = true;
        }
    } catch (e) {
        Logger.error(e.message + " at line " + e.lineNumber);
    }
}
/* ----------------------------------------------- */
/* ------------------ FOLLOWERS ------------------ */
/* ----------------------------------------------- */
function collectFollowers(username, cursor) {
    try {
        if (cursor == undefined) {
            url = "https://twitter.com/" + username + "/followers";
        } else {
            url = "https://twitter.com/" + username + "/followers/users?include_available_features=1&include_entities=1&max_position=" + cursor;
        }
        var parameters = {
            targetUsername: username
        };
        //Logger.production('collectFollowers() :: Followers url is  : ' + url);
        // Collect the first page
        domRequest(url, followersResponseHandler, parameters);
        // Collect the next pages
        var followersInterval = setInterval(function() {
            //Logger.production("collectFollowers() :: followersCollected " + followersCollected);
            if (!followersCollected) {
                if (loadMoreFollowers) {
                    loadMoreFollowers = false;
                    console.log(collectedFollowers + " :: " + url);
                    //Logger.production("collectFollowers() :: Collect next page of followers " + url);
                    domRequest(url, followersResponseHandler, parameters);
                } else {
                    console.log("Waiting...");
                }
            } else {
                console.log("Finalizing...");
                re.collectedFollowers = followersCollected;
                Logger.production("collectFollowers() :: followersCollected - finalizing...");
                clearInterval(followersInterval);
                //Check when all followers info is collected
                followersInterval = setInterval(function() {
                    //Logger.production(' I am Inside final interval of followers and waiting for ' + scheduledInfoPerAccoount +' sheduled accounts to be collected');
                    if (scheduledInfoPerAccoount === 0) {
                        clearInterval(followersInterval);
                        //Logger.production("finalizeScraping() 2068: ");
                        //finalizeScraping();
                        finalize();
                    }
                }, followersTimeout);
            }
        }, followersTimeout);
    } catch (e) {
        Logger.error("Exception thrown while collecting followers: " + e.message);
        executor.ready();
    }
}

function followersResponseHandler(response, parameters) {
    try {
        //Logger.production('followers :: Response here is ' + response);
        followersPagesCounter++;
        //Logger.production("followersResponseHandler() :: Start collecting page( " + followersPagesCounter + " ) of followers ");
        var html = "";
        var parser = new DOMParser();
        if (response.indexOf("<!DOCTYPE html>") > -1) {
            html = parser.parseFromString(response, "text/html");
            //Logger.production('Response here is html and it is ' + JSON.stringify(html));
            parameters.targetId = html.evaluate(profileXPaths.id, html, null, 9, null).singleNodeValue ? html.evaluate(profileXPaths.id, html, null, 9, null).singleNodeValue.getAttribute("data-user-id") : "";
            Logger.production(parameters.targetId);
            if (!parameters.targetId) {
                Logger.production("Could not find xpath: " + profileXPaths.id);
            }
            //Logger.production("followersResponseHandler() :: html response for page " + followersPagesCounter);
        } else {
            response = JSON.parse(response);
            html = parser.parseFromString(response.items_html, "text/html");
            //Logger.production('Response here is not html but json and it is ' + JSON.stringify(html));
            //Logger.production("followersResponseHandler() :: json response for page " + followersPagesCounter);
        }
       var followers = html.evaluate(".//*[contains(@id,'stream-item-user-')]", html, null, 7, null);
        //Logger.production("followersResponseHandler() ::  followers number is " + followers.snapshotLength);
        var followersCounter = 0;
        if (followersPagesCounter != 1 || re.placeholder4 > 0) {
            cursor = response.min_position;
        }
        if (cursor !== undefined) {
            Logger.production('followersResponseHandler() :: Followers cursor before loading next page is  : ' + cursor);
        } else {
            Logger.production('followersResponseHandler() :: Followers cursor before loading next page is undefined');
        }

        Logger.production("followersResponseHandler() :: On this page we have " + followers.snapshotLength + " followers");
        Logger.production("Followers response text");
        for (var i = 0; i < followers.snapshotLength; i++) {
            var follower = followers.snapshotItem(i);

            if (collectedFollowers >= maxFollowers) {
                hasMoreFollowers = false;
                //Logger.production("finalizeScraping() 2120: ");
                i = followers.snapshotLength;
                //finalizeScraping();
                finalize();
            }
            followersCounter++;
            collectedFollowers++;

            var faUrl = html.evaluate(".//*[@class='u-linkComplex-target']", follower, null, 9, null).singleNodeValue ? html.evaluate(".//*[@class='u-linkComplex-target']", follower, null, 9, null).singleNodeValue.textContent : "";
            var faTitle = html.evaluate(".//*[contains(@class, 'ProfileNameTruncated-link')]", follower, null, 9, null).singleNodeValue ? html.evaluate(".//*[contains(@class, 'ProfileNameTruncated-link')]", follower, null, 9, null).singleNodeValue.textContent : "unknown";
            var faBody = html.evaluate(".//*[@class='u-linkComplex-target']", follower, null, 9, null).singleNodeValue ? html.evaluate(".//*[@class='u-linkComplex-target']", follower, null, 9, null).singleNodeValue.textContent : "";
            var faDescription = html.evaluate(".//*[contains(@class, 'ProfileCard-bio')]", follower, null, 9, null).singleNodeValue ? html.evaluate(".//*[contains(@class, 'ProfileCard-bio')]", follower, null, 9, null).singleNodeValue.textContent : "";
            // Follower account
            var followerAccount = {};
            followerAccount.externalId = follower.getAttribute("data-item-id");
            followerAccount.itemType = "4"; // Web-Entity
            followerAccount.type = "1"; // Person
            followerAccount.activityType = "1"; // Social Network
            followerAccount.url = "https://twitter.com/" + faUrl;
            followerAccount.title = faTitle;
            followerAccount.body = faBody;
            followerAccount.description = faDescription;

            try {
                followerAccount.imageUrl = html.evaluate(".//*[contains(@class, 'ProfileCard-avatarImage')]", follower, null, 9, null).singleNodeValue.getAttribute("src");
                addImage(followerAccount); // DOWNLOAD IMAGE
            } catch (e) {
                Logger.error(e.message + " at line " + e.lineNumber);
            }
            Logger.production("Current follower is " + JSON.stringify(followerAccount));
            //collecting Following/Followers/Tweets counter and the account info as we collect for the actual target
            //we use searchAccountsInfoResponseHandler that is used in Twitter Advanced Search
            scheduledInfoPerAccoount += 1;
            domRequestAsynch(followerAccount.url, searchAccountsInfoResponseHandler, followerAccount);
            //Logger.production('There are ' + scheduledInfoPerAccoount + ' followers accounts that should be collected');
            Logger.debug("followersResponseHandler() :: Collect follower( " + collectedFollowers + " ) " + JSON.stringify(followerAccount));
            // Follower relation
            var followerRelation = {
                itemType: "12", // Relation
                type: "35", // Follower
                parent_externalId: parameters.targetId,
                parentObjectType: "4", // Web-Entity
                sideB_externalId: followerAccount.externalId,
                sideB_ObjectType: "4" // Web-Entity
            };
            addEntity(followerRelation);
        }
        // LOAD NEXT PAGE
        if (collectedFollowers < maxFollowers) {
            // Cursor
            if (followersPagesCounter == 1) {
                cursor = html.evaluate(".//*[@data-min-position]", html, null, 9, null).singleNodeValue ? html.evaluate(".//*[@data-min-position]", html, null, 9, null).singleNodeValue.getAttribute("data-min-position") : 0;
                if (cursor === 0) {
                    Logger.production("Could not find xpath: " + ".//*[@data-min-position]");
                }
            } else {
                cursor = response.min_position;
            }
            if (cursor) {
                Logger.production('followersResponseHandler() :: Followers cursor in loading next page is  : ' + cursor);
            } else {
                Logger.production('followersResponseHandler() :: Followers cursor in loading next page is undefined');
            }

            //Flags ( Next page / Finalize )
            if (cursor != 0) {
                url = "https://twitter.com/" + parameters.targetUsername + "/followers/users?include_available_features=1&include_entities=1&max_position=" + cursor;
                loadMoreFollowers = true;
                Logger.production("collectFollower() :: URL of next page will be " + url);
            } else {
                followersCollected = true;
            }
        } else {
            followersCollected = true;
        }
    } catch (e) {
        Logger.error("Exception thrown while handling the collection of followers:" + e.message);
    }
}
/* ---------------------------------------------- */
/* ----------- COLLECT SPECIFIC TWEET ----------- */
/* ---------------------------------------------- */
function collectSpecificTweet(url, booleanRetweeted) {
    try {
        var parameters = {};
        parameters.retweeted = !!booleanRetweeted;
        domRequest(url, collectSpecificTweetResponseHandler, parameters);
    } catch (e) {
        Logger.error("Exception thrown while collecting a specific tweet: " + e.message);
    }
}

function collectSpecificTweetReply(url) {
    try {
        var parameters = {
            tweetType: "3",
            retweeted: false,
            specificObject: true
        };
        domRequest(url, repliesResponseHandler, parameters);
    } catch (e) {
        Logger.error("Exception thrown while collecting the reply of a specific tweet: " + e.message);
    }
}

function collectSpecificTweetResponseHandler(response, parameters) {
    try {
        var html = "";
        var parser = new DOMParser();
        if (response.indexOf("<!DOCTYPE html>") > -1) {
            html = parser.parseFromString(response, "text/html");
        } else {
            response = JSON.parse(response);
            html = parser.parseFromString(response.items_html, "text/html");
        }
        var container = html.evaluate(".//*[contains(@class, 'tweet-container')]/div[contains(@class, 'permalink-tweet')]", html, null, 9, null).singleNodeValue;
        // collect the writer
        var parentWE = {};
        parentWE.externalId = container.getAttribute("data-user-id");
        parentWE.url = "https://twitter.com/" + container.getAttribute("data-screen-name");
        parentWE.body = container.getAttribute("data-screen-name");
        parentWE.title = container.getAttribute("data-name");
        parentWE.itemType = "4";
        parentWE.type = "1";
        parentWE.activityType = "1";
        parentWE.imageUrl = html.evaluate(".//*[contains(@class, 'header')]//img", container, null, 9, null).singleNodeValue.getAttribute("src");
        addImage(parentWE);
        //collect the tweet
        var tweet = {};
        tweet.externalId = container.getAttribute("data-tweet-id");
        tweet.activityType = "1";
        tweet.itemType = "2";
        tweet.body = html.evaluate(".//*[contains(@class, 'tweet-text-container')]/p", container, null, 9, null).singleNodeValue.textContent;
        tweet.url = "https://twitter.com" + container.getAttribute("data-permalink-path");
        tweet.writeDate = html.evaluate(".//*[contains(@class, 'tweet-details')]//span[@class='metadata']", container, null, 9, null).singleNodeValue.textContent.replace("- ", "").trim();
        tweet.writer_externalId = parentWE.externalId;
        tweet.parentObjectType = "4";
        tweet.parent_externalId = parentWE.externalId;
        addEntity(tweet);
        // Key values of the tweet
        var likesCount = html.evaluate(".//*[contains(@class, 'tweet-stats')]//a[contains(@class, 'request-favorited')]", container, null, 9, null).singleNodeValue;
        var likes = {};
        if (likesCount) {
            likes.itemType = "24";
            likes.parent_externalId = tweet.externalId;
            likes.parentObjectType = "2";
            likes.activityType = "1";
            likes.title = "LIKES";
            likes.body = likesCount.getAttribute("data-tweet-stat-count");
            likes.description = "likes_count";
        }
        addEntity(likes);
        var sharesCount = html.evaluate(".//*[contains(@class, 'tweet-details')]//a[contains(@class, 'request-retweeted')]", container, null, 9, null).singleNodeValue;
        var shares = {};
        if (sharesCount) {
            shares.itemType = "24";
            shares.parent_externalId = tweet.externalId;
            shares.parentObjectType = "2";
            shares.activityType = "1";
            shares.title = "SHARES";
            shares.body = sharesCount.getAttribute("data-tweet-stat-count");
            shares.description = "shares_count";
        }
        addEntity(shares);
        var retweetContainer = html.evaluate(".//*[contains(@class, 'QuoteTweet-innerContainer')]", container, null, 9, null).singleNodeValue;
        if (retweetContainer) {
            var retweetUrl = "https://twitter.com" + retweetContainer.getAttribute("href");
            // request to collect the tweet
            collectSpecificTweet(retweetUrl, true);
        }
        //if there is/are image/s
        var specificImage;
        var imageContainer = html.evaluate(".//*[contains(@class, 'AdaptiveMedia-photoContainer')]//img", container, null, 7, null);
        if (imageContainer.snapshotLength > 0) {
            for (var i = 0; i < imageContainer.snapshotLength; i++) {
               specificImage = imageContainer.snapshotItem(i);
                var image = {
                    externalId: specificImage.getAttribute("src").match(/media\/(.*?)\./)[1],
                    itemType: "5",
                    url: tweet.url,
                    activityType: "1",
                    imageUrl: specificImage.getAttribute("src"),
                    writer_externalId: parentWE.externalId,
                    parentObjectType: "2",
                    parent_externalId: tweet.externalId
                };
                addImage(image);
            }
        }
        //if there is/are video/s
        //if (html.evaluate(".//*[contains(@class, 'AdaptiveMedia-videoContainer')]", container, null, 9, null).singleNodeValue) {
        if (html.evaluate(".//*[contains(@class,'card-type-player')]", container, null, 9, null).singleNodeValue || html.evaluate(".//*[contains(@class, 'AdaptiveMedia-videoContainer')]", container, null, 9, null).singleNodeValue) {
            allVideoIds += tweetDetails.externalId + ';';
            // var videoContainer = document.evaluate(".//*[contains(@class, 'AdaptiveMedia-videoContainer')]//*[contains(@class, 'PlayableMedia')]//iframe", document, null, 9, null).singleNodeValue;
            // // make simple request to find the url of the video
            // var xhr = new XMLHttpRequest();
            // xhr.ajaxUrl = videoContainer.getAttribute("src");
            // xhr.open("GET", xhr.ajaxUrl, false);
            // xhr.send();
            // // parse the result
            // var videoHtml = "";
            // var parser = new DOMParser();
            // videoHtml = parser.parseFromString(xhr.responseText, "text/html");
            // // take the attribute that holds video-url
            // var videoUrl = videoHtml.evaluate(".//div[@id='playerContainer']", videoHtml, null, 9, null).singleNodeValue.getAttribute("data-config");
            // videoUrl = JSON.parse(videoUrl).video_url;
            // var video = {
            //  externalId: videoContainer.getAttribute("id"),
            //  itemType: "22",
            //  url: tweet.url,
            //  body: '<iframe src="' + videoContainer.getAttribute("src").split("?")[0] + '"/>',
            //  activityType: "1",
            //  imageUrl: videoUrl,
            //  writer_externalId: parentWE.externalId,
            //  parentObjectType: "2",
            //  parent_externalId: tweet.externalId
            // }
            // addImageScraping(video);
        }
        // set parameters to collect replies, likes
        parameters.targetUsername = parentWE.body;
        parameters.tweetId = tweet.externalId;
        parameters.favouritesCount = likes.body;
        //collect replies of the tweet
        if (!parameters.retweeted) {
            // invoke function to collect replies
            parameters.tweetType = 2;
            collectReplies(parameters);
        }
        //collect likes
        collectFavorites(parameters);
    } catch (e) {
       Logger.error("Exception thrown while handling the collection of a specific tweet: " + e.message);
    }
}
/* ------------------------------------------------ */
/* ----------- PERFORM SOCIAL DOWNLOAD ------------ */
/* ------------------------------------------------ */
function startSocialDownload(jsonWithAccounts, obj) {
    //Logger.production(" 1 SstartSocialDownload function in socialDownload");
    try {
        var allProfiles = JSON.parse(jsonWithAccounts);
        allProfiles = divide(allProfiles);
        Logger.production("Max profiles to download " + maxProfilesSocial + ". MaxTweets per account " + maxTweetsSocial);
        Logger.production("All profiles for social collection are " + JSON.stringify(allProfiles));
        if (allProfiles.length < maxProfilesSocial) {
            maxProfilesSocial = allProfiles.length;
        }
        var numberOfProfiles = maxProfilesSocial;
        //Collect Profiles of all authors
        for (var i = 0; i < maxProfilesSocial; i++) {
            Logger.production("allProfiles[" + i + "]" + JSON.stringify(allProfiles[i]));
            if (allProfiles[i]) {
                if (allProfiles[i]["profile"]["externalId"] != obj.targetId) {
                    //here it is going to be invoked flow -> Twitter_Enhanced_Target for every account in socialAccounts 
                    var jobId = "";
                    if (ie.jobId !== undefined) {
                        jobId = ie.jobId;
                    } else {
                        // This happens when this webflow is executed from FocalCollect.
                        executor.reportError("500", "WARNING", "The jobId is undefined, the jobId parameter to the REST service will be hardcoded in order to execute the flow.", false);
                        jobId = "100";
                    }
                    var xhr = new XMLHttpRequest();
                    xhr.open("POST", re.restApiUrl + "webflows/runWebflow", false);
                    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
                    xhr.onload = function() {
                        if (this.status != 200) {
                            // Status will be 500 in case there was an exception on the side of the REST service
                            // (f.e. the webflow we tried to invoke does not exist, the jobId parameter is missing, ...)
                            executor.reportError("500", "ERROR", "REST service returned status code " + this.status + ", check if the webflow the CA tried to invoke exists." + this.responseText, true);
                        }
                    };
                    xhr.onerror = function() {
                        executor.reportError("500", "ERROR", "There was an error, check the IP of the REST service in the CA (fb_merge_invoker_www).", true);
                    };
                    xhr.send(JSON.stringify({
                        webFlowName: "Twitter_Enhanced_Target",
                        jobId: jobId,
                        //useRootCRAgentPolicy: true,
                        parametersMap: {
                            url: allProfiles[i]["profile"]["url"],
                            username: ie.username,
                            password: ie.password,
                            tweets: true,
                            maxTweets: maxTweetsSocial
                        }
                    }));
                    //collectTarget(allProfiles[i]["profile"]["body"], obj);
                } else {
                    maxProfilesSocial++;
                    console.log("This is target");
                }
            }
        }
        //add all writers in the DB
        for (var j = maxProfilesSocial; j < allProfiles.length; j++) {
            allProfiles[j]["profile"]["authorProfileUrl"] = "social";
            addImage(allProfiles[j]["profile"]);
        }
        Logger.production("Finished with invoking flows for social download profiles.");


    } catch (e) {
        Logger.error("Exception thrown while starting the social download: " + e.message);
    }
}

// Merge sort for accounts
function divide(array) {
    var length = array.length;
    //If we have only one element in the array we assume it is sorted
    if (length < 2) {
        return array;
    }
    var middle = Math.floor(length / 2);
    var leftHalf = array.slice(0, middle);
    var rightHalf = array.slice(middle);
    return merge(divide(leftHalf), divide(rightHalf));
}

function merge(left, right) {
    var result = [];
    while (left.length && right.length) {
        left[0]["activities"] >= right[0]["activities"] ? result.push(left.shift()) : result.push(right.shift());
    }
    while (left.length) {
        result.push(left.shift());
    }
    while (right.length) {
        result.push(right.shift());
    }
    return result;
}
/* ---------------------------------------------- */
/* ------------------ FINALIZE ------------------ */
/* ---------------------------------------------- */
/*function addEntityScraping(entity) {
    try {
        executor.addEntity(entity);
        collectedRecords += 1;
        if (collectedRecords % 250 === 0) {
            executor.flushEntities();
        }
    } catch (e) {
        console.log("ERROR. addEntity() :: " + e + " at line " + e.lineNumber);
        Logger.error("addEntity() :: " + e + " at line " + e.lineNumber);
    }
}*/

/*function addImageScraping(entity) {
    //Logger.production('In addImageScraping function in Twitter scraping');
    try {
        addImageScrapingsInvoke++;
        if (entity.imageUrl) {
            if (entity.itemType == "4" && collectAvatars === false) {
                Logger.production("We're collecting entity of itemType 4 and collectAvatars is " + collectAvatars);
                addEntity(entity);
            } else {
                scheduledImagesScraping += 1;
                ++numberOfTimesAttemptedToAddImage;
                executor.saveBinary(entity.imageUrl, onSuccessScraping, onErrorScraping, entity);
                //Logger.production('Using save binary for that gif : ' + JSON.stringify(entity));
            }
        } else {

            Logger.production("The entity has imageURL that is undefined. The entity that doesn't have an image is: " + JSON.stringify(entity));
            addEntity(entity);
        }
        //Logger.debug("addImageScraping() :: addImageScrapingsInvoke " + addImageScrapingsInvoke);
    } catch (e) {
        console.log("ERROR. addImageScraping() :: " + e + " at line " + e.lineNumber);
        Logger.error("addImageScraping() :: " + e + " at line " + e.lineNumber);
    }
}*/

/*function onSuccessScraping(filePath, entity) {
    --numberOfTimesAttemptedToAddImage;
    try {
        successInvokes++;
        scheduledImagesScraping -= 1;
        entity.image = filePath;
        addEntity(entity);

        Logger.production("onSuccessScraping() :: downloaded image " + successInvokes + " from " + addImageScrapingsInvoke + " errors " + errorInvokes + " imageUrl " + entity.imageUrl);
        Logger.debug("onSuccessScraping() :: downloaded image " + successInvokes + " from " + addImageScrapingsInvoke + " errors " + errorInvokes + " imageUrl " + entity.imageUrl);
    } catch (e) {
        console.log("ERROR. onSuccessScraping() :: " + e + " at line " + e.lineNumber);
        Logger.error("onSuccessScraping() :: " + e + " at line " + e.lineNumber);
    }
}

function onErrorScraping() {
    Logger.production("Error while downloading image!");
    --numberOfTimesAttemptedToAddImage;
    try {
        errorInvokes++;
        scheduledImagesScraping -= 1;

        Logger.production("onErrorScraping() :: image was not downloaded. callbackInvokes " + errorInvokes + " from " + addImageScrapingsInvoke);
        Logger.error("onErrorScraping() :: image was not downloaded. callbackInvokes " + errorInvokes + " from " + addImageScrapingsInvoke);
    } catch (e) {
        console.log("ERROR. onErrorScraping() :: " + e + " at line " + e.lineNumber);
        Logger.error("onErrorScraping() :: " + e + " at line " + e.lineNumber);
    }
}*/

/*function finalizeScraping() {
    try {
        var finalizeInterval = setInterval(function() {
            Logger.production("finalizeScraping() :: scheduledImagesScraping " + scheduledImagesScraping);
            Logger.production("finalizeScraping() :: collectedNumberTweets " + collectedNumberTweets);
            if (scheduledImagesScraping === 0 && collectedNumberTweets === 0) {
                Logger.debug("finalizeScraping() :: requestNumber " + requestCounter);
                clearInterval(finalizeInterval);
                executor.ready();
            } else {
                console.log("INFO. Waiting for photos to be downloaded...");
            }
        }, 1000);
    } catch (e) {
        console.log("ERROR. finalizeScraping() :: " + e + " at line " + e.lineNumber);
        Logger.failure("finalizeScraping() :: " + e + " at line " + e.lineNumber);
    }
}*/

