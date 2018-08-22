function main(re, ie, oe, executor) {
    setGlobalLogger(re, ie, oe, executor);
    try {
        
        
         var urlsArray =  ie.urlArray.split(',')
         
         re.placeholder3 = urlsArray.length > 0 ? 'true' : 'false';
         re.placeholder2 = urlsArray.shift();
         re.placeholder1 = urlsArray.join();
         re.placeholder4 = '';
         re.placeholder7 = (1 + urlsArray.length).toString();
        Logger.production('Input Urls are ' + re.placeholder1);
        Logger.production('First Url is ' + re.placeholder2);
        Logger.production('While Condition is ' + re.placeholder3);
        Logger.production('Download video option  ' + ie.downloadVideoFiles);
        
        //this is
        
    } catch (e) {
        Logger.failure(e.message);
    }
    finalize();
 }