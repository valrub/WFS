function main(re, ie, oe, executor) {
    setGlobalLogger(re, ie, oe, executor);
  
    if (re.collectActivity == "true" || re.hasFollowers == "false") {
      executor.ready();
    } else {
      Logger.production('Starting VMF function');
      var req = new XMLHttpRequest();
      var vmfIP = executor.getConfigParam('VMF_HOST_IP').trim();
      var jmsBroker = executor.getConfigParam('COLLECT_JMS_BROKER_URL').trim().split('');
      var jmsDataQueue = executor.getConfigParam('CU_JMS_DATA_QUEUE').trim();
      var jmsNotificationQueue = executor.getConfigParam('CU_JMS_NOTIFICATION_QUEUE').trim();
  
      Logger.production('VMF IP is ' + vmfIP);
      if (vmfIP) {
        req.open('POST', 'http://' + vmfIP + ':3568/vmf');
      } else {
        req.open('POST', 'http://CU1:3568/vmf');
      }
  
      req.onload = function () {
        Logger.production(JSON.stringify(req));
        if (req.status == 200) {
          var data = JSON.parse(req.response).output; // array with entities
          if (data.length === 0) {
            Logger.failure('WF could not retrieve any data from service.');
          } else {
            Logger.production('Total entities: ' + data.length);
            var counter = 0;
            while (counter < data.length) {
              Logger.production('Entity[' + counter + ']: ' + JSON.stringify(data[counter]));
              addImage(data[counter]);
              counter++;
            }
            finalize();
            Logger.production('WF finished with ' + counter + ' collected entities.');
          }
        } else {
          Logger.failure('Network Error. Server returned status code: ' + req.status);
        }
      };
  
      req.onerror = function () {
        Logger.failure('Network Error. Server returned status code: ' + req.statusText);
      };
  
      req.setRequestHeader("Content-Type", "application/json");
      var input = {
        "config": {
          "platform": "twitter-following-followers",
          "task": "followingFollowers",
          "taskId": ie.taskId,
          "useAgent": true,
          "jmsBroker": jmsBroker,
          "jmsDataQueue": jmsDataQueue,
          "jmsNotificationQueue": jmsNotificationQueue
        },
        "input": {
          "staticLibrariesHost": executor.getConfigParam("ADMIN_CONNECTIVITY_SERVER_HOST"),
          "agentname": ie.username,
          "agentpass": ie.password,
          "targetID": re.externalId,
          "shouldPersist": "nopersist",
          "proxyIP": ie.VA_ProxyIP,
          "maxFollowingFollowers": ie.maxFollowers,
          "relationType": "follower"
        },
        "targets": ["https://twitter.com/" + re.body + "/followers"]
      };
      Logger.production("sending: " + JSON.stringify(input));
      req.send(JSON.stringify(input));
      Logger.production("after send");
    }
  }