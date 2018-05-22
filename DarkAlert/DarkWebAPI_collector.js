
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
      
      var totalCollected = 0;
      var totalNotCollectedDueToDate = 0;

      var colComments = ['comment', 'feedback', 'reply'];

      setGlobalLogger(re, ie, oe, executor, debugLevel = 2);

      // if ((ie.Pages !== "1") && (ie.Pages != "")) {
      //   pages = parseInt(ie.Pages);
      //   if (isNaN(pages)) { pages = 1;}
      //   else if ( pages < 1) {
      //       pages = 1;
      //       Logger.warning('1 page will be collected (minimum)', '100320');
      //   }
      //   else if(pages > maxPages) {
            pages = maxPages;
            //Logger.warning(maxPages + ' pages will be collected (input parameter is out of permited range)', '100310');
      //   }
      // }
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
                else if (daysBack > daysBackDefault) {
                    daysBack = 365;
                    Logger.warning(daysBackDefault + ' days back will be collected (input parameter is out of permited range)', '100310');
                }
          
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
      //https://darkalert.verint.com/api/search?q=weed&token=i38XoM9bODROTV6yc9lkk3YC0Wf0guw7x4AnxDiz&partialcontent=true

      //          https://darkalert.verint.com/api/search?q=viagra&token=i38XoM9bODROTV6yc9lkk3YC0Wf0guw7x4AnxDiz&partialcontent=true&size=2&sort=date&orderType=desc&from=31

      //var _url = "https://darkalert.verint.com/api/search?q=" + ie.keywords + "&token=" + token + "&partialcontent=true";
      
      var _url = "https://darkalert.verint.com/api/search?q=" + ie.keywords + "&token=" + token + "&partialcontent=true&size=" + pageSize + "&sort=date&orderType=desc";
      
      var url = _url; //encodeURIComponent(_url);
      Logger.production("url = " + url);    

      var topic = {};
      var from;
      var finalUrl;
      
      
        
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

          //Logger.warning(response.results.length + ' results returned in that call[' + i + "]", '500500');
          

          for (var j = 0; j < response.results.length; j++) {
            var currentNode = response.results[j];
            
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
                    description: currentNode.category, //Val
                    //writeDate: currentNode.date
                    writeDate: currentNode.collection_date
          
                  };

                  //if (currentNode.post_id) {
                  //  topic.externalId = currentNode.post_id;
                  //} else {
                    topic.externalId = currentNode.id;
                  //}
          
                  if (!collectedWriters[writer.externalId]) {
                    executor.addEntity(writer);
                    collectedWriters[writer.externalId] = true;
                  }
                  if (!collectedPages[page.externalId]) {
                    executor.addEntity(page);
                    collectedPages[page.externalId] = true;
                  }
        
                  executor.addEntity(topic);
                  
                  totalCollected+=1;
              }else{ //Comment
                topic = {
                  activityType: "1",
                  itemType: "3",
                  type: '1', 
                  url: page.url,
                  parent_externalId: currentNode.post_id,
                  parentObjectType: "2",
                  writer_externalId: writer.externalId,
                  
                  body: currentNode.content,
                  title: currentNode.title,
                  description: currentNode.category, //Val
                  //writeDate: currentNode.date
                  writeDate: currentNode.collection_date
        
                };

                //if (currentNode.post_id) {
                //  topic.externalId = currentNode.post_id;
                //} else {
                  topic.externalId = currentNode.id;
                //}
        
                if (!collectedWriters[writer.externalId]) {
                  executor.addEntity(writer);
                  collectedWriters[writer.externalId] = true;
                }
                if (!collectedPages[page.externalId]) {
                  executor.addEntity(page);
                  collectedPages[page.externalId] = true;
                }
      
                executor.addEntity(topic);
                
                totalCollected+=1;
              }
            } else {
                Logger.debug(timestamp + ' Exceeding days-back criteria', '900300');
                totalNotCollectedDueToDate+=1;
            }
            

            
            }
        } else {
            Logger.warning('we dont have response', '500504');
            noMoreResponse++;
            if(noMoreResponse > 10)
            {
              Logger.warning('It seems there are no more results', '500102');
              
              Logger.warning("DONE:" + totalCollected + ' Total results were collected', '500102');    
              Logger.warning("DONE:" + totalNotCollectedDueToDate + ' Total results were not collected due to date limit', '500102');
              executor.ready();
              Logger.production('STILL HERE?');
            }
        }
        
        executor.flushEntities();
        Logger.debug("URL[" + i + "] = " + finalUrl, '500100');

      } //EO FOR (i)
    
      Logger.warning("DONE:" + totalCollected + ' Total results were collected', '500102');    
      Logger.warning("DONE:" + totalNotCollectedDueToDate + ' Total results were not collected due to date limit', '500102');

      executor.ready();
    }


