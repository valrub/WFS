function main(re, ie, oe, executor) {
  try {
    setGlobalLogger(re, ie, oe, executor);

    Logger.production('Starting iteration #' + re.placeholder16);

    getLiveQueryResults(ie.QueryName,  ""); //COMMENT LATER

    

    //--------------------------------------------------------------------------------------------------------------------
    function getLiveQueryResults(QueryName,  sequence) {
      try {
        Logger.production("ie = " + JSON.stringify(ie));
        Logger.production("restApiUrl = " + ie.restApiUrl);
        Logger.production("crawlerCycleId = " + ie.crawlerCycleId);
        Logger.production("jobId = " + ie.jobId);

        var queryDataPath = re.placeholder12;

        var ppd = {};
        ppd.QueryName = QueryName;
        ppd.username = ie.username;
        ppd.password = ie.password;
        ppd.sequence = re.placeholder10; 
        ppd.searchId = re.placeholder14;
        ppd.crawlerCycleId = ie.crawlerCycleId;

        var exParamsData = JSON.stringify(ppd);
        Logger.debug("exParamsData = " + exParamsData);

        exParamsData = JSON.stringify(ppd);
        
        callWebAlertAPI(queryDataPath, exParamsData)
          .then(response => {
            return parseData(response);
          })
          // -- HANDLERS ---------------------------------------------------------------
          .catch(error => {
            Logger.error("Error is :" + error);

            if (/Network request failed/.test(error)) {
              Logger.failure("Process failed!" + error, "600404"); //Resource Unavailable
            } else if (/unauthorized/.test(error)) {
              Logger.failure("Process failed!" + error, "400020"); //Not valid VA
            } else if (/No such query name/.test(error)) {
              Logger.failure("Process failed!" + error, "100300"); //Wrong Query Name
            } else if (/No changes in data/.test(error)) {
              Logger.failure("No new data found!" + error, "900200"); //Wrong Query Name
            } else {
              Logger.error("Process failed!" + error);
            }
          });
      } catch (e) {
        Logger.failure("Error message: " + e);
      }
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

            Logger.production(o.error);

            if (o.error) {
              reject(o.data);
            } else {
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
      re.placeholder11 = responseObj.remainder_posts;
      responseObj = responseObj.data;

      //Logger.production("VAL 7: RESPONSE = " +  JSON.stringify(responseObj));

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



        Logger.production('responseObj[i].interaction.sub_type = ' + responseObj[i].interaction.sub_type);
        if (
          responseObj[i].interaction.sub_type === "image" 

          
          //&& ie.downloadImages == "true"
        ) {
          post.itemType = "5"; // Image
          addImage(post);
        } else {
          post.itemType = "2"; // Post
          addEntity(post);
        }
        
        //re.sequence = responseObj[i].interaction.sequence;
        //Logger.production("VAL 33 " + responseObj[i].interaction.sequence);
        
      }

      //DO NOT FOPRGET TO PERSIST THE LAST EXTRACTED POSTID
      re.placeholder10 = responseObj[i-1].interaction.sequence;
      Logger.production("THE LAST Sequence is" + re.placeholder10);
      Logger.production("Total remaining Posts are" + re.placeholder11);
      
      if (re.placeholder11 > 0)
      {
        re.placeholder13 = true;
        re.placeholder16 = parseInt(re.placeholder16) + 1; //Next iteration counter
        Logger.production('Going to the next iteration #' + re.placeholder16);
      }
      else{
        re.placeholder13 = false;
        Logger.production('Finita la comedia ...');
      }


      var te = new Date();
      Logger.production("Second CA and parsing ended: " + te);

      finalize();
    }
  } catch (e) {
    Logger.failure(e);
  }
}
