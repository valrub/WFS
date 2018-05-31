function main(runtimeEntity, inputEntity, outputEntity, executor) {
    //your code here
  
    setGlobalLogger(runtimeEntity, inputEntity, outputEntity, executor, debugLevel = 4);

    var PagingDiv = getElementByXpath("//div[@id='container']//div[@id='content']//div[1]//div[2]//div[1]");
    var listAElements = PagingDiv.getElementsByTagName("a");

    runtimeEntity.placeholder10++; //The Next page is goint to pe processed in this circle (started from 1)
    var NextPageNumber = parseInt(runtimeEntity.placeholder10);


    var maxPages = runtimeEntity.coordinateX; //input parameter given by user
    var totalPages = parseInt(listAElements.length) + 1;

    if(maxPages > totalPages) //placeholder11 keep total pages found for this query
    {
        maxPages = totalPages; //there are less pages of results, than used asked for
    }
    
    Logger.debug("UserAsked = " + maxPages);
    Logger.debug("TotalPages = " + totalPages);
    Logger.production("Will be collected = " + maxPages + " pages", "500500");
    Logger.production("NextPage = " + NextPageNumber, "500500");

    if (maxPages != 1) {

        // if (runtimeEntity.placeholder10 > maxPages ) {
        //     runtimeEntity.placeholder6 = false;
        // }

        
        
        Logger.debug("---------------------------------------------");
        var NextPageNumberIndex = NextPageNumber - 1;
        Logger.debug("HREF[" + NextPageNumber + "] =" +  listAElements[NextPageNumberIndex].href);
        Logger.debug("---------------------------------------------");
        runtimeEntity.placeholder3 = listAElements[NextPageNumberIndex].href;
    
    } else {
        runtimeEntity.placeholder6 = false;
        runtimeEntity.placeholder3 = "about:blank";
    }

    if(NextPageNumber == maxPages)
    {
        runtimeEntity.placeholder6 = false;
        runtimeEntity.placeholder3 = "about:blank";
        Logger.production("<-- The Last page had been processed -->", "500102");
    }
  executor.ready();
  }
  
  function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  }