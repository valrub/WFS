
var aPostUrl = 'https://vk.com/wall1141116_69525';

if (!(/https:\/\/vk.com/g.test(aPostUrl))) {
				aPostUrl = "https://vk.com" + aPostUrl;
				console.log("1 aPostUrl : " + aPostUrl);
			} else {
				console.log("2 aPostUrl : " + aPostUrl);
			}