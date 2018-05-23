
    function main(re, ie, oe, executor) {
      var pages = 1;
      var maxPages = 250;
      var daysBack = 0;
      var pageSize = 100;
      //Days back default
      var daysBackDefault = 3700;
      var noMoreResponse = 0;
    
      var collectedPages = [];
      var collectedWriters = [];
      
      

      var colComments = ['comment', 'feedback', 'reply'];


      var totalCollected = 0;
      var totalNotCollectedDueToDate = 0;
      var cntAuthor = 0;
      var cntTopic = 0;
      var cntComment = 0;


      setGlobalLogger(re, ie, oe, executor, debugLevel = 4);

      pages = maxPages;

      //Days Back 

        if ((!ie.DaysBack) || (ie.DaysBack == "")) {
          daysBack = daysBackDefault;
          daysBackDate = new Date();
          daysBackDate.setDate(daysBackDate.getDate() - daysBack);
          daysBackDate = daysBackDate.getTime();
        } else {
            if (/^\d+$/.test(ie.DaysBack)) { //implementation for 6
                daysBack = parseInt(ie.DaysBack);
                if (isNaN(daysBack) || daysBack < 1) {
                    daysBack = daysBackDefault;
                    Logger.warning(daysBackDefault + ' days back will be collected (input parameter is missing)', '100320');
                }
                // else if (daysBack > daysBackDefault) {
                //     daysBack = 365;
                //     Logger.warning(daysBackDefault + ' days back will be collected (input parameter is out of permited range)', '100310');
                // }
          
                daysBackDate = new Date();
                daysBackDate.setDate(daysBackDate.getDate() - daysBack);
                daysBackDate = daysBackDate.getTime();
            } else if (/^[0-9]{4}\/(0[1-9]|1[0-2])\/(0[1-9]|[1-2][0-9]|3[0-1])$/.test(ie.DaysBack)) { //implementation for 
                // date format should be yyyy/mm/dd
                daysBackDate = new Date(ie.DaysBack);
                daysBackDate = daysBackDate.getTime();
            }  else {
                daysBack = daysBackDefault;
                var dbDate = new Date();
                dbDate.setDate(dbDate.getDate() - daysBack);
                dbDate = dbDate.getTime();
            }
        } 
      
      
      Logger.production("Will be executed for " + pages * pageSize + " posts collected during last " + daysBack + " days", "500500"); 

      var token = "i38XoM9bODROTV6yc9lkk3YC0Wf0guw7x4AnxDiz";
      
      var _url = "https://darkalert.verint.com/api/search?q=" + ie.keywords + "&token=" + token + "&partialcontent=true&size=" + pageSize + "&sort=date&orderType=desc";
      
      var url = _url; //encodeURIComponent(_url);
      Logger.production("url = " + url);    

      var topic = {};
      var comment = {};
      var from;
      var finalUrl;
      var j = 0;
      
        
      for (var i = 0; i < pages; i++) {
        if (i == 0) {
          from = "&from=0";
          finalUrl = url + from;
        } else {
            from = "&from=" + (i * pageSize);
            finalUrl = url + from;
        }
        var xhr = new XMLHttpRequest();
        xhr.open("GET", finalUrl, false);
        xhr.send();
        
        if (xhr.status == "200") {
          
          var response = JSON.parse(xhr.responseText);

          for (j = 0; j < response.results.length; j++) {
            var currentNode = response.results[j];
            
            Logger.debug('page[' + i + ']  /  post[' + j + ']');

            var page = {
              activityType: "1",
              itemType: "4",
              type: "7",
              url: "http://" + currentNode.site + ".onion",
              title: currentNode.site,
              body: currentNode.site,
              externalId: currentNode.site      
            };
            
            

            var writer = {
              activityType: "1",
              itemType: "4",
              type: "1",
              url: page.url,
              title: currentNode.creator,
              body: currentNode.creator,
              externalId: currentNode.creator
            };
            
            var timestamp = new Date(currentNode.date);
            timestamp = timestamp.getTime();
            if (timestamp > daysBackDate) {
                if(!colComments.includes(currentNode.type))
                { //Post
                  topic = {
                    activityType: "1",
                    itemType: "2",
                    
                    url: page.url,
                    parent_externalId: page.externalId,
                    parentObjectType: "4",
                    writer_externalId: writer.externalId,
                    
                    body: currentNode.content,
                    title: currentNode.title,
                    description: currentNode.category, 

                    writeDate: currentNode.collection_date
          
                  };

                  topic.externalId = currentNode.id;

          
                  if (!collectedWriters[writer.externalId]) {
                    executor.addEntity(writer);
                    cntAuthor++;
                    totalCollected++;
                    collectedWriters[writer.externalId] = true;
                  }
                  if (!collectedPages[page.externalId]) {
                    executor.addEntity(page);
                    collectedPages[page.externalId] = true;
                  }
        
                  executor.addEntity(topic);
                  cntTopic++;
                  totalCollected++;
              }else{ //Comment
                comment = {
                  activityType: "1",
                  itemType: "3",
                  type: '1', 
                  url: page.url,
                  parent_externalId: currentNode.post_id,
                  parentObjectType: "2",
                  writer_externalId: writer.externalId,
                  
                  body: currentNode.content,
                  title: currentNode.title,
                  description: currentNode.category, 

                  writeDate: currentNode.collection_date
        
                };


                comment.externalId = currentNode.id;
                //}
        
                if (!collectedWriters[writer.externalId]) {
                  executor.addEntity(writer);
                  cntAuthor++;
                  totalCollected++;
                  collectedWriters[writer.externalId] = true;
                }

      
                executor.addEntity(comment);
                cntComment++;
                totalCollected++;
              }
            } else {
                Logger.debug(timestamp + ' Exceeding days-back criteria', '900300');
                totalNotCollectedDueToDate+=1;
            }
            

            
            }
        } else {
            Logger.warning('we dont have response', '500504');
            noMoreResponse++;
            j--; //repeat the same request;
            if(noMoreResponse > 10)
            {
              Logger.warning('It seems there are no more results', '500102');
              
              Logger.warning("DONE1:" + totalCollected + ' Total results were collected', '500102');    
              Logger.warning("DONE2:" + cntAuthor + ' Total Author were collected', '500102');    
              Logger.warning("DONE3:" + cntTopic + ' Total Topic were collected', '500102');    
              Logger.warning("DONE4:" + cntComment + ' Total Comment were collected', '500102');    
              Logger.warning("DONE5:" + totalNotCollectedDueToDate + ' Total results were not collected due to date limit', '500102');
              executor.ready();
              Logger.production('STILL HERE?');
            }
        }
        
        executor.flushEntities();
        Logger.debug("URL[" + i + "] = " + finalUrl, '500100');

      } //EO FOR (i)
    
      Logger.warning("DONE:" + totalCollected + ' Total results were collected', '500102');    
      Logger.warning("DONE:" + cntAuthor + ' Total Author were collected', '500102');    
      Logger.warning("DONE:" + cntTopic + ' Total Topic were collected', '500102');    
      Logger.warning("DONE:" + cntComment + ' Total Comment were collected', '500102');    
      Logger.warning("DONE:" + totalNotCollectedDueToDate + ' Total results were not collected due to date limit', '500102');

      executor.ready();
    }


