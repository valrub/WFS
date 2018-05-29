/**
 * Execution of Custom Action starts from here. The function is similar to main method in Java 
 * The user MUST call "ready" function of the given executor in order to indicate that all code is executed.
 * Following line will save output entity to database:
 * executor.addEntity({entityField1: 'Field Value 1', entityField2: 'Field Value 2'})
 * 
 * Following function will flush the collected data without stopping the CA execution:
 * executor.flushEntities();
 *
 * Following function is used for reporting errors:
 * executor.reportError(eventCode, eventLevel, errorMessage, failWebflow); 
 * @param {String} eventCode - this is the code for the custom event as it is in the DB table event_types, column CODE.
 * @param {String} eventLevel – the level of reported error (e.g. WARNING, INFO or ERROR); default : "ERROR".
 * @param {String} errorMessage – the actual message.
 * @param {boolean} failWebflow – indicates if the user wants to fail the current task executed by CU. 
 *
 * Use the following function to wrap user function and report an error automatically when such occurs:
 * executor.tryCatch(userFunction, options);
 * @param {Object} [options] - This is optional parameter with properties: data (additional data that the userFunction will use) and context (will be used as "this" in the userFunction).
 *
 * Special variables of runtimeEntity:
 *  - CurrentContextXPath - contains current context xpath. Current contect is for example if 
 * Webflow is inside for-each action. Current for-each element xpath will be written in this variable. 
 * if there is no context value is empty string.
 * 
 * @param {Object} runtimeEntity The runtime entity
 * @param {Object} inputEntity The input entity 
 * @param {Object} outputEntity The output entity 
 * @param {Object} executor Predefined object with commonly used functions and properties. 
 */
function main(runtimeEntity, inputEntity, outputEntity, executor) {
    //your code here
  
    var PagingDiv = getElementByXpath("//div[@id='container']//div[@id='content']//div[1]//div[2]//div[1]");
    var listAElements = PagingDiv.getElementsByTagName("a");
    var inputParameter = runtimeEntity.coordinateX;
    runtimeEntity.placeholder10++;
    
    if (inputParameter != 1) {
      if (runtimeEntity.placeholder10 > inputParameter ) {
        runtimeEntity.placeholder6 = false;
      }
      for (var i = 0; i < inputParameter-1; i++) {
        // get value from a tag
        var text = listAElements[i].innerHTML;
        executor.reportError("200", "INFO", "text: " + text, false);
        // if value not eq i = current position
        //console.log ("Check I " + i);
        //console.log ("Check text " + text);
        
        if (text != i + 1) {
          // emulate click on next element if exist.
          executor.reportError("200", "INFO", "currentElement: " + listAElements[i].outerHTML, false);
          console.log("Click: " + listAElements[i].outerHTML);
          runtimeEntity.placeholder3 = listAElements[i].href;
          break;
          //if (text == inputParameter) {
          //  runtimeEntity.placeholder6 = false;
          //  //console.log ("ENDDDDDDDDDDDDDDDDDDDDDDD");
          //}
        }  
      }
    
  } else {
    runtimeEntity.placeholder6 = false;
    runtimeEntity.placeholder3 = "about:blank";
    //}
    //runtimeEntity.placeholder3 = "";
    //runtimeEntity.placeholder6 = "";
  
  }
  executor.ready();
  }
  
  function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  }