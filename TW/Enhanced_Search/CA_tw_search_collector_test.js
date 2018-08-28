function main(re, ie, oe, executor) {
    
    setGlobalLogger(re, ie, oe, executor);

    if (re.collectPosts == 'true') {//collect TWEETS
        setExecutor(re, ie, oe, executor);
        Logger.production("Tweets search started...");
        re.MaxLinks = 0;
        searchTweets(ie.keyword);
        if (re.collectLinksInTweets == 'true') {
            Logger.production("Links in Tweets will be collected...");   
        }
        re.tweetWithCoordinates = setListOfTweets();
        Logger.production("Tweets search ended.");
        finalizeScraping();
    } else {
        Logger.production("No tweets will be collected according to input.");
        executor.ready();
    }
}