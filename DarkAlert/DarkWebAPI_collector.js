
  function main(re, ie, oe, executor) {
    var pages = 1;
    var maxPages = 50;
    var daysBack = 0;
    //Days back default
    var daysBackDefault = 1000;
  
    var collectedPages = [];
    var collectedWriters = [];
    
    setGlobalLogger(re, ie, oe, executor, debugLevel = 2);
  

    

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
                  executor.reportError("200", "INFO", "90 days back will be collected (default)", false);
              }
              else if (daysBack > 356) {
                  daysBack = 356;
                  executor.reportError("200", "INFO", "356 days back will be collected (maximum)", false);
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
    


    //var token = "FElqPq4ZUYgPITTtFP4QciFGYwK3Bhhsw1N19Obk";
    //var url = "https://portal.cybersixgill.com/api/search?q=" + ie.keywords + "&token=" + token + "&partialContent=false&sort=date&orderType=desc&size=100";
    
    var token = "i38XoM9bODROTV6yc9lkk3YC0Wf0guw7x4AnxDiz";
    var _url = "https://darkalert.verint.com/api/search?q=" + ie.keywords + "&token=" + token + "&partialcontent=true";
    Logger.production("_url = " + _url);
    var url = _url; //encodeURIComponent(_url);
    Logger.production("url = " + url);
    //https://darkalert.verint.com/api/search?q=weed&token=i38XoM9bODROTV6yc9lkk3YC0Wf0guw7x4AnxDiz&partialcontent=true


    var topic = {};
    var from;
    var finalUrl;

    for (var i = 0; i < pages; i++) {
      if (i == 0) {
        from = "&from=0";
        finalUrl = url + from;
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
               topic = {
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
              Logger.debug('Exceeding days-back criteria');
              //executor.ready();
          }
          
          
          

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