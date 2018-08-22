function main(re, ie, oe, executor) {
    setGlobalLogger(re, ie, oe, executor);
  
    Logger.production(re.vInputs);
    var wfInputs = JSON.parse(re.vInputs);
  
    function vmfInstagramFollowers() {
      makeVMFRequest(re, ie, oe, executor)({
        input: {
          platform: "instagram",
          task: "followers",
          targetInfo: re.targetInfo,
          followerCount: wfInputs.max_followers,
          followingCount: 0,
          targetId: re.targetId
        },
        targets: [wfInputs.url]
      });
    }
  
    Logger.production("followersCount:: " + re.followersCount);
  
    if (ie.deltaCollection && ie.deltaCollection.toLowerCase() == "true") {
        try {
        Logger.production(ie.restApiUrl + "cachingcollectionresult/read");
        // request READ
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("POST", ie.restApiUrl + "cachingcollectionresult/read", false);
        xmlhttp.setRequestHeader('Content-type', 'application/json;charset=utf-8');
        xmlhttp.send(JSON.stringify({
            "cycleId": ie.crawlerCycleId,
            "keyName": "Followers"
        }));
        var lastCollectedFollowers = JSON.parse(xmlhttp.responseText);
        Logger.production("All Followers:: " + re.followersCount);
        Logger.production("Collected Followers count initial: " + lastCollectedFollowers.data.keyValue);
  
        if (lastCollectedFollowers.data.keyValue === "No Data Found") {
            Logger.production("No previously collected Followers " + lastCollectedFollowers.data.keyValue);
            vmfInstagramFollowers();
            //request WRITE
            var xhr = new XMLHttpRequest();
            xhr.open("POST", ie.restApiUrl + "cachingcollectionresult/save", false);
            xhr.setRequestHeader('Content-type', 'application/json;charset=utf-8');
            xhr.send(JSON.stringify({
                "cycleId": ie.crawlerCycleId,
                "keyName": "Followers",
                "keyValue": re.followersCount
            }));
            Logger.production("First time collection. Collected Followers count: " + re.followersCount);
        } else if (lastCollectedFollowers.data.keyValue < re.followersCount) {
            vmfInstagramFollowers();
            //request WRITE
            var xhr = new XMLHttpRequest();
            xhr.open("POST", ie.restApiUrl + "cachingcollectionresult/save", false);
            xhr.setRequestHeader('Content-type', 'application/json;charset=utf-8');
            xhr.send(JSON.stringify({
                "cycleId": ie.crawlerCycleId,
                "keyName": "Followers",
                "keyValue": re.followersCount
            }));
            Logger.production("Collected Followers count updated: " + re.followersCount);
        } else {
            Logger.production("This data is indicated as collected before.");
            finalize();
        }
        } catch (e) {
            Logger.production('CA_Following_insideDeltaCollection : Error is ' + e.message);
        }
    } else {
         try {
            vmfInstagramFollowers();
        } catch (e) {
            Logger.production('CA_Following_vmfInstagramFillowers : Error is ' + e.message);
        }
    }
  }
  