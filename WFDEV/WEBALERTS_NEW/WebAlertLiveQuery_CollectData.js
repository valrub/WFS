function main(re, ie, oe, executor) {
  try {
    setGlobalLogger(re, ie, oe, executor);

    getLiveQueryResults(ie.QueryName, 10, ""); //COMMENT LATER

    //--------------------------------------------------------------------------------------------------------------------
    function getLiveQueryResults(QueryName, chunk, sequence) {
      try {
        Logger.production("ie = " + JSON.stringify(ie));
        Logger.production("restApiUrl = " + ie.restApiUrl);
        Logger.production("crawlerCycleId = " + ie.crawlerCycleId);
        Logger.production("jobId = " + ie.jobId);

        var isIpDefined = executor.getConfigParam("VMF_HOST_IP");
        var uriMainPart = "";

        Logger.production("VMF IP is " + isIpDefined);
        if (isIpDefined) {
          isIpDefined = isIpDefined.trim();
          uriMainPart = "http://" + isIpDefined + ":3012";
        } else {
          uriMainPart = "http://" + CU1 + ":3012"; //port may be changed?
        }

        Logger.production("uriMainPart = " + uriMainPart);

        var queryListPath = uriMainPart + "/getLiveQueries";
        var queryDataPath = uriMainPart + "/getLiveQResults";

        var pp = {};
        pp.QueryName = QueryName;
        pp.username = ie.username;
        pp.password = ie.password;
        pp.crawlerCycleId = ie.crawlerCycleId;
        pp.sequence = "";
        var exParams = JSON.stringify(pp);

        Logger.production("exParams = " + exParams);

        callWebAlertAPI(queryListPath, exParams)
          .then(list => {
            Logger.production("list of queries: " + list);

            return getId(QueryName, list);
          })
          .then(id => {
            Logger.production("ID of: " + QueryName + " = " + id);
            var ppd = {};
            ppd.QueryName = QueryName;
            ppd.username = ie.username;
            ppd.password = ie.password;
            ppd.sequence = "";
            ppd.searchId = id;
            ppd.crawlerCycleId = ie.crawlerCycleId;
            var exParamsData = JSON.stringify(ppd);
            Logger.debug("exParamsData = " + exParamsData);

            exParamsData = JSON.stringify(ppd);
            return callWebAlertAPI(queryDataPath, exParamsData);
          })
          .then(response => {
            return parseData(response);
          })
          .catch(error => {
            Logger.error("Error is :" + error);

            if (/Network request failed/.test(error)) {
              Logger.failure("Process failed!" + error, "600404"); //Resource Unavailable
            } else if (/unauthorized/.test(error)) {
			  Logger.failure("Process failed!" + error, "400020"); //Not valid VA
			} else if (/No such query name/.test(error)) {
				Logger.failure("Process failed!" + error, "100300"); //Wrong Query Name
            } else {
              Logger.error("Process failed!" + error);
            }
          });
      } catch (e) {
        Logger.failure("Error message: " + e);
      }
    }

    //--------------------------------------------------------------------------------------------------------------------
    function getId(name, collection) {
      return new Promise((resolve, reject) => {
        var res = null;
        var coll = JSON.parse(collection);
        for (var i in coll) {
          if (coll[i]["name"] === name) {
            res = coll[i]["query_id"].toString();
            let v_data_count = coll[i]["data_count"].toString();
            Logger.production('Total [' + v_data_count + '] records i query <' + name + '> #' + res); //LAST
            resolve(res);
          }
        }
        if (!res) {
		  Logger.production("100300 - No such query name in the list"); //, "100300");
		  reject('100300 - No such query name in the list');
        }
      });
    }

    //--------------------------------------------------------------------------------------------------------------------
    function callWebAlertAPI(path, jsonParams) {
      Logger.production("callWebAlertAPI: " + path + " (" + jsonParams + ")");
      return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open("POST", path);
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            var ta = new Date();
            Logger.production(
              "API response returned: " + ta + " from url: " + path
            );

            Logger.debug("xhr.response " + xhr.response);

            var o = JSON.parse(xhr.response.toString());
            // Logger.production(o);
            Logger.production(o.error);
            // Logger.production(o.data);

            if (o.error) {
              Logger.production("WE ARE HERE(1)");
              reject(o.data);
            } else {
              Logger.production("WE ARE HERE(2)");
              resolve(xhr.response);
            }
          } else {
            Logger.production(xhr.responseText);
            reject(xhr.responseText);
          }
        };
        xhr.onerror = () => {
          Logger.error(
            "ERROR IN callWebAlertAPI. xhr.response = " + xhr.response
          );
          reject(new TypeError(xhr.responseText || "Network request failed")); //reject(xhr.statusText);
        };
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(jsonParams);
      });
    }

    //--------------------------------------------------------------------------------------------------------------------
    function parseData(response) {
      let collectedAccounts = [];

      let responseObj = JSON.parse(response);
      // let leftPosts = responseObj.remainder_posts;
      re.remainderPosts = responseObj.remainder_posts;
      responseObj = responseObj.data;

      var ti = new Date();
      Logger.production("Parsing started: " + ti);

      for (var i = 0; i < responseObj.length; i++) {
        //DO NOT FOPRGET TO CHECK THE LAST EXTRACTED POSTID AND DO NOT CONTINUE IN CASE ..
        let author = {};
        author.externalId = responseObj[i].author.author_service_id;
        author.itemType = "4"; // Web Entity
        author.type = "1"; // Person
        author.activityType = "1"; // Social Network
        author.url = responseObj[i].author.link;
        author.title = responseObj[i].author.name;
        author.imageUrl = responseObj[i].author.avatar;
        collectedAccounts.push(author);

        if (!("" + author.externalId in collectedAccounts)) {
          collectedAccounts[" " + author.externalId] = true;
          //if (ie.downloadImages == 'true') {
          addImage(author);
          //} else {
          //	addEntity(author);
          //}
        } else {
          Logger.debug(
            "The account (" + author.title + ") is already collected."
          );
        }

        let post = {};
        post.externalId = responseObj[i].interaction.internal_id;
        post.itemType = "2"; // Topic
        post.parent_externalId = author.externalId;
        post.parentObjectType = "4"; // Web Entity
        post.activityType = "1"; // Social Network
        post.url = responseObj[i].interaction.link;
        post.body = responseObj[i].interaction.content;
        post.writeDate = responseObj[i].interaction.created_original_date;
        post.writer_externalId = author.externalId;
        post.imageUrl = responseObj[i].interaction.media;

        if (
          responseObj[i].interaction.sub_type === "image" &&
          ie.downloadImages == "true"
        ) {
          post.itemType = "5"; // Image
          addImage(post);
        } else {
          post.itemType = "2"; // Post
          addEntity(post);
        }
        re.sequence = responseObj[i].interaction.sequence;
      }
      //DO NOT FOPRGET TO PERSIST THE LAST EXTRACTED POSTID

      var te = new Date();
      Logger.production("Second CA and parsing ended: " + te);

      finalize();
    }
  } catch (e) {
    Logger.failure(e);
  }
}
