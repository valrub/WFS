function main(re, ie, oe, executor) {
    try {
        setGlobalLogger(re, ie, oe, executor);
		var t = new Date();
		Logger.production("Second CA started : " + t);
        var whileLoops = parseInt(re.placeholder1);
		whileLoops--;
		Logger.production(whileLoops);
		re.placeholder1 = whileLoops.toString();
		if (whileLoops === 0) {
			re.gender = "false";
		}

		getLiveQueryResults(ie.url, re.chunk, re.sequence);

		var getLiveQueryResults = function (url, chunk, sequence) {
			try {
				var searchTerm = ie.QueryName; //getSearchTerm(url);
				var queryListPath = "queries/live/list";
				var queryDataPath = "queries/live/data?format=json&chunk=" + chunk + "&sequence=" + sequence + "&query_id=";

				callWebAlertAPI(queryListPath)
					.then((list) => {
						return getId(searchTerm, list)
					}).then((id) => {
						return callWebAlertAPI(queryDataPath, id)
					}).then((response) => {
						return parseData(response)
					}).catch((error) => {
						Logger.error(error);
					})

			} catch (e) {
				Logger.failure("Error message: " + e);
			}
		}
		Logger.production(ie.url + " " + re.chunk + " " + re.sequence);

		function getId(name, collection) {
			return new Promise((resolve, reject) => {
				var res = null;
				var coll = JSON.parse(collection);
				for (var i in coll) {
					if (coll[i]['name'] === name) {
						res = coll[i]['query_id'].toString();
						resolve(res)
					}
                   
				}
                if (!res){
                    Logger.failiure('No such query name in the list');
                }
			});
		}

		function getSearchTerm(url) {
			try {
				var reg = /(webalert\.verint\.com\/\S*\/)(.*)/i;
				var searchTerm = url.match(reg)[2];
				return searchTerm;
			} catch (e) {
				Logger.failure("Invalid url structure. Error message: " + e);
			}
		}

		function callWebAlertAPI(path, searchId) {
			if (!searchId) {
				searchId = "";
			}
			var domain = "http://webalert.verint.com/api/v1/";
			var url = domain + path + searchId;
			Logger.production(url)

			return new Promise((resolve, reject) => {
				let xhr = new XMLHttpRequest();
				xhr.open("GET", url);
				xhr.onload = () => {
					if (xhr.status >= 200 && xhr.status < 300) {
						var ta = new Date();
						Logger.production("API response returned: " + ta + " from url: " + url);
						//Logger.production(xhr.response);
						resolve(xhr.response);
					} else {
						Logger.production(xhr.statusText)
						reject(xhr.statusText);
					}
				};
				xhr.onerror = () => reject(xhr.statusText);
				xhr.send(url);
			});
		}

		

		function parseData(response) {
			let collectedAccounts = [];

			let responseObj = JSON.parse(response);
			// let leftPosts = responseObj.remainder_posts;
			re.remainderPosts = responseObj.remainder_posts;
			responseObj = responseObj.data;

			var ti = new Date();
			Logger.production("Parsing started: " + ti);

			for (var i = 0; i < responseObj.length; i++) {
				let author = {};
				author.externalId = responseObj[i].author.author_service_id;
				author.itemType = "4"; // Web Entity
				author.type = "1"; // Person
				author.activityType = "1"; // Social Network
				author.url = responseObj[i].author.link;
				author.title = responseObj[i].author.name;
				author.imageUrl = responseObj[i].author.avatar;
				collectedAccounts.push(author);

				if (!('' + author.externalId in collectedAccounts)) {
					collectedAccounts[' ' + author.externalId] = true;
					//if (ie.downloadImages == 'true') {
						addImage(author);
					//} else {
					//	addEntity(author);
					//}

				} else {
					Logger.debug("The account (" + author.title + ") is already collected.");
				}

				let post = {};
				post.externalId = responseObj[i].interaction.internal_id;
				post.itemType = "2"; // Topic
				post.parent_externalId = author.externalId;
				post.parentObjectType = "4"; // Web Entity
				post.activityType = "1"; // Social Network
				post.url = responseObj[i].interaction.link;
				post.body = responseObj[i].interaction.content;
				post.writeDate = responseObj[i].interaction.created_original_date;
				post.writer_externalId = author.externalId;
				post.imageUrl = responseObj[i].interaction.media;
                
                

				if (responseObj[i].interaction.sub_type === "image"){ // && ie.downloadImages == 'true') {
					post.itemType = "5"; // Image
					addImage(post);
				} 
                else {
					post.itemType = "2"; // Post
					addEntity(post);
				}
				re.sequence = responseObj[i].interaction.sequence;
			}
			var te = new Date();
			Logger.production("Second CA and parsing ended: " + te);

			finalize();

		}
	} catch (e) {
		Logger.failure(e)
	}
}