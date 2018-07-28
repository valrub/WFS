function main(re, ie, oe, executor) {
    setGlobalLogger(re, ie, oe, executor);
    //Scrolls down the search results page to load all the images
    try {

        var xpath = '';
        if (/likes/.test(re.gender)) {
            xpath = ".//*[contains(@class, 'fans_fan_row inl_bl')]";
            Logger.production('Collect likers will be fired because condition of likers is ' + re.placeholder6);
            collectLikers(xpath, parent);
        } else if (/shares/.test(re.gender)) {
            Logger.production('Collect sharers will be fired because condition of sharers is ' + !re.placeholder6);
            xpath = ".//div[contains(@class, '_post post post_copy')]";
            collectSharers(xpath, parent);
        }

    } catch (e) {
        Logger.error(" In CA CollectEntities - DID NOT WORK - " + e.message);
        finalize();
    }

    function collectLikers(xpath, parent) {
        Logger.production('In CollectLikers Function');
        var likers = document.evaluate(xpath, document, null, 7, null);
        Logger.production('Likers are ' + JSON.stringify(likers.snapshotLength));

        if (likers !== null) {
            var max = likers.snapshotLength;
            if (likers.snapshotLength > re.collectionCount) {
                max = re.collectionCount;
                Logger.production("number of records to be collected : " + max);
            }
            Logger.production(" In collectLiekrs ");

            for (var i = 0; i < max; i++) {

                var curr = likers.snapshotItem(i);
                var likerId = curr.getAttribute("data-id"); //VAL-1
                Logger.production('Liker ' + i + ' data id is  ' + likerId);
                var likerImage = document.evaluate(".//img", curr, null, 9, null).singleNodeValue.getAttribute("src");
                Logger.production('Liker ' + i + ' Image is  ' + likerImage);
                var likerName = document.evaluate(".//img", curr, null, 9, null).singleNodeValue.getAttribute("alt");
                Logger.production('Liker ' + i + ' Name is  ' + likerName);

                if (likerImage.indexOf("vk.com/") === -1) {
                    if (likerImage.indexOf("userapi") === -1) {
                        likerImage = 'https://vk.com' + likerImage;
                    }
                }


                var liker = {};
                liker.externalId = hashCode(likerId);

                //liker.description = likerId + " likerId + line 55"; //VAL

                liker.itemType = "4";
                liker.url = "https://vk.com/id" + likerId;
                liker.sideB_externalId = likerId + 'point_4'; // VAL - CHANGES from WEB-2178
                liker.type = "1";
                liker.title = likerName;
                liker.extractDate = "";
                liker.activityType = "1";
                liker.imageUrl = likerImage;
                addImage(liker);
                //  console.log(liker);
                Logger.production('liker ' + i + ' is ' + JSON.stringify(liker));

                var likeEntity = {};
                likeEntity.externalId = re.parentExtId + "_" + liker.externalId;
                likeEntity.itemType = "3"; // Comment
                likeEntity.type = "2"; // Like
                likeEntity.parent_externalId = re.parentExtId;
                likeEntity.parentObjectType = re.parentType;
                likeEntity.activityType = "1"; // Social Network
                likeEntity.url = re.parentUrl;
                likeEntity.writer_externalId = liker.externalId;
                addEntity(likeEntity);
                // console.log(likeEntity);
                Logger.production('Liker relation entity is ' + JSON.stringify(likeEntity));
            }
        }
        Logger.production('Out of CollectLikers Function');
        finalize();
    }


    function collectSharers(xpath, parent) {
        Logger.production('In CollectSharers Function');
        var sharers = document.evaluate(xpath, document, null, 7, null);
        Logger.production('Sharers are ' + JSON.stringify(sharers.snapshotLength));

        if (sharers !== null) {
            var max = sharers.snapshotLength;
            if (sharers.snapshotLength > re.collectionCount) {
                max = re.collectionCount;
                Logger.production("number of records to be collected : " + max);
            }
            Logger.production(" In collectSharers ");

            for (var i = 0; i < max; i++) {

                var curr = sharers.snapshotItem(i);
                var sharerId = document.evaluate(".//div[@class = 'post_header_info']//h5/a", curr, null, 9, null).singleNodeValue.getAttribute("data-from-id"); //VAL-1
                Logger.production('Sharer ' + i + ' data id is  ' + sharerId);
                var sharerImage = document.evaluate(".//a[@class = 'post_image']//img|//a[contains(@class,'online mobile')]//img", curr, null, 9, null).singleNodeValue.getAttribute("src");
                Logger.production('Sharer ' + i + ' Image is  ' + sharerImage);
                var sharerName = document.evaluate(".//div[@class = 'post_header_info']//h5/a", curr, null, 9, null).singleNodeValue.textContent;
                Logger.production('Sharer ' + i + ' Name is  ' + sharerName);

                if (sharerImage.indexOf("vk.com/") === -1) {
                    if (sharerImage.indexOf("userapi") === -1) {
                        sharerImage = 'https://vk.com' + sharerImage;
                    }
                }
                var sharer = {};
                sharer.externalId = hashCode(sharerId);

                sharer.description = sharerId + " sharerId line 118";

                sharer.itemType = "4";
                sharer.url = "https://vk.com/id" + sharerId;
                sharer.sideB_externalId = sharerId + 'point_5'; // VAL - CHANGES from WEB-2178
                sharer.type = "1";
                sharer.title = sharerName;
                sharer.extractDate = "";
                sharer.activityType = "1";
                sharer.imageUrl = sharerImage;
                addImage(sharer);
                //console.log(sharer);
                Logger.production('sharer ' + i + ' is ' + JSON.stringify(sharer));

                var shareEntity = {};
                shareEntity.externalId = re.parentExtId + "_" + sharer.externalId;
                shareEntity.itemType = "3"; // Comment
                shareEntity.type = "9"; // ShaRE
                shareEntity.parent_externalId = re.parentExtId;
                shareEntity.parentObjectType = re.parentType;
                shareEntity.activityType = "1"; // Social Network
                shareEntity.url = re.parentUrl;
                shareEntity.writer_externalId = sharer.externalId;
                addEntity(shareEntity);
                //  console.log(shareEntity);
                Logger.production('Sharer relation entity is ' + JSON.stringify(shareEntity));
            }
        }
        Logger.production('Out of CollectSharers Function');
        finalize();
    }


    function hashCode(input) {
        var hash = 0;
        if (input.length === 0) return hash;
        for (var i = 0; i < input.length; i++) {
            var character = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + character;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }


}