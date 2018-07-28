function main(re, ie, oe, executor) {
    //=====================================================================
    if(re.executionContext.indexOf("friends") === -1) {
        executor.ready();
    }
    //Initialize Global Settings
    setGlobalLogger(re, ie, oe, executor);
    

	executionContext = {
		globalLogExtracted: false, //change to false before release;
		globalWPXP: xpaths.VK_Target
	};

	var _extract = new Extract(executionContext);
	var _process = new Process();

	//=====================================================================
	// GLOBAL VARIABLES

	var collectedAuthors = [];
	var theTargetID = re.targetId;
	var cntItems = 0;
	var totalAuthors = 0;
	var _tmp;

	//=====================================================================
	var CAName = "VK Wall Collect";
	Logger.production(CAName + " Start Time: " + new Date());

	//===============================================================================
	// -------------------  Here extract logic begins  ------------------------------

	_process.Run(collectFriends, false, {
		pMarker: '5',
		functionName: 'collectFriends'
	});

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

	function collectFriends(pMarker, pContext) {
		try {
			cntItems = 0;
			var _res = {
				totalCollected: 0,
				returnCode: ""
			};

			var ttmp = _extract.GetCollection({
					xpathName: "vFriends",
					mandatory: "0"
				},
				pMarker
			);

			if (ttmp.returnCode === "200") {
				var iterator = ttmp.Value;
				var thisNode = iterator.iterateNext();
                var i = 0;

				while (thisNode && parseInt(re.placeholder4) > i) {
                    i++;
					var vFriendName = _extract.GetText({
						context: thisNode,
						xpathName: "vFriendName",
						mandatory: "0"
					}, "vFriendName").Value;

					var vFriendUrl = _extract.GetAttribute({
						context: thisNode,
						attributeName: "href",
						xpathName: "vFriendName",
						mandatory: "0"
					}, "vFriendUrl").Value;

					var vFriendAdditionalInfo = _extract.GetText({
						context: thisNode,
						xpathName: "vFriendAdditionalInfo",
						mandatory: "0"
					}, "vFriendAdditionalInfo").Value;

					var aFriendImg = _extract.GetAttribute({
						context: thisNode,
						attributeName: "src",
						xpathName: "aFriendImg",
						mandatory: "0"
					}, "aFriendImg").Value;

					var friend = {};
                    if (!vFriendUrl.indexOf("https")) {
                    	friend.url = vFriendUrl;
                    	friend.externalId = hashCode(vFriendUrl);
                    } else{
                    	friend.url = "https://vk.com" + vFriendUrl;
                    	friend.externalId = hashCode("https://vk.com" + vFriendUrl);
                    }
                    
                    friend.sideB_externalId = vFriendUrl.match(/(https:\/\/vk\.com\/)(.+)/)[2] + '_point_3'; // VAL - CHANGES from WEB-2178

					friend.title = vFriendName;
					friend.itemType = "4";
					friend.type = "1";
					friend.description = vFriendAdditionalInfo;
					friend.image = aFriendImg;
					friend.imageUrl = aFriendImg;
                    friend.activityType = "1";

					addImage(friend);

					var rel = {};
					rel.parent_externalId = theTargetID;
					rel.parentObjectType = "4";
					rel.activityType = "1";
					rel.description = "friend of the target";
					rel.title = "friend of the target";
					rel.type = "1"; //friend
					rel.itemType = "12";
					rel.sideB_externalId = friend.externalId;
					rel.sideB_ObjectType = friend.itemType;
					addEntity(rel);
                    cntItems++;
					thisNode = iterator.iterateNext();
				}
				_res.totalCollected = cntItems;
				_res.returnCode = "200";
			} else { //No info found
				_res.totalCollected = 0;
				_res.returnCode = "204";
			}
		} catch (e) {
			Logger.error("collectFriends('collectFriends', '5' - DID NOT WORK - " + e.message);
			_res.totalCollected = cntItems;
			_res.returnCode = "504 " + e.message;
		}
		return _res;
	}
	Logger.production(CAName + " End Time: " + new Date());
	finalize(true);
}