function BuilGoogleSearchUrl(keywords, exclude, num, language, sinceDate, untilDate, domain ) {
  //#region DECLARATIONS

   var _url = "";

    var objAns = {
      Status: 0,
      Message: "",
      resultUrl: ""
    };
  
    // ----- Search Switchers -------------------
    const pNum = "num";
    const pKeywords = "as_epq";
    const pExclude = "as_eq";
    const pLanguage = "lr";
    const pDomain = "as_sitesearch";
    const pCountry = "cr";
    const pDateRangePrefix = "tbs=cdr:1"; // xx/xx/xxxx,cd_max:xx/xx/xxxx";
    const pSince = ",cd_min:";
    const pUntil = ",cd_max:";
    
    // ----- Search Parts ----- -------------------
    const partPrefix = "http://www.google.com/search";
    var partNum = "";
    var partKeywords = "";
    var partExclude = "";
    var partLanguage = "";
    var partCountry = "";
    var partSinceUntil = "";
    var partDomain = "";
 
    //#endregion
    //--------------------------------------------
    if (!keywords) {
    
      objAns.Status = 0;
      objAns.Message  =  "Error. No search criteria";
      objAns.resultUrl = "NA";
      return objAns;
    }else{

    // #region MAIN_PART
    // ----- Main Part -----------------------------------------------------------------------------------------------------
    // - - - - - - (1) How many results return - -- - - - - - - - - - - - -  -]
    if (num) {
      partNum = "?" + pNum + "=" + num;
    } else {
      partNum = pNum + "=250";
    }
    
    // - - - - - - (2) What keywords in the same order to look for - - -] 
    // We know that keyword was supplied
    partKeywords = "&" + pKeywords + "=" + encodeURI(keywords);

    // - - - - - - (3) What keywords should not appear in results - - - -]
    if (exclude) {
      partExclude = "&" + pExclude + "=" + encodeURI(exclude);
    } else {
      partExclude = "";
    }
 
    // - - - - - - (4) What langusge of results is - - - - - - - - - -  - - - -]
    if (language) {
      partLanguage = "&" + pLanguage + "=" + language;
    } else {
      partLanguage = "";
    }

      // - - - - - - (5) Since/Till when to search for results - - - - - - - - - -  - - - -]
      if (sinceDate || tillDate) {
        var cleanSinceDate = sinceDate.substring(0,8);  
        var cleanUntilDate = untilDate.substring(0,8);
    
        var formattedSinceDate = convertDateToGoogle(formatInputDate(cleanSinceDate));
        var formattedUntilDate = convertDateToGoogle(formatInputDate(cleanUntilDate));
        

        partSinceUntil ="&" +  pDateRangePrefix;

        if(sinceDate){
          partSinceUntil = partSinceUntil + pSince + formattedSinceDate ;
        }

        if(untilDate){
          partSinceUntil = partSinceUntil + pUntil + formattedUntilDate ;
        }

      } else {
        partSinceUntil = "";
      }

      // - - - - - - (6) In which domein to search for results - - - - - - - - - -  - - - -]
      if (domain) {
        partDomain = "&" + pDomain + "=" + domain;
      } else {
        parDomain = "";
      }
    //--------------------------------------------
    _url = partPrefix + partNum + partKeywords + partExclude + partDomain +  partLanguage + partSinceUntil;

  //#endregion MainPart
    objAns.Status = 200;
    objAns.Message = "OK";
    objAns.resultUrl = _url;
    return objAns;
    }
  }
    

  function getGglLocationCode()
  {

  }

  function formatInputDate(inp) {
    const d = inp.split('.');
    d[2] = '20' + d[2];
    let temp = d[0];
    d[0] = d[1];
    d[1] = temp;
    return new Date(d.join(' '));
    }
    
    function convertDateToGoogle(date) {
    return `${date.getDate()}/${zeroPrefixedMonth(date)}/${date.getFullYear()}`;
    }
    
    function zeroPrefixedMonth(date) {
    let month = date.getMonth() + 1;
    if (month < 10) {
    month = '0' + month;
    }
    return month;
    } 


  var x = BuilGoogleSearchUrl("каждый охотник желает", "где сидит", "10", "lang_ru", "01.06.17 at 00:00", "30.05.18 at 00:00", "rambler.ru");
  console.log(x.resultUrl);
