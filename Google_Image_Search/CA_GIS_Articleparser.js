function main(runtimeEntity, inputEntity, outputEntity, executor) {
    setGlobalLogger(runtimeEntity, inputEntity, outputEntity, executor);

    Logger.production('SEE HTML: ' + runtimeEntity.articleBody);

    if(runtimeEntity.restApiUrl)
    {
        try {

            Logger.production('VAL-1');

            var parsedInfo = JSON.parse(runtimeEntity.searchResults);
            Logger.production('VAL-1-1');
            var xhr = new XMLHttpRequest();
            Logger.production('VAL-1-2-1');
            Logger.production('VAL-1-2-2 ' + runtimeEntity.restApiUrl);
            xhr.open("POST", runtimeEntity.restApiUrl + "text/getMainText", false);
            Logger.production('VAL-1-3');
            xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            Logger.production('VAL-2');
            xhr.send(JSON.stringify({
                "text": runtimeEntity.articleBody,
                "minLenght": "100",
                "parseMethod": "News"
            }));

            Logger.production('VAL-3');
            if (xhr.status == 200) {
                Logger.production("Received the parsed web page info: " + parsedInfo[runtimeEntity.placeholder4].url);
                if (xhr.readyState == 4) {
                    Logger.production('VAL-4');
                    response = JSON.parse(xhr.responseText);
                }
                var maintextResult = {};
                for (i in response.items) {
                    Logger.production('VAL-5 i= ' + i);
                    if (response.items[i].key == "mainText") {
                        maintextResult.content = response.items[i].value.replace(/<[^>]*>/g, "");
                        break;
                    }
                }

                Logger.production('VAL-6');
                executor.addEntity({
                    externalId: "full_" + parsedInfo[runtimeEntity.placeholder4].externalId,
                    itemType: "3",
                    type: "1",
                    parent_externalId: parsedInfo[runtimeEntity.placeholder4].externalId,
                    parentObjectType: "5", //Image
                    activityType: "1",
                    writer_externalId: parsedInfo[runtimeEntity.placeholder4].writer_externalId,
                    url: parsedInfo[runtimeEntity.placeholder4].url,
                    title: parsedInfo[runtimeEntity.placeholder4].title,
                    body: maintextResult.content
                });
            } else {
                Logger.production('VAL-7');
                var logInfo = (xhr.status).toString() + " status returned from our API when getting the body of the current page: " + parsedInfo[runtimeEntity.placeholder4].url;
                Logger.error(logInfo);
            }
        } catch (e) {
            Logger.failure("Exception thrown while generating the search results' article " + e);
        }
        Logger.production("Collecting page ended.");
        executor.ready();
    }else
    {
        Logger.error('runtimeEntity.restApiUrl is not defined' + ' all data is collected');
        executor.ready();
    }
}