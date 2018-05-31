function main(runtimeEntity, inputEntity, outputEntity, executor) {
    //your code here
  
    setGlobalLogger(runtimeEntity, inputEntity, outputEntity, executor, debugLevel = 4);

    var PagingDiv = getElementByXpath("//div[@id='container']//div[@id='content']//div[1]//div[2]//div[1]");
    var listAElements = PagingDiv.getElementsByTagName("a");
    
    Logger.debug("------------------");
    Logger.debug(JSON.stringify(listAElements));
    Logger.debug("------------------");

    var inputParameter = runtimeEntity.coordinateX;
    runtimeEntity.placeholder10++; //VAL to remove?
    
    Logger.debug("Inpptparameter = " + inputParameter);

    if (inputParameter != 1) {

      if (runtimeEntity.placeholder10 > inputParameter ) {
        runtimeEntity.placeholder6 = false;
      }
      
      for (var i = 0; i < inputParameter-1; i++) {
        // get value from a tag
        var text = listAElements[i].innerHTML;
        executor.reportError("200", "INFO", "text[" + i + "] = " + text, false);
        
        if (text != i + 1) {
          // emulate click on next element if exist.
          executor.reportError("200", "INFO", "currentElement: " + listAElements[i].outerHTML, false);
          console.log("Click: " + listAElements[i].outerHTML);
          runtimeEntity.placeholder3 = listAElements[i].href;
          break;
          
        }  
      }
    
  } else {
    runtimeEntity.placeholder6 = false;
    runtimeEntity.placeholder3 = "about:blank";
  }
  executor.ready();
  }
  
  function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  }