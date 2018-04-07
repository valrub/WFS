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

        re.placeholder12 = queryDataPath; //For a future use
        re.placeholder13 = true; // Loop condition
        re.placeholder16 = 1; // Iterations counter
        re.placeholder10 = "THE_FIRST_CALL" ; // Sequence number (pointer to the next page)
        



        var pp = {};
        pp.QueryName = QueryName;
        pp.username = ie.username;
        pp.password = ie.password;
        pp.crawlerCycleId = ie.crawlerCycleId;
        pp.sequence = "THE_FIRST_CALL";
        var exParams = JSON.stringify(pp);

        Logger.production("exParams = " + exParams);

        callWebAlertAPI(queryListPath, exParams)
          .then(list => {
            Logger.production("list of queries: " + list);

            return getId(QueryName, list);
          })
          .then(q => {
            Logger.production(
              "So: ID of: " +
                QueryName +
                " = " +
                q.id +
                " [" +
                q.data_count +
                "] total records"
            );

            re.placeholder14 = q.id; //For a future use
            re.placeholder15 = q.data_count; //For a future use

            executor.ready();

          })
          // -- HANDLERS ---------------------------------------------------------------
          .catch(error => {
            Logger.error("Error is :" + error);

            if (/Network request failed/.test(error)) {
              Logger.failure("Process failed!" + error, "600404"); //Resource Unavailable
            } else if (/unauthorized/.test(error)) {
              Logger.failure("Process failed!" + error, "400020"); //Not valid VA
            } else if (/No such query name/.test(error)) {
              Logger.production("Process failed!" + error, "100300"); //Wrong Query Name
              executor.ready();
            } else if (/No changes in data/.test(error)) {
              Logger.production("No new data found!" + error, "900200"); //No changes in results
              executor.ready();
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
            let v_data_count = coll[i]["data_count"].toString();
            let v_id = coll[i]["query_id"].toString();
            res = {
              data_count: v_data_count,
              id: v_id
            };

            let theSameNumberOfRecords = false;
            //Now, check total from the prev execution
            //READ FROM REPOSITORY
            //IF IT WAS CHANGED - CONTINUE TO COLLECT
            //OTHERWISE - REJECT (No changes in data - still q.data_count records);
            if (theSameNumberOfRecords === true){
              reject("Ups .. No changes in data - still [" + v_data_count + "] records"); //JUST FOR TEST
            }
            
            Logger.production(
              "Total [" +
                v_data_count +
                "] records in the query <" +
                name +
                "> id = " +
                JSON.stringify(res)
            ); //LAST

            resolve(res);
          }
        }

        if (!res) {
          Logger.production("100300 - No such query name in the list"); //, "100300");
          reject("100300 - No such query name in the list");
          re.placeholder13 = false; //No need to collect data (the next ctep-s)
          executor.ready();
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

  } catch (e) {
    Logger.failure(e);
  }
}
