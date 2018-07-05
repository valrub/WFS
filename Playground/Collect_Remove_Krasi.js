function scrollDown() {
    try {
        //var maxUrls = Number(ie.max_posts);
        var urls = [];
        var count = 0;
        var noMore = false;
        var secondStop = 0;
        var nextBulk = false;

        var posts = document.evaluate(".//main[@role = 'main']//article/div//a[not(contains(text(), 'Load more'))]", document, null, 7, null);
        if (!posts) {
            console.log("no found posts or xpath changed  ", "400011");
        }

        var interval = setInterval(function() {
            if (noMore || urls.length > 50) {
                clearInterval(interval);
                console.log(urls);
            } else {
                var post = document.evaluate(".//main[@role = 'main']//article/div//a[not(contains(text(), 'Load more'))]", document, null, 9, null).singleNodeValue;
                if (post) {
                    window.scrollBy(0, 20);
                    collectUrls(post);
                } else {
                    noMore = true;
                }

            }

        }, 1000);



        if (posts) {
            collectUrls(posts.snapshotItem(0));
        } else {
            noMore = true;
        }

        function collectUrls(post) {

            var currentPost = post
            if (post) {
                var id = currentPost.href.split('/')[4];
                var url = "https://www.instagram.com/p/" + id + "/?__a=1";
                var response = '';
                try {
                    console.log("call to API: " + url);
                    var xhttp = new XMLHttpRequest();
                    xhttp.onreadystatechange = function() {
                        if (this.readyState == 4 && this.status == 200) {
                            console.log("response pushed to postJSONarray");
                            response = JSON.parse(xhttp.responseText);
                        }
                    };
                    xhttp.open("GET", url, false);
                    xhttp.send();
                } catch (error) {
                    console.log("call to API: " + error);
                }

                if (parseInt(response.graphql.shortcode_media.taken_at_timestamp) * 1000 > 1022850931715) {
                    urls.push(currentPost.href);
                } else {
                    noMore = true;
                }

                currentPost.remove();
            } else {
                noMore = true;
            }


        }



    } catch (e) {
        console.log("scrollDown() :: " + e + " at line " + e.lineNumber);
    }
}


scrollDown();
