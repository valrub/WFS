
  function main(re, ie, oe, executor) {
    var pages = 1;
    var maxPages = 10;
    var daysBack = 0;
    //Days back default
    var daysBackDefault = 90;
  
    var collectedPages = [];
    var collectedWriters = [];
    
    setGlobalLogger(re, ie, oe, executor);
  
    Logger.production('VAL-1');
    

    if ((ie.Pages !== "1") && (ie.Pages != "")) {
      pages = parseInt(ie.Pages);
      if (isNaN(pages)) { pages = 1;}
      else if ( pages < 1) {
          pages = 1;
          executor.reportError("200", "INFO", "1 page will be collected (minimum)", false);
      }
      else if(pages > maxPages) {
          pages = maxPages;
          executor.reportError("200", "INFO", "20 pages will be collected (maximum)", false);
      }
    }
    //Days Back 
    
    Logger.production('VAL-2');

      if ((!ie.DaysBack) || (ie.DaysBack == "")) {
        daysBack = daysBackDefault;
        var daysBackDate = new Date();
        daysBackDate.setDate(daysBackDate.getDate() - daysBack);
        daysBackDate = daysBackDate.getTime();
      } else {
  
        Logger.production('VAL-3');

          if (/^\d+$/.test(ie.DaysBack)) { //implementation for 6
              daysBack = parseInt(ie.DaysBack);
              if (isNaN(daysBack) || daysBack < 1) {
                  daysBack = daysBackDefault;
                  executor.reportError("200", "INFO", "90 days back will be collected (default)", false);
              }
              else if (daysBack > 356) {
                  daysBack = 356;
                  executor.reportError("200", "INFO", "356 days back will be collected (maximum)", false);
              }
              
              Logger.production('VAL-4');

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
    
      Logger.production('VAL-5');

    var token = "FElqPq4ZUYgPITTtFP4QciFGYwK3Bhhsw1N19Obk";
    var url = "https://portal.cybersixgill.com/api/search?q=" + ie.keywords + "&token=" + token + "&partialContent=false&sort=date&orderType=desc&size=100";
    
    Logger.production('VAL-6');
  
    for (var i = 0; i < pages; i++) {
      if (i == 0) {
        var from = "&from=0";
        var finalUrl = url + from;
      } else {
          from = "&from=" + (i * 100);
          finalUrl = url + from;
  
      }
      var xhr = new XMLHttpRequest();
      xhr.open("GET", finalUrl, false)
      xhr.send();
      
      Logger.production('VAL-7 ' + finalUrl);
      
      if (xhr.status == "200") {
  
        var response = JSON.parse(xhr.responseText)
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
            
            
          }
          
          Logger.production('VAL-8');

          var writer = {
            activityType: "1",
            itemType: "4",
            type: "1",
            url: page.url,
            title: currentNode.creator,
            body: currentNode.creator,
            externalId: currentNode.creator
          }
          
          var timestamp = new Date(currentNode.date);
          timestamp = timestamp.getTime();
          if (timestamp > daysBackDate) {
              var topic = {
                activityType: "1",
                itemType: "2",
                
                url: page.url,
                parent_externalId: page.externalId,
                parentObjectType: "4",
                writer_externalId: writer.externalId,
                
                body: currentNode.content,
                title: currentNode.title,
                writeDate: currentNode.date
      
              }
          } else {
              executor.reportError("200", "INFO", "We stop collecting because of days back", false);
              executor.ready();
          }
          
          
          Logger.production('VAL-9');

          if (currentNode.post_id) {
            topic.externalId = currentNode.post_id;
          } else {
            topic.externalId = currentNode.id
          }
  
          if (!collectedWriters[writer.externalId]) {
            executor.addEntity(writer);
            collectedWriters[writer.externalId] = true;
          }
          if (!collectedPages[page.externalId]) {
            executor.addEntity(page);
            collectedPages[page.externalId] = true;
          }
          executor.addEntity(topic)
          
          
          }
      } else {
          executor.reportError("200", "INFO", "we dont have response", false);
      }
  
    }
  
  
    executor.ready();
  }