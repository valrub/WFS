function main(re, ie, oe, executor) {
    //=====================================================================
    //Initialize Global Settings
    setGlobalLogger(re, ie, oe, executor, 4);
    //=====================================================================
    // GLOBAL VARIABLES

    var targetId = ie.targetId;
    var collectionToken, cursor, url, pagelet_token;
    var maxFriends = 5000; // The number should be multiple of 20
    var maxSocial = 50; // The amount of friends that would be collected as part of the Social Collection
    var maxPages;
    var currentPage = 1;
    var friend = {};
    var relation = {};
    var currentLevel = 1;
    var bulkOfFriends = 10; // Amount of friends that will be send to one fb_person_about_info
    var friendsInfo = /\+friendsInfo/.test(ie.flagOptions);
    var amountOfFriends = /friendsInfoLimitation=([0-9]+)/.test(ie.flagOptions) ? parseInt(ie.flagOptions.match(/friendsInfoLimitation=([0-9]+)/)[1], 10) : 20;
    var counter = 0; // How many friends had been collected
    var friendsList = []; // Holds Ids of freands to be sent to fb_person_full_info


    var maxFriendsFirstLvl = 5000; // The number has to be multiple of 20
    var maxFriendsSecondLvl = 500; // The number has to be multiple of 20

    if (re.placeholder4 == "true") {
                    //currentLevel = 2;
                    //TBD new way of defining second level. The input parameter will alway be true
                    currentLevel = 1;
    }

    // Async flags

    //

    // Colleted data

    var collectedAccounts = [];
    var collectedPages = [];
    var scheduledImages = 0;
    var collectedRecords = 0;
    var listOfFriends = "";
    var cycles = 0;
    var timeOut = 20000;
    // START


    try {
                    var scrollDown = new Promise((resolve, reject) => {
                                    var finishScroll = false;

                                    var numberOfFriends = 0;
                                    var timesCountIsEqual = 0;
                                    var intervalScroll = setInterval(() => {
                                                    cycles++;
                                                    var friends = document.evaluate(".//*[contains(@data-referrer,'medley_friends')]//div[contains(@data-referrer,'pagelet_timeline')]/ul/li", document, null, 7, null);
                                                    var element = document.evaluate(".//*[contains(@aria-labelledby,'medley_header_photos')]", document, null, 9, null).singleNodeValue
                                                    if (element == null) {
                                                                    console.log(numberOfFriends + " --> " + friends.snapshotLength);
                                                                    window.scrollTo(0, document.body.scrollHeight);
                                                                    saveFriends(friends, cycles);
                                                                    
                                                                    if (numberOfFriends === friends.snapshotLength) {
                                                                                    timesCountIsEqual++;
                                                                    } else {
                                                                                    numberOfFriends = friends.snapshotLength;
                                                                                    timesCountIsEqual = 0;
                                                                    }
                                                    } else {
                                                                    clearInterval(intervalScroll);
                                                                    resolve();
                                                    }
                                    }, 2000);


                    });
                    scrollDown.then(finalize).catch(console.log);

    } catch (e) {
                    Logger.error("fb_person_friends_collector_www: " + e.message, "9005");
                    finalize();
    }

    function saveFriends(friends, cycles) {


                    //return new Promise((resolve, reject) => {
                    try {

                                    //Removed && Object.keys(collectedAccounts).length === 0 from the if statement. Might want to add it later. Looks important, but at this point, it does nothing.
                                    if (friends.snapshotLength === 0) {
                                                    Logger.debug("91: friends.snapshotLength: " + friends.snapshotLength);

                                                    // No friends were found
                                                    console.log("INFO. No friends were found.");
                                                    executor.reportError("0", "INFO", "No friends were found. We will try to reconstruct the friends list.", false);

                                                    // Raise the flag for mutual friends and mutual communicaiton
                                                    re.placeholder5 = "true";
                                                    re.shouldCollectMC = "true";
                                                    console.log("before finalize");
                                                    if (timeOut <= 0) {
                                                                    finalize();
                                                    } else{
                                                                    timeOut -= 2000;
                                                    }
                                                    

                                    } else {
                                                    timeOut = 20000;
                                                    console.log("after else");
                                                    executor.reportError("200", "INFO", "friends.snapshotLength :: " + friends.snapshotLength, false);

                                                    listOfFriends = "";

                                                    // Check if the number of Friends is less than the number we want to collect full info of
                                                    if (friends.snapshotLength < amountOfFriends) {
                                                                    amountOfFriends = friends.snapshotLength;
                                                                    Logger.debug("113: friends.snapshotLength: " + friends.snapshotLength);
                                                    }
                                                    for (var fr = length; fr < friends.snapshotLength; fr++) {
                                                                    console.log("inside for");
                                                                    var friendElement = friends.snapshotItem(fr);

                                                                    // 1. Friend
                                                                    var externalId = document.evaluate(".//*[@data-hovercard][@data-gt]", friendElement, null, 9, null).singleNodeValue;
                                                                    if (externalId) {
                                                                                    friend = {};
                                                                                    friend.externalId = document.evaluate(".//*[@data-hovercard][@data-gt]", friendElement, null, 9, null).singleNodeValue.getAttribute("data-hovercard").match(/([0-9]+)(?=\&)/)[1];
                                                                                    friend.itemType = "4"; // Web Entity
                                                                                    friend.type = "1"; // Person
                                                                                    friend.activityType = "1"; // Social Network
                                                                                    friend.url = "https://www.facebook.com/profile.php?id=" + friend.externalId;
                                                                                    friend.title = document.evaluate(".//*[@data-hovercard][@data-gt]", friendElement, null, 9, null).singleNodeValue.textContent;
                                                                                    friend.body = document.evaluate(".//*[@data-hovercard][@data-gt]", friendElement, null, 9, null).singleNodeValue.getAttribute("href").match(/.com\/(.+?)(?=\?)/)[1];
                                                                                    friend.imageUrl = "https://graph.facebook.com/" + friend.externalId + "/picture";

                                                                                    executor.reportError("177", "INFO", "Current friend is: " + JSON.stringify(friend), false);
                                                                                    if (friend.body.indexOf("profile.php") > -1) {
                                                                                                    friend.body = "";
                                                                                                    Logger.debug("136: friends.body: " + friend.body);
                                                                                    }

                                                                                    if (!(' ' + friend.externalId in collectedAccounts)) {
                                                                                                    Logger.debug("140: friends.externalId: " + friend.externalId);
                                                                                                    // 1.1. Generate list with IDs for the "social collection" (ie.social_collection)

                                                                                                    if (re.socialIds) {
                                                                                                                    if (re.socialIds.split(",").length < maxSocial) {
                                                                                                                                    re.socialIds += "," + friend.externalId;
                                                                                                                                    Logger.debug("146: friends.externalId: " + friend.externalId);
                                                                                                                    }
                                                                                                    } else {
                                                                                                                    Logger.debug("149: re.socialIds: " + re.socialIds);
                                                                                                                    re.socialIds = friend.externalId;
                                                                                                    }

                                                                                                    // 1.2. Generate list with IDs for the "friends of friends" (ie.friends_of_friends)

                                                                                                    if (listOfFriends) {
                                                                                                                    listOfFriends = listOfFriends + "," + friend.externalId;
                                                                                                    } else {
                                                                                                                    listOfFriends = friend.externalId;
                                                                                                    }

                                                                                                    collectedAccounts[' ' + friend.externalId] = true;

                                                                                                    counter++;
                                                                                                    addImage(friend);

                                                                                                    if (friendsInfo && counter <= amountOfFriends && !(re.blabla == "fof")) {
                                                                                                                    Logger.debug("167: friends.externalId: " + friend.externalId);
                                                                                                                    friendsList.push(friend.externalId);
                                                                                                                    if (friendsList.length == bulkOfFriends) {
                                                                                                                                    addEntity({
                                                                                                                                                    coordinateY_1_1: friendsList.join(";"),
                                                                                                                                                    coordinateY: "https://www.facebook.com",
                                                                                                                                                    coordinateY_1: ie.token
                                                                                                                                    });
                                                                                                                                    friendsList = [];
                                                                                                                    }
                                                                                                    }

                                                                                    } else {
                                                                                                    console.log("INFO. The account (" + friend.title + ") is already collected.");
                                                                                    }

                                                                                    // 2. Relation

                                                                                    relation = {};
                                                                                    relation.itemType = "12"; // Relation
                                                                                    relation.type = "1"; // Friend
                                                                                    relation.parent_externalId = targetId;
                                                                                    relation.parentObjectType = "4"; // Web Entity
                                                                                    relation.activityType = "1"; // Social Network
                                                                                    relation.sideB_externalId = friend.externalId;
                                                                                    relation.sideB_ObjectType = "4"; // Web Entity

                                                                                    addEntity(relation);
                                                                    } else {
                                                                                    console.log("INFO. The account had deleted his profile.")
                                                                    }
                                                                    Logger.debug("198: friends.externalId: " + friend.externalId);
                                                                    console.log("199: friends.externalId: " + friend.externalId);
                                                                    if (cycles % 2 == 0) {
                                                                                    friendElement.remove();
                                                                    }
                                                    }
                                                    console.log("202: after for:");
                                                    // Prepare list of friend for collecting their full info
                                                    //re.friendsExternalIds = Object.keys(collectedAccounts).join(";").replace(/ /g, "");
                                                    //console.log(re.friendsExternalIds)


                                                    if (re.socialIds && currentLevel == 1 && /\+social/.test(ie.flagOptions)) {
                                                                    Logger.debug("209: : currentLevel: " + currentLevel);
                                                                    re.placeholder6 = "true";
                                                                    re.url = "";
                                                    }

                                                    if (listOfFriends && currentLevel == 1 && /\+2level/.test(ie.flagOptions) && (re.blabla.match(/f/))) {
                                                                    executor.reportError("777", "ERROR", "We're calling friends_of_friends flow", false);
                                                                    addEntity({
                                                                                    coordinateX: listOfFriends,
                                                                                    coordinateY: "https://www.facebook.com/", // Start URL
                                                                                    placeholder1: ie.flagOptions
                                                                    });
                                                    } else {
                                                                    executor.reportError("777", "ERROR", "We're NOT calling friends_of_friends flow", false);
                                                    }

                                                    console.log("INFO. Collected friends :: " + Object.keys(collectedAccounts).length);

                                    }
                                    console.log("before resolve");
                                    //resolve();



                    } catch (e) {
                                    console.log("ERROR. saveFriends() :: " + e + " at line " + e.lineNumber);
                                    executor.reportError("500", "ERROR", "saveFriends() :: " + e + " at line " + e.lineNumber, false);
                                    finalize();
                                    //executor.ready();
                    }
                    //});
                    Logger.debug("209: : finalLine of function: ");

    }


}
