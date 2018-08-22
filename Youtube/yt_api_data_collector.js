/***********************************/
/**
 * Last updated: 01/09/2015
 * Last changes added by: Valentin 23/2//2018
 *
 
 *
 * CHANGE LOG:
 * v002.000.010 - 24/10/2016 - Boyko Ivanov
 * - FIX: searchVideosResponseHandler() and searchChannelsResponseHandler() to log info in case 'response.items.length === 0'
 * - Some code clean up.
 *
 **/


// Initialization
//krasi e tuk
var apiKey = "AIzaSyCQTWXa4gxctxbsTvpH9FuhKi5WViAtQXM";

// Delta

//

// Async flagsco

//
var useSaveBinaryForVideos = false;
// Colleted data

var collectedEntities = [];
var collectedVideos = [];
var collectedChannels = [];
var scheduledImages = 0;
var collectedRecords = 0;
var wantedDate = "";
//var publishedAfter = getPublishedAfterDate(sinceDate);
var publishedAfter = "";
var sinceDate = "";

// FUNCTIONS

function setExecutor(exe, runtime, inputE) {
    executor = exe;
    ie = inputE;
    re = runtime;
    start();
    executor.reportError("200", "INFO", "runtime Entity 0" + JSON.stringify(re), false);
}

function start() {



    if (ie.sinceDate) {
        executor.reportError("200", "INFO", "CASE #1. Defined. - " + ie.sinceDate, false);
        wantedDate = new Date(ie.sinceDate).getTime();
        //var publishedAfter = getPublishedAfterDate(sinceDate);
        publishedAfter = ie.sinceDate;
        sinceDate = ie.sinceDate;
    } else //ie.cinseDate not defined. Use default - last year
    {
        var curr = new Date();
        var res = (curr.getFullYear() - 1) + '-' + (curr.getMonth() + 1) + "-" + curr.getDate() + "T22:00:00.000Z";
        wantedDate = new Date(res).getTime();
        //var publishedAfter = getPublishedAfterDate(sinceDate);
        publishedAfter = res;
        sinceDate = res;

        executor.reportError("200", "INFO", "CASE #2. Not Defined. Use default - " + res, false);
    }



}

function setTarget(id) {
    targetId = id;
}

targetCollected = false;

function setTargetCollected() {
    targetCollected = true;
}

var collectionRun = true;

// MonthsBack & WantedDate default values
//var monthsBack = 1;


// Set sinceDate
//function setSinceDate(psinceDate) {
//    sinceDate = psinceDate;
//}

// Set MonthsBack
//function setMonthsBack(months) {
//    monthsBack = months;
//    wantedDate = getWantedDate(monthsBack);
//    publishedAfter = getPublishedAfterDate(monthsBack);
//}

function errorListener() {
    // TODO
}

var ytOptions = "";

function setOptions(options) {
    try {
        ytOptions = options;
    } catch (e) {
        executor.reportError("500", "ERROR", "setOptions() : " + e + " at line " + e.lineNumber, false);
        executor.ready();
    }
}

function optionIsSet(option) {
    try {
        if (ytOptions.indexOf("-" + option) >= 0) {
            return false;
        } else {
            return true;
        }
    } catch (e) {
        executor.reportError("500", "ERROR", "optionIsSet() : " + e + " at line " + e.lineNumber, false);
        executor.ready();
    }
}

var targetRelation;

function setTargetRelation(relation) {
    targetRelation = relation;
}

/* DATE TO COLLECT FROM */

//function substrMonths(date, months) {
//    date.setMonth(date.getMonth() - months);
//    return date;
//}

//function formatTimestamp(timestamp) {
//    var formatedStamp = timestamp.toString();
//    formatedStamp = formatedStamp.substring(0, formatedStamp.length-3);
//    formatedStamp = parseInt(formatedStamp);
//    return formatedStamp;
//}

//function getWantedDate(months) {
//    var currentDate = new Date();
//    currentDate.setHours(0, 0, 0, 0);
//    wantedDate = substrMonths(currentDate, months);
//    wantedDate = wantedDate.getTime();
//    wantedDate = formatTimestamp(wantedDate);
//    return wantedDate;
//}

function getPublishedAfterDate(since) {
    //executor.reportError("200","INFO","since: " + since,false);
    var currentDate = new Date(since);
    //executor.reportError("200","INFO","currentDate: " + since,false);
    //currentDate.setHours(0, 0, 0, 0);
    //publishedAfter = substrMonths(currentDate, months);
    publishedAfter = ISODateString(currentDate);
    return publishedAfter
}

/* JavaScript date to RFC 3339 format */
function ISODateString(date) {
    function pad(n) {
        return n < 10 ? '0' + n : n
    }
    return date.getUTCFullYear() + '-' +
        pad(date.getUTCMonth() + 1) + '-' +
        pad(date.getUTCDate()) + 'T' +
        pad(date.getUTCHours()) + ':' +
        pad(date.getUTCMinutes()) + ':' +
        pad(date.getUTCSeconds()) + 'Z'
}

/* API REQUEST BY URL */

function youtubeApi(ajaxUrl, callback) {
    var xhr = new XMLHttpRequest();
    xhr.done = false;
    xhr.ajaxUrl = ajaxUrl;
    xhr.nextUrl = ajaxUrl;
    xhr.maxRequests = 1000; // # pages of videos/accounts. Each page has 5 videos/accounts.
    xhr.maxComments = 4; // # pages of comments. Each page has 50 comments.
    xhr.currentRequest = 1;
    xhr.requestFails = 0;
    while (!xhr.done) {
        xhr.open('GET', ajaxUrl, false);
        xhr.onload = apiResponseListener;
        xhr.onerror = errorListener;
        xhr.callback = callback;
        xhr.send(null);
    }
}

function apiResponseListener() {
    try {
        if (this.status === 200 && this.responseType === "") {
            this.requestFails = 0;
            var response = JSON.parse(this.responseText);
            this.callback(response);
            if (collectionRun == true) {

                // Paging for accounts and videos
                if (response.nextPageToken) {
                    if (this.currentRequest < this.maxRequests) {
                        this.nextUrl = this.ajaxUrl + "&pageToken=" + response.nextPageToken;
                        this.currentRequest += 1;
                    } else {
                        this.done = true;
                    }

                    // Paging for comments
                } else if (response.feed) {
                    if (response.feed.link[4]) {
                        if (response.feed.link[4].rel == "next") {
                            if (this.currentRequest < this.maxComments) {
                                this.nextUrl = response.feed.link[4].href;
                                this.currentRequest += 1;
                            } else {
                                this.done = true;
                            }
                        } else {
                            this.done = true;
                        }
                    } else {
                        this.done = true;
                    }

                } else {
                    this.done = true;
                }
            } else {
                this.done = true;
                collectionRun = true;
            }
        } else {

            if (this.requestFails > 100 || this.status === 404) {
                this.done = true;
                console.log("WARNING: HTTP reply status was " + this.status + "\nMessage: " + this.responseText + "\n Request: " + this.ajaxUrl);
                handleSpecial403DataApiError(this.responseText, this);
            } else {
                this.requestFails++;
            }
        }
    } catch (e) {
        console.log("ERROR. apiResponseListener() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "apiResponseListener() :: " + e + " at line " + e.lineNumber, false);
        this.done = true; // we can't go to the next URL when there was an exception
    }
}


function handleSpecial403DataApiError(responseText, xmlHttpObject) {
    var responseToJSON = JSON.parse(responseText);

    switch (decodeURIComponent(responseToJSON.error.errors[0].message).replace(/<\/?[a-z]+>/g, '')) {
        case "The requester is not allowed to access the requested subscriptions.":
            executor.reportError("101", "WARNING", "The user's subscriptions are private", false);
            break;
        case "Subscriptions could not be retrieved because the subscriber's account is suspended.":
            executor.reportError("101", "WARNING", "The user's account is suspended", false);
            break;
        case "The subscriber identified with the request cannot be found.":
            executor.reportError("101", "WARNING", "The user cannot be found. (Account might not be suspended)", false);
            break;
        case "Subscriptions could not be retrieved because the subscriber's account is closed.":
            executor.reportError("101", "WARNING", "The user's account is closed", false);
            break;
        case "The requested video chart is not supported or is not available.":
            executor.reportError("101", "WARNING", "The video chart is not supported or is not available", false);
            break;
        case "The request is not properly authorized to access video file or processing information. Note that the fileDetails, processingDetails, and suggestions parts are only available to that video's owner.":
            executor.reportError("101", "WARNING", "The user's video files are private", false);
            break;
        case "The request cannot access user rating information. This error may occur because the request is not properly authorized to use the myRating parameter.":
            executor.reportError("101", "WARNING", "You are not authorized to access the user's rating information", false);
            break;
        case "The video that you are trying to retrieve cannot be found. Check the value of the request's id parameter to ensure that it is correct.":
            executor.reportError("101", "WARNING", "The video cannot be found", false);
            break;
        case "The channel specified in the channelId parameter has been closed.":
            executor.reportError("101", "WARNING", "The channel has been closed", false);
            break;
        case "The channel specified in the channelId parameter has been suspended.":
            executor.reportError("101", "WARNING", "The channel has been suspended", false);
            break;
        case "The playlist identified with the request playlistId parameter does not support the request or the request is not properly authorized.":
            executor.reportError("101", "WARNING", "The user's playlist is private", false);
            break;
        case "The channel specified in the channelId parameter cannot be found.":
            executor.reportError("101", "WARNING", "The channel cannot be found", false);
            break;
        case "The playlist identified with the requests playlistId parameter cannot be found.":
            executor.reportError("101", "WARNING", "The playlist cannot be found", false);
            break;
        default:
            executor.reportError("101", "WARNING", "You shouldn't be here......", false);
            executor.reportError("101", "WARNING", "HTTP reply status was " + xmlHttpObject.status + "\nMessage: " + xmlHttpObject.responseText + "\n Request: " + xmlHttpObject.ajaxUrl, false);
            break;
    }
}

/* SCRAPING REQUEST BY URL */

function youtubeScraping(ajaxUrl, callback, accountId) {
    var xhr = new XMLHttpRequest();
    xhr.done = false;
    xhr.ajaxUrl = ajaxUrl;
    xhr.accountId = accountId;
    while (!xhr.done) {
        xhr.open('GET', xhr.ajaxUrl, false);
        xhr.onload = scrapingResponseListener;
        xhr.onerror = errorListener;
        xhr.callback = callback;
        xhr.send(null);
    }
}

function scrapingResponseListener() {
    try {
        if (this.status === 200 && this.readyState == 4) {
            var response = this.responseText;
            var accountId = this.accountId;
            this.callback(response, accountId);
            this.done = true;
        } else {
            console.log("Error: HTTP reply status was " + this.status + " : " + this.responseText);
            executor.reportError("500", "ERROR", "HTTP reply status was " + this.status + " : " + this.responseText, false);
            this.done = true;
        }
    } catch (e) {
        console.log("ERROR. scrapingResponseListener() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "scrapingResponseListener() :: " + e + " at line " + e.lineNumber, false);
        this.done = true; // we can't go to the next URL when there is an exception
    }
}

/* GENERATING LISTS OF LIKED AND UPLOADED VIDEOS */

function collectVideos(accountId = targetId) {
    try {
        var ajaxUrl = "https://www.googleapis.com/youtube/v3/channels?part=contentDetails&fields=items&id=" + accountId + "&key=" + apiKey;
        executor.reportError("777", "INFO", "ajaxUrl: " + ajaxUrl, false);
        youtubeApi(ajaxUrl, videosResponseHandler, 0);
    } catch (e) {
        console.log("ERROR. collectVideos() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "collectVideos() :: " + e + " at line " + e.lineNumber, false);
    }
}

function videosResponseHandler(response) {
    try {

        executor.reportError("777", "INFO", "response: " + JSON.stringify(response), false);
        if (response.items) {
            if (response.items[0].contentDetails) {
                if (response.items[0].contentDetails.relatedPlaylists) {

                    // UPLOADED VIDEOS
                    if (response.items[0].contentDetails.relatedPlaylists.uploads) {
                        uploadedVideos(response.items[0].contentDetails.relatedPlaylists.uploads);
                    }

                    // LIKED VIDEOS
                    if (response.items[0].contentDetails.relatedPlaylists.likes) {
                        likedVideos(response.items[0].contentDetails.relatedPlaylists.likes);
                    }

                }
            }
        }
    } catch (e) {
        console.log("ERROR. videosResponseHandler() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "videosResponseHandler() :: " + e + " at line " + e.lineNumber, false);
    }
}

/* UPLOADED VIDEOS */

function uploadedVideos(playlistId) {
    try {
        var ajaxUrl = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=" + playlistId + "&fields=items,nextPageToken&key=" + apiKey;
        executor.reportError("200", "Info", "ajaxUrl: " + ajaxUrl, false);
        youtubeApi(ajaxUrl, uploadedVideosResponseHandler);
    } catch (e) {
        console.log("ERROR. uploadedVideos() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "uploadedVideos() :: " + e + " at line " + e.lineNumber, false);
    }
}

function uploadedVideosResponseHandler(response) {
    try {
        if (response.items) {
            var videosList = "";
            for (var i = 0; i < response.items.length; i++) {
                var publishedAt = response.items[i].snippet.publishedAt;
                //var videoTimestamp = new Date(publishedAt).getTime();
                //videoTimestamp = formatTimestamp(videoTimestamp);
                var videoTimestamp = new Date(publishedAt).getTime();
                executor.reportError("200", "Info", "wantedDate: " + wantedDate + "---- videoDate: " + videoTimestamp + "---- ie.sinceDate: " + ie.sinceDate, false);
                if (videoTimestamp >= wantedDate) {
                    if (!videosList) {
                        videosList = response.items[i].snippet.resourceId.videoId;
                    } else {
                        videosList = videosList + "," + response.items[i].snippet.resourceId.videoId;
                    }
                } else {
                    collectionRun = false;
                }
            }

            if (videosList) {
                addEntity({
                    targetId: videosList,
                    keyword: 'video',
                    parentExternalId: targetId,
                    geoLocation: 'uploads',
                    url: 'https://www.youtube.com',
                    //monthsBack: monthsBack
                    monthsBack: sinceDate
                });
            }
        } else {
            collectionRun = false;
        }
    } catch (e) {
        console.log("ERROR. uploadedVideosResponseHandler() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "uploadedVideosResponseHandler() :: " + e + " at line " + e.lineNumber, false);
    }
}

/* LIKED VIDEOS */

function likedVideos(playlistId) {
    try {
        var ajaxUrl = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=" + playlistId + "&fields=items,nextPageToken&key=" + apiKey;
        youtubeApi(ajaxUrl, likedVideosResponseHandler);
    } catch (e) {
        console.log("ERROR. likedVideos() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "likedVideos() :: " + e + " at line " + e.lineNumber, false);
    }
}

function likedVideosResponseHandler(response) {

    executor.reportError("500", "ERROR", "Collecting liked videos....", false);
    try {
        if (response.items) {
            var videosList = "";
            for (var i = 0; i < response.items.length; i++) {
                var publishedAt = response.items[i].snippet.publishedAt;
                var videoTimestamp = new Date(publishedAt).getTime();
                //videoTimestamp = formatTimestamp(videoTimestamp);
                if (videoTimestamp >= wantedDate) {
                    if (!videosList) {
                        videosList = response.items[i].snippet.resourceId.videoId;
                    } else {
                        videosList = videosList + "," + response.items[i].snippet.resourceId.videoId;
                    }
                } else {
                    collectionRun = false;
                }
            }
            if (videosList) {
                addEntity({
                    targetId: videosList,
                    keyword: 'video',
                    parentExternalId: targetId,
                    geoLocation: 'likes',
                    url: 'https://www.youtube.com',
                    //monthsBack: monthsBack
                    monthsBack: sinceDate
                });
            }
        } else {
            collectionRun = false;
        }
    } catch (e) {
        console.log("ERROR. likedVideosResponseHandler() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "likedVideosResponseHandler() :: " + e + " at line " + e.lineNumber, false);
    }
}

/* SEARCH */

function searchVideos(keyword) {
    try {
        //var ajaxUrl = "https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=50&publishedAfter=" + ie.sinceDate + "&order=date&fields=nextPageToken,items/id/videoId&q=" + keyword + "&key=" + apiKey;
        var ajaxUrl = "https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=50&publishedAfter=" + sinceDate + "&order=date&fields=nextPageToken,items/id/videoId&q=" + keyword + "&key=" + apiKey;
        executor.reportError("500", "ERROR", "1-publishedAfterURL = " + ajaxUrl, false);
        youtubeApi(ajaxUrl, searchVideosResponseHandler);
    } catch (e) {
        console.log("ERROR. searchVideos() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "searchVideos() :: " + e + " at line " + e.lineNumber, false);
    }
}

function searchVideosResponseHandler(response) {
    try {
        if (response.items) {
            var videosList = "";
            for (var i = 0; i < response.items.length; i++) {
                if (videosList.split(",").length >= 50) {
                    addEntity({
                        targetId: videosList,
                        keyword: 'video',
                        url: 'https://www.youtube.com',
                        //monthsBack: monthsBack
                        monthsBack: sinceDate
                    });
                    videosList = "";
                }
                if (!(response.items[i].id.videoId in collectedVideos)) {
                    if (!videosList) {
                        videosList = response.items[i].id.videoId;
                    } else {
                        videosList = videosList + "," + response.items[i].id.videoId;
                    }
                    collectedVideos[response.items[i].id.videoId] = true;
                }
            }
            if (videosList) {
                addEntity({
                    targetId: videosList,
                    keyword: 'video',
                    url: 'https://www.youtube.com',
                    //monthsBack: monthsBack
                    monthsBack: sinceDate
                });
            } else {
                //executor.reportError("101", "WARNING", "No videos were found with the requested search criteria.", false);
                executor.reportError("101", "WARNING", "No videos published since" + ie.sinceDate + "were found, that correspond to the requested search criteria.", false);
            }
        }
    } catch (e) {
        console.log("ERROR. searchVideosResponseHandler() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "searchVideosResponseHandler() :: " + e + " at line " + e.lineNumber, false);
    }
}

function searchChannels(keyword) {
    try {
        //var ajaxUrl = "https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=50&publishedAfter=" + ie.sinceDate + "&order=date&fields=nextPageToken,items/id/channelId&q=" + keyword + "&key=" + apiKey;
        var ajaxUrl = "https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=50&publishedAfter=" + sinceDate + "&order=date&fields=nextPageToken,items/id/channelId&q=" + keyword + "&key=" + apiKey;
        //executor.reportError("507", "ERROR", "2- publishedAfterURL = " + ajaxUrl);
        youtubeApi(ajaxUrl, searchChannelsResponseHandler);
    } catch (e) {
        console.log("ERROR. searchChannels() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "searchChannels() :: " + e + " at line " + e.lineNumber, false);
    }
}

function searchChannelsResponseHandler(response) {
    try {
        if (response.items) {
            var channelsList = "";
            for (var i = 0; i < response.items.length; i++) {
                if (channelsList.split(",").length >= 10) {
                    addEntity({
                        targetId: channelsList,
                        keyword: 'channel',
                        url: 'https://www.youtube.com',
                        //monthsBack: monthsBack
                        monthsBack: sinceDate
                    });
                    channelsList = "";
                }
                if (!(response.items[i].id.channelId in collectedChannels)) {
                    if (!channelsList) {
                        channelsList = response.items[i].id.channelId;
                    } else {
                        channelsList = channelsList + "," + response.items[i].id.channelId;
                    }
                    collectedChannels[response.items[i].id.channelId] = true;
                }
            }
            if (channelsList) {
                addEntity({
                    targetId: channelsList,
                    keyword: 'channel',
                    url: 'https://www.youtube.com',
                    //monthsBack: monthsBack
                    monthsBack: sinceDate
                });
            } else {
                //executor.reportError("101", "WARNING", "No channeles were found with the requested search criteria.", false);
                executor.reportError("101", "WARNING", "No channeles published in the past " + "were found, that correspond to the requested search criteria.", false);
            }
        }
    } catch (e) {
        console.log("ERROR. searchChannelsResponseHandler() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "searchChannelsResponseHandler() :: " + e + " at line " + e.lineNumber, false);
    }
}

/* SUBSCRIPTIONS */

function collectSubscriptions(accountId = targetId) {
    try {
        var ajaxUrl = "https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&maxResults=10&channelId=" + accountId + "&key=" + apiKey;
        youtubeApi(ajaxUrl, subscriptionsResponseHandler);
    } catch (e) {
        console.log("ERROR. collectSubscriptions() :: " + e + " at line " + e.lineNumber);
        executor.reportError("177", "INFO", "collectSubscriptions() :: " + e + " at line " + e.lineNumber + ". This is a Mozilla Firefox Browser error.", false);
    }
}

function subscriptionsResponseHandler(response) {
    try {
        if (response.items) {
            var accountsList = "";
            for (var i = 0; i < response.items.length; i++) {

                // Create a list with the IDs of the accounts
                if (targetId !== response.items[i].snippet.resourceId.channelId) {
                    if (!accountsList) {
                        accountsList = response.items[i].snippet.resourceId.channelId;
                    } else {
                        accountsList = accountsList + "," + response.items[i].snippet.resourceId.channelId;
                    }
                }

            }

            // Add the accounts list
            if (accountsList) {
                addEntity({
                    targetId: accountsList,
                    keyword: 'account',
                    parentExternalId: targetId,
                    geoLocation: 'subscriptions',
                    url: 'https://www.youtube.com',
                    //monthsBack: monthsBack
                    monthsBack: sinceDate
                });
            }
        }
    } catch (e) {
        console.log("ERROR. subscriptionsResponseHandler() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "subscriptionsResponseHandler() :: " + e + " at line " + e.lineNumber, false);
    }
}

/* ACCOUNT */

function collectAccount(accountId = targetId) {
    try {
        if (!(accountId in collectedEntities)) {
            var ajaxUrl = "https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&fields=items&id=" + accountId + "&key=" + apiKey;
            youtubeApi(ajaxUrl, accountResponseHandler);
        }
    } catch (e) {
        console.log("ERROR. collectAccount() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "collectAccount() :: " + e + " at line " + e.lineNumber, false);
    }
}

function accountResponseHandler(response) {
    try {
        if (response.items) {
            for (var i = 0; i < response.items.length; i++) {

                // Normalize the date
                var publishedAt = response.items[i].snippet.publishedAt;
                var validDate = publishedAt.substring(0, publishedAt.length - 5);

                // Collect account
                var accountDetails = {
                    externalId: response.items[i].id,
                    itemType: "4", // WebEntity
                    type: "1", // Person
                    activityType: "1",
                    url: "http://www.youtube.com/channel/" + response.items[i].id,
                    title: response.items[i].snippet.title,
                    body: response.items[i].snippet.title,
                    description: response.items[i].snippet.description,
                    imageUrl: response.items[i].snippet.thumbnails.medium.url
                };
                addImage(accountDetails); //addEntity(accountDetails);
                var dateDetails = {
                    itemType: "17", // Date
                    type: "5", // Joined
                    activityType: "1", // Social Network
                    parent_externalId: response.items[i].id,
                    parentObjectType: "4", // WebEntity
                    body: validDate
                };
                addEntity(dateDetails);

                // Add relation for subscription
                if (targetRelation == "subscriptions") {
                    var subscriptionDetails = {
                        itemType: "12", // Relation
                        type: "34", // Following
                        parent_externalId: targetId,
                        parentObjectType: "4", // WebEntity -> Person
                        sideB_externalId: response.items[i].id,
                        sideB_ObjectType: "4" // WebEntity -> Person
                    };
                    addEntity(subscriptionDetails);
                };

                // Collect social links
                collectSocialLinks(response.items[i].id);

                // Collect for-target-only data
                if (targetId == response.items[i].id && !targetCollected) {
                    setTargetCollected();
                    // Collect featured channels
                    collectFeaturedChannels(response.items[i].id);
                }

                // Collecting the Google+ account
                if (response.items[i].contentDetails.googlePlusUserId) { // if (optionIsSet("extendedPersonalInfo") && response.items[i].contentDetails.googlePlusUserId) {
                    collectGooglePlus(response.items[i].contentDetails.googlePlusUserId);
                }

            }
        } else {

        }
    } catch (e) {
        console.log("ERROR. accountResponseHandler() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "accountResponseHandler() :: " + e + " at line " + e.lineNumber, false);
    }
}

/* DISCUSSION */

function collectDiscussion(accountId) {
    try {
        var ajaxUrl = "https://apis.google.com/u/0/wm/4/_/widget/render/comments?first_party_property=YOUTUBE&href=https%3A%2F%2Fwww.youtube.com%2Fchannel%2F" + accountId + "%2Fdiscussion&stream_id=" + accountId;
        youtubeScraping(ajaxUrl, socialResponseHandler, accountId);
    } catch (e) {
        console.log("ERROR. collectDiscussion() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "collectDiscussion() :: " + e + " at line " + e.lineNumber, false);
    }
}

function discussionResponseHandler(response, accountId) {
    try {
        var parser = new DOMParser();
        var htmlString = response;
        var html = parser.parseFromString(htmlString, "text/html");
        var discussionXpath = ".//div[@id='header-links']//*[contains(@class, 'channel-links-item')]/a";
        var discussionResult = html.evaluate(socialXpath, html, null, XPathResult.ANY_TYPE, null);
        var discussionLink = "";
        var discussionSpan = discussionResult.iterateNext();
        while (discussionSpan) {
            socialLink = socialSpan.getAttribute("href");
            socialSpan = socialResult.iterateNext()
            addEntity({
                itemType: "24", // KeyValue
                parent_externalId: accountId,
                parentObjectType: "4", // WebEntity -> Person
                activityType: "1", // SocialNetwork
                title: "SocialLink",
                body: socialLink,
                description: "SocialLink"
            });
        }
    } catch (e) {
        console.log("ERROR. discussionResponseHandler() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "discussionResponseHandler() :: " + e + " at line " + e.lineNumber, false);
    }
}

/* SOCIAL LINKS */

function collectSocialLinks(accountId) {
    try {
        var ajaxUrl = "https://www.youtube.com/channel/" + accountId + "/channels?view=60&flow=grid";
        youtubeScraping(ajaxUrl, socialResponseHandler, accountId);
    } catch (e) {
        console.log("ERROR. collectSocialLinks() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "collectSocialLinks() :: " + e + " at line " + e.lineNumber, false);
    }
}

function socialResponseHandler(response, accountId) {
    try {
        var parser = new DOMParser();
        var htmlString = response;
        var html = parser.parseFromString(htmlString, "text/html");
        var socialXpath = ".//div[@id='header-links']//*[contains(@class, 'channel-links-item')]/a";
        var socialResult = html.evaluate(socialXpath, html, null, XPathResult.ANY_TYPE, null);
        var socialLink = "";
        var socialSpan = socialResult.iterateNext();
        while (socialSpan) {
            socialLink = socialSpan.getAttribute("href");
            socialSpan = socialResult.iterateNext()
            addEntity({
                itemType: "24", // KeyValue
                parent_externalId: accountId,
                parentObjectType: "4", // WebEntity -> Person
                activityType: "1", // SocialNetwork
                title: "SocialLink",
                body: socialLink,
                description: "SocialLink"
            });
        }
    } catch (e) {
        console.log("ERROR. socialResponseHandler() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "socialResponseHandler() :: " + e + " at line " + e.lineNumber, false);
    }
}

/* FEATURED CHANNELS */

function collectFeaturedChannels(accountId) {
    try {
        var ajaxUrl = "https://www.youtube.com/channel/" + accountId + "/channels?view=60&flow=grid";
        youtubeScraping(ajaxUrl, featuredResponseHandler, accountId);
    } catch (e) {
        console.log("ERROR. collectFeaturedChannels() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "collectFeaturedChannels() :: " + e + " at line " + e.lineNumber, false);
    }
}

function featuredResponseHandler(response, accountId) {
    try {
        var parser = new DOMParser();
        var htmlString = response;
        var html = parser.parseFromString(htmlString, "text/html");
        var featuredXpath = ".//*[contains(@class, 'yt-lockup-thumbnail')]/a/span";
        var featuredResult = html.evaluate(featuredXpath, html, null, XPathResult.ANY_TYPE, null);
        var featuredId = "";
        var featuredSpan = featuredResult.iterateNext();
        while (featuredSpan) {
            featuredId = featuredSpan.getAttribute("data-ytid");
            featuredSpan = featuredResult.iterateNext()
            addEntity({
                itemType: "12", // Relation
                type: "1", // Friends
                parent_externalId: accountId,
                parentObjectType: "4", // WebEntity -> Person
                sideB_externalId: featuredId,
                sideB_ObjectType: "4" // WebEntity -> Person
            });
            collectAccount(featuredId);
        }
    } catch (e) {
        console.log("ERROR. featuredResponseHandler() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "featuredResponseHandler() :: " + e + " at line " + e.lineNumber, false);
    }
}

/* GOOGLE PLUS */

function collectGooglePlus(accountId) {
    try {
        if (!(accountId in collectedEntities)) {
            var ajaxUrl = "https://www.googleapis.com/plus/v1/people/" + accountId + "?key=" + apiKey;
            youtubeApi(ajaxUrl, plusResponseHandler);
        }
    } catch (e) {
        console.log("ERROR. collectGooglePlus() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "collectGooglePlus() :: " + e + " at line " + e.lineNumber, false);
    }
}

function plusResponseHandler(response) {
    try {
        if (response.id) {
            if (response.objectType == "person") {

                // Person
                if (response.gender) {
                    if (response.gender = "male") {
                        response.gender = "1"; // Male
                    } else if (response.gender = "female") {
                        response.gender = "2"; // Female
                    }
                }
                var accountDetails = {
                    externalId: response.id,
                    itemType: "4", // WebEntity
                    type: "1", // Person
                    activityType: "1", // SocailNetwork
                    url: response.url,
                    title: response.displayName,
                    body: response.displayName,
                    description: response.aboutMe,
                    imageUrl: response.image.url,
                    gender: response.gender
                };
                addImage(accountDetails); // addEntity(accountDetails);

                // Places
                if (response.placesLived) {
                    // TODO
                }

                // Organizations
                if (response.organizations) {
                    // TODO
                }

            } else if (response.objectType == "page") {

                // Page
                var accountDetails = {
                    externalId: response.id,
                    itemType: "4", // WebEntity
                    type: "7", // Page
                    activityType: "1", // SocailNetwork
                    url: response.url,
                    title: response.displayName,
                    body: response.displayName,
                    description: response.aboutMe,
                    imageUrl: response.image.url
                };
                addImage(accountDetails); // addEntity(accountDetails);

                // URLs
                if (response.urls) {
                    // TODO
                }

            }

        }
    } catch (e) {
        console.log("ERROR. plusResponseHandler() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "plusResponseHandler() :: " + e + " at line " + e.lineNumber, false);
    }
}

/* VIDEO */

function collectVideo(videoId = targetId) {
    try {
        executor.reportError("200", "INFO", "runtime Entity 1" + JSON.stringify(re), false);
        if (!(videoId in collectedEntities)) {
            var ajaxUrl = "https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&fields=items&id=" + videoId + "&key=" + apiKey;
            //executor.reportError("507", "ERROR", "3-collectVideo = " + ajaxUrl);
            youtubeApi(ajaxUrl, videoResponseHandler);
        }
    } catch (e) {
        console.log("ERROR. collectVideo() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "collectVideo() :: " + e + " at line " + e.lineNumber, false);
    }
}

function videoResponseHandler(response) {
    try {
        executor.reportError("200", "INFO", "response: " + JSON.stringify(response), false);

        executor.reportError("200", "INFO", "runtime Entity 2" + JSON.stringify(re), false);
        if (response.items) {
            var accountsList = "";

            var _keepFor = true;

            executor.reportError("200", "INFO", "Number of videos" + response.items.length, false);
            for (var i = 0; i < response.items.length; i++) {
                var unableSubtitles = false;
                if (_keepFor) {
                    var subs = "";
                    var countOfSubtitles = 0;
                    var inputParameter = "";
                    if (re.RTLanguages) {
                        inputParameter = re.RTLanguages.split('-')[0];
                    } else {
                        inputParameter = "en";
                    }

                    var haveConcreteSubtitles = false;
                    var haveEnglishSubtitles = false;
                    var videoId = response.items[i].id;
                    var asr = false;
                    var url = "https://www.googleapis.com/youtube/v3/captions?part=snippet&fields=items&maxResults=50&videoId=" + videoId + "&key=AIzaSyCQTWXa4gxctxbsTvpH9FuhKi5WViAtQXM";
                    var sReq = new XMLHttpRequest();
                    sReq.ajaxUrl = url;
                    sReq.open('GET', sReq.ajaxUrl, false);
                    sReq.send();
                    var json = JSON.parse(sReq.responseText);
                    if (json.items.length && inputParameter) {
                        for (var z = 0; z < json.items.length; z++) {
                            var currentSubs = json.items[z];
                            executor.reportError("200", "INFO", "subs" + currentSubs.snippet.language + " kink: " + currentSubs.snippet.trackKind, false);
                            if (currentSubs.snippet.trackKind === "standard" && currentSubs.snippet.language.split('-')[0].toString() == inputParameter) {
                                haveConcreteSubtitles = true;
                            }
                            if (currentSubs.snippet.trackKind === "standard" && currentSubs.snippet.language.split('-')[0].toString() === "en") {
                                haveEnglishSubtitles = true;
                            }
                        }
                        if (haveConcreteSubtitles) {
                            var oReq2 = new XMLHttpRequest();
                            oReq2.ajaxUrl = "https://www.youtube.com/api/timedtext?fmt=vtt&v=" + videoId + "&lang=" + inputParameter;
                            oReq2.open('GET', oReq2.ajaxUrl, false);
                            oReq2.send();
                            if (oReq2.status === 200) {
                                if (oReq2.responseText) {
                                    subs = oReq2.responseText;
                                    //executor.reportError("200", "INFO", "subtitles: " + oReq2.responseText, false);
                                } else {
                                    console.log("Xpath is Changed in youtubeApi_0002.000.011.js");
                                }
                            } else {
                                console.log("status: " + oReq2.status);
                            }
                        } else if (haveEnglishSubtitles) {
                            var oReqEN = new XMLHttpRequest();
                            oReqEN.ajaxUrl = "https://www.youtube.com/api/timedtext?fmt=vtt&v=" + videoId + "&lang=en";
                            oReqEN.open('GET', oReqEN.ajaxUrl, false);
                            oReqEN.send();
                            if (oReqEN.status === 200) {
                                if (oReqEN.responseText) {
                                    subs = oReqEN.responseText;
                                    //executor.reportError("200", "INFO", "subtitles: " + oReq2.responseText, false);
                                } else {
                                    console.log("Xpath is Changed in youtubeApi_0002.000.011.js");
                                }
                            } else {
                                console.log("status: " + oReqEN.status);
                            }

                        } else {
                            if (json.items[0].snippet.language === "en") {
                                var oReq = new XMLHttpRequest();
                                oReq.ajaxUrl = "http://diycaptions.com/php/get-automatic-captions-as-txt.php?id=" + videoId + "&language=asr";
                                oReq.open('GET', oReq.ajaxUrl, false);
                                oReq.send();
                                if (oReq.status === 200) {
                                    var parser = new DOMParser();
                                    var html = parser.parseFromString(oReq.responseText, "text/html");
                                    var subtitle = html.evaluate(".//div[contains(@class, 'well')]", html, null, 9, null).singleNodeValue;
                                    if (subtitle) {
                                        if (subtitle.textContent.indexOf('Unable to obtain automatic captions for the video specified.')) {
                                            unableSubtitles = true;
                                        }else{
                                            subs = subtitle.textContent;
                                        }
                                        
                                        //executor.reportError("200", "INFO", "subtitles: " + subtitle.textContent, false);

                                    } else {
                                        console.log("Xpath is Changed in youtubeApi_0002.000.011.js");
                                    }
                                } else {
                                    console.log("status: " + oReq.status);
                                }
                            }
                        }
                    }
                    executor.reportError("200", "INFO", "countOfSubtitles: " + countOfSubtitles + "videoId = " + response.items[i].id, false);

                    var videoNumber = i + 1;
                    console.log("COLLECTING VIDEO #" + videoNumber + " / " + response.items.length);

                    if (response.items[i].statistics) {
                        if (response.items[i].statistics.likeCount) {

                            executor.reportError("200", "INFO", "Number of likes" + response.items[i].statistics.likeCount, false);
                            var likesKeyValue = {};
                            likesKeyValue.itemType = 24;
                            likesKeyValue.parent_externalId = response.items[i].id;
                            likesKeyValue.parentObjectType = 22;
                            likesKeyValue.activityType = 2;
                            likesKeyValue.title = "LIKES";
                            likesKeyValue.description = "likes_count";
                            likesKeyValue.body = response.items[i].statistics.likeCount;

                            addEntity(likesKeyValue);
                        }

                        if (response.items[i].statistics.commentCount) {
                            executor.reportError("200", "INFO", "Number of comments" + response.items[i].statistics.commentCount, false);
                            var commentsKeyValue = {};
                            commentsKeyValue.itemType = 24;
                            commentsKeyValue.parent_externalId = response.items[i].id;
                            commentsKeyValue.parentObjectType = 22;
                            commentsKeyValue.activityType = 2;
                            commentsKeyValue.title = "COMMENTS";
                            commentsKeyValue.description = "comments_count";
                            commentsKeyValue.body = response.items[i].statistics.commentCount;

                            addEntity(commentsKeyValue);
                        }
                    }


                    var description = "";

                    // Normalize the date
                    var publishedAt = response.items[i].snippet.publishedAt;
                    var validDate = publishedAt.substring(0, publishedAt.length - 5);


                    var currDate = validDate.split('T')[0]

                    if (currDate < sinceDate) //CHANGE HERE VAL
                    {
                        _keepFor = false;
                        executor.reportError("200", "INFO", "sinceDate is > currDate", false);
                    }


                    //executor.reportError("123", "ERROR", "currDate = " + currDate + " / sinceDate = " + sinceDate + ' _keepFor = ' + _keepFor, false);

                    if (response.items[i].snippet.description) {
                        videoBody = response.items[i].snippet.description;
                    } else {
                        videoBody = response.items[i].snippet.title;
                    }

                    var videoDetails = {
                        externalId: response.items[i].id,
                        itemType: "22",
                        parent_externalId: response.items[i].snippet.channelId,
                        parentObjectType: "4", // WebEntity -> Person
                        activityType: "1", // SocialNetwork
                        url: "http://www.youtube.com/watch?v=" + response.items[i].id,
                        title: response.items[i].snippet.title,
                        //body: subs,
                        body: "<iframe width='560' height='315' src='//www.youtube.com/embed/" + response.items[i].id + "' frameborder='0' allowfullscreen></iframe>",
                        description: response.items[i].snippet.description,
                        writeDate: validDate,
                        writer_externalId: response.items[i].snippet.channelId,
                        //imageUrl: "http://www.youtube.com/watch?v=" + response.items[i].id,
                        image: response.items[i].snippet.thumbnails.high.url
                    };
                    if (!unableSubtitles) {
                        videoDetails.subtitle = subs;
                    }
                    addImage(videoDetails);
                    //var interval = setInterval(function() {
                    //    if (finish) {
                    //        
                    //        clearInterval(interval);
                    //    }
                    //}, 500);
                    //addEntity(videoDetails);

                    // Create a list with the IDs of the accounts
                    if (targetId !== response.items[i].snippet.channelId) {
                        if (i == 0) {
                            accountsList = response.items[i].snippet.channelId;
                        } else {
                            accountsList = accountsList + "," + response.items[i].snippet.channelId;
                        }
                    }

                    // Create a relation for like
                    if (targetRelation == 'likes') {
                        var likeDetails = {
                            externalId: targetId + "_" + response.items[i].id,
                            itemType: "3", // Comment
                            type: "2", // Like
                            parent_externalId: response.items[i].id,
                            parentObjectType: "22", // Video
                            activityType: "1", // SocialNetwork
                            url: "https://www.youtube.com/watch?v=" + response.items[i].id,
                            writeDate: validDate,
                            writer_externalId: response.items[i].snippet.channelId
                        };
                        addEntity(likeDetails);
                    }

                    // Collect comments for the video
                    collectComments(response.items[i].id);


                }
                // Collect the accounts from the list
                if (accountsList) {
                    collectAccount(accountsList);
                }
            }

        } else {
            executor.reportError("200", "INFO", "Items array in response object missing....", false);
        }
    } catch (e) {
        console.log("ERROR. videoResponseHandler() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "videoResponseHandler() :: " + e + " at line " + e.lineNumber, false);
    }
}

//function collectSubtitles(videoId) {
//    var oReq = new XMLHttpRequest();
//    oReq.addEventListener("load", function() {
//        var parser = new DOMParser();
//        var html = parser.parseFromString(this.responseText, "text/html");
//        var subtitle = html.evaluate(".//div[contains(@class, 'well')]", html, null, 9, null).singleNodeValue;
//        if (subtitle) {
//            subs = subtitle.textContent;
//        } else {
//            Logger.production("Xpath is Changed in youtubeApi_0002.000.011.js");
//        }
//
//    });
//    oReq.open("GET", "http://diycaptions.com/php/get-automatic-captions-as-txt.php?id=" + videoId + "&language=asr");
//    oReq.send();
//}

/* COMMENTS */

function collectComments(videoId) {
    try {
        var ajaxUrl = "https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&fields=items&maxResults=50&videoId=" + videoId + "&key=" + apiKey;
        executor.reportError("101", "ERROR", "ajaxUrl = " + ajaxUrl, false);
        youtubeApi(ajaxUrl, commentsResponseHandler);
    } catch (e) {
        console.log("ERROR. collectComments() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "collectComments() :: " + e + " at line " + e.lineNumber, false);
    }
}

function commentsResponseHandler(response) {
    try {
        if (response.items.length) {

            executor.reportError("234", "INFO",JSON.stringify(response), false);

            var accountsList = "";

            var _keepCollectingComments = true;

            for (var i = 0; i < response.items.length; i++) {
                if (_keepCollectingComments) {
                    if (response.items[i].snippet.topLevelComment.snippet.authorChannelId) {

                        // Initializing the IDs
                        var commentId = response.items[i].id;
                        var videoId = response.items[i].snippet.videoId;

                        // Normalize the date
                        var publishedAt = response.items[i].snippet.topLevelComment.snippet.publishedAt;
                        var validDate = publishedAt.substring(0, publishedAt.length - 5);

                        var currCommentDate = validDate.split('T')[0]

                        if (currCommentDate < sinceDate) //CHANGE HERE VAL
                        {
                            _keepCollectingComments = false;
                        }



                        //executor.reportError("124", "ERROR", "currCommentDate = " + currCommentDate + " / sinceDate = " + sinceDate + ' _ke_keepCollectingCommentsepFor = ' + _keepCollectingComments, false);


                        // Create an entity object
                        var commentDetails = {
                            externalId: commentId,
                            itemType: "3", // Comment //VAL
                            type: "1", // Comment
                            parent_externalId: videoId,
                            parentObjectType: "22", // Video
                            activityType: "1", // SocialNetwork
                            url: "https://www.youtube.com/watch?v=" + videoId + "&google_comment_id=" + commentId,
                            body: response.items[i].snippet.topLevelComment.snippet.textOriginal,
                            writeDate: validDate,
                            writer_externalId: response.items[i].snippet.topLevelComment.snippet.authorChannelId.value,
                            authorProfileUrl: response.items[i].snippet.topLevelComment.snippet.authorChannelUrl
                        };


                        addEntity(commentDetails);
                        executor.reportError("125", "ERROR", "writeDate = " + commentDetails.writeDate + ' _ke_keepCollectingCommentsepFor = ' + _keepCollectingComments, false);


                        // ----------- add number of likes to comment --------------------- VALENTIN Aug 6 2018
                        
                        addEntity({
                            itemType: "24", // KeyValue
                            parent_externalId: commentDetails.commentId,
                            parentObjectType: "4", // WebEntity -> Person
                            activityType: "1", // cnt
                            title: "LIKES",
                            body: response.items[i].snippet.topLevelComment.snippet.likeCount,
                            description: "likes_count"
                        });


                        //----------------------------------------------------------------------------------------------------


                        // Create a list with the IDs of the accounts
                        if (targetId !== response.items[i].snippet.topLevelComment.snippet.authorChannelId.value) {
                            if (!accountsList) {
                                accountsList = response.items[i].snippet.topLevelComment.snippet.authorChannelId.value;
                            } else {
                                accountsList = accountsList + "," + response.items[i].snippet.topLevelComment.snippet.authorChannelId.value;
                            }
                        }

                    }
                }
            }

            // Collect the accounts from the list
            if (accountsList) {
                collectAccount(accountsList);
            }

        }
    } catch (e) {
        console.log("ERROR. commentsResponseHandler() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "commentsResponseHandler() :: " + e + " at line " + e.lineNumber, false);
    }
}

//////////////////////////////////////

function addEntity(entity) {
    try {

        executor.addEntity(entity);
        collectedRecords += 1;

        if (collectedRecords % 250 === 0) {
            executor.flushEntities();
        }

    } catch (e) {
        console.log("ERROR. addEntity() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "addEntity() :: " + e + " at line " + e.lineNumber, false);
    }
}

/*function addImage(entity) {
    try {
       
        if (entity.itemType == "22" && entity.image) {
            scheduledImages += 1;
            executor.saveBinary(entity.image, onSuccess, onError, entity);
        } else if (entity.imageUrl) {
            scheduledImages += 1;
            executor.saveBinary(entity.imageUrl, onSuccess, onError, entity);
        } else {
            addEntity(entity);
        }

    } catch (e) {
        console.log("ERROR. addImage() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "addImage() :: " + e + " at line " + e.lineNumber, false);
    }
}*/

function addImage(entity) {
    try {
        if (ie.downloadVideoFiles == "false") {
            if (entity.itemType == "22") {
                addEntity(entity);
            }
            
        } else {
            if (ie.downloadVideoFiles != "false" && entity.itemType == "22" && !useSaveBinaryForVideos) {
                executor.reportError("200", "INFO", "using DownloadVideo", false);
                executor.downloadVideo(
                    executor.createVideoDownloadRequest(entity.url, "image", entity)
                );
            }
        }
        if (entity.imageUrl && entity.itemType == "5") {
            executor.reportError("200", "INFO", "using saveBinary for Image", false);
            scheduledImages += 1;
            executor.saveBinary(entity.imageUrl, onSuccess, onError, entity);
        } else if(entity.itemType == "5" || entity.itemType == "4") {
            addEntity(entity);
        }

    } catch (e) {
        console.log("ERROR. addImage() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "addImage() :: " + e + " at line " + e.lineNumber, false);
    }
}

function onSuccess(filePath, entity) {
    try {
        scheduledImages -= 1;
        entity.image = filePath;
        addEntity(entity);
    } catch (e) {
        console.log("ERROR. onSuccess() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "onSuccess() :: " + e + " at line " + e.lineNumber, false);
    }
}

function onError() {
    try {
        scheduledImages -= 1;
    } catch (e) {
        console.log("ERROR. onError() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "onError() :: " + e + " at line " + e.lineNumber, false);
    }
}

function finalize() {
    try {

        var finalizeInterval = setInterval(function() {

            if (scheduledImages === 0) {
                clearInterval(finalizeInterval);
                executor.ready();
            } else {
                console.log("INFO. Waiting for photos to be downloaded...");
            }

        }, 1000);

    } catch (e) {
        console.log("ERROR. finalize() :: " + e + " at line " + e.lineNumber);
        executor.reportError("500", "ERROR", "finalize() :: " + e + " at line " + e.lineNumber, false);
        executor.ready();
    }
}

/* IMAGES */

/*
function log(message) {
    console.log(message);
}

function ready() {
    executor.ready();
}

images = new Array();

function addImage(image) {
    try {
        images[image.externalId] = image;
    } catch (e) {
        addEntity({
            description: "addImage() : " + e.message
        });
        ready();
    }
}

var itemCount = 0;

function writeImageErrors() {
    try {
        for (var id in images) {
            if ((images[id].image === undefined) && (images[id].imageUrl !== undefined)) {
                addEntity({
                    description: "Error while trying to download the image with URL " + images[id].imageUrl
                });
                log("Error while trying to download the image with URL " + images[id].imageUrl);
                addEntity(images[id]);
            }
        }
        ready();
    } catch (e) {
        addEntity({description: "writeImageErrors() : " + e.message});
        ready();
    }
}

function onSuccess(filePath, data) {
    try {
        data.image = filePath;
        addEntity(data);
        itemCount--;
        if (itemCount === 0) {
            writeImageErrors();
        }
    } catch (e) {
        addEntity({
            description: e.message
        });
        ready();
    }
}

function onError() {
    itemCount--;
    if (itemCount === 0) {
        writeImageErrors();
    }
}

function finalize() {
    itemCount = Object.keys(images).length;
    for (var id in images) {
        if (images[id].itemType == "22") {
            var imageUrl = images[id].image;
            images[id].image = "";
            executor.saveBinary(imageUrl, onSuccess, onError, images[id]);
        } else {
            executor.saveBinary(images[id].imageUrl, onSuccess, onError, images[id]);
        }
    }
    if (itemCount === 0) {
        writeImageErrors();
    }
}

*/