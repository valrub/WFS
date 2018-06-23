function main(re, ie, oe, executor) {
    setGlobalLogger(re, ie, oe, executor, debugLevel = 2);
    // try {
    //     var URL="";


    //     re.Google_key = "AIzaSyAOoXTVgplTqj7rYjT4MRBcMAzbD4lKpxY";
        
    //     if (ie.Url===""){
    //         if (ie.Keyword.match(/^http/)){
    //             URL = 'https://images.google.com/searchbyimage?image_url=' + ie.Keyword;
	// 		} else {
	// 			URL = 'https://www.google.com/search?q=' + encodeURIComponent(ie.Keyword);
	// 		}
    //     } else {
    //         URL = ie.Url;
    //     }
           
    //    re.Keyword = URL.replace('/#q','/search?q');
       
    //    if (ie.DomainName) {
           
    //        re.Keyword = re.Keyword + '+site:' + ie.DomainName;
    //        re.Url = re.Keyword + '+site:' + ie.DomainName;
           
    //    } else {
    //         re.Url = URL;//+'&start=60';
    //    }
      
    //    var numtag = toHex(Name);
    //    // holds the topic ID
    //    re.Fake_Url = "gs_"+numtag.toString();
    //    executor.addEntity({Keyword:Name,Fake_Url:"gs_"+numtag.toString(),Google_key:re.Keyword,Url:"https://www.google.com/"});
    // } catch (e) {
    //     executor.addEntity({Url:e.message});
    // }

    //function BuilGoogleSearchUrl(keywords, exclude, num, language, sinceDate, untilDate, domain ) {
    
    var ans = BuilGoogleSearchUrl(ie.Keyword, ie.excludeWords, ie.maxGoogleResults, ie.language, ie.since, ie.until, ie.DomainName);
    if(ans.Status == 200)
    {
        re.Url = ans.resultUrl;
        Logger.production("Url = " + re.Url, "500101");

        // -----------------------------------------
        var Name = "";
        if (ie.GenericWriterName === '') {
            Name = "Google Search";
        } else {
            Name = ie.GenericWriterName;
        }
        // -----------------------------------------
          var numtag = toHex(Name);
       // holds the topic ID
        re.Fake_Url = "gs_"+numtag.toString();
        executor.addEntity({Keyword:Name,Fake_Url:"gs_"+numtag.toString(),Google_key:re.Keyword,Url:"https://www.google.com/"});
    }else{
        Logger.fail("Did not succeed to build URL. " +  re.message, "500103" ); 
    }
    executor.ready();
 }
 

 function toHex(str) {
    var hex = 0;
    for(var i=0;i<str.length;i++) {
        hex = hex+parseInt(str.charCodeAt(i));
    }
    //return only the numbers from the HEX string
    return parseInt(hex);
}