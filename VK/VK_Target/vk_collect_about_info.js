function main(re, ie, oe, executor) {
    //=====================================================================
    //Initialize Global Settings
    setGlobalLogger(re, ie, oe, executor);




	executionContext = {
		globalLogExtracted: false, //change to false before release;
		globalWPXP: xpaths.VK_Target
	};

	var _extract = new Extract(executionContext);
	var _process = new Process();

    //------------- VAL : check that VA is really loged in ---------------
//setTimeout(function(){
    var vProfileName = _extract.GetText({
                xpathName: ".//div[@class='top_profile_name']",
        		mandatory: "0"
			},
			"ProfileName"
		).Value;
        Logger.production('Try to login. vProfileName = ' + vProfileName)
        
        if(!(vProfileName === null)){
    		Logger.production("The agent logged in successfully!!!");
			
		}else{
    	    Logger.failure("The agent did not log in! The flow will fail!!!", "400020");
            executor.ready();
		}
//}, 3000);
// --------------------------------------------------------------------





	//=====================================================================
	// GLOBAL VARIABLES

	var collectedAuthors = [];
	var theTargetID = "";
	var cntItems = 0;
	var totalAuthors = 0;
	var _tmp;

	//=====================================================================
	var CAName = "VK About Collect";
	Logger.production(CAName + " Start Time: " + new Date());

	//===============================================================================
	// -------------------  Here extract logic begins  ------------------------------

	_process.Run(collectTargetEntity, true, {
		pMarker: '1',
		functionName: 'collectTargetEntity'
	});

	Logger.production('------------- 1 -----------------');
	_process.Run(collectKeyValues, false, {
		pMarker: '2',
		functionName: 'collectKeyValues'
	});

	Logger.production('------------- 2 -----------------');
	_process.Run(collectAboutInfo, false, {
		pMarker: '3',
		functionName: 'collectAboutInfo'
	});

	Logger.production('------------- 3 -----------------');

	// ----------------------------- HANDLERS  --------------------------------------
	function collectTargetEntity(pMarker, pContext) {

		cntItems = 0;
		var _res = {
			totalCollected: 0,
			returnCode: ""
		};

		try {
              
            //Check for hidden profile
            var vHiddenProfile = _extract.GetText({
					xpathName: "vHiddenProfile",
					mandatory: "0"
				},
				pMarker + "0"
			).Value;
            
            if (vHiddenProfile === "Profile hidden") {
                Logger.failure("The target profile is hidden. It can only be accessed with a logged in agent. Check the agent.", "400020");
            }
            
            //Check for blocked profile
            var vBlockedProfile = _extract.GetText({
                    xpathName: "vBlockedProfile",
					mandatory: "0"
				},
				pMarker + "0"
			).Value;
            
            if (vBlockedProfile) {
                Logger.failure("The target profile is blocked.");
            }          
            
			var vAccountID = _extract.GetText({
					xpathName: "tTargetName",
					mandatory: "1"
				},
				pMarker + "-1"
			).Value;

			var vFullName = _extract.GetText({
					xpathName: "tTargetName",
					mandatory: "1"
				},
				pMarker + "-2"
			).Value;

			var vImageURL = _extract.GetAttribute({
					xpathName: "aAvatarURL",
					attributeName: "src",
					mandatory: "0"
				},
				pMarker + "-3"
			).Value;

			var aFriendsPageUrl = _extract.GetAttribute({
					xpathName: "aFriendsPageUrl",
					attributeName: "href",
					mandatory: "0"
				},
				pMarker + "-4"
			);

			if (aFriendsPageUrl.returnCode === "200") {
				re.gender = aFriendsPageUrl.Value; // used to load the friends page
				Logger.production("The target profile has a friends list: " + re.gender);
			} else {
				re.placeholder1 = false;
				Logger.production("The target profile has no friends list. " + aFriendsPageUrl.returnCode);
			}

			
			
			var aPhotosPageUrl = _extract.GetAttribute({
					xpathName: "aPhotosPageUrl",
					attributeName: "href",
					mandatory: "0"
				},
				pMarker + "-05"
			);

			if (aPhotosPageUrl.returnCode === "200") {
				re.placeholder2 = aPhotosPageUrl.Value; // used to load the friends page
				Logger.production("The target profile has a friends list: " + re.placeholder2);
			} else {
				re.placeholder1 = false;
				Logger.production("The target profile has no friends list. " + aPhotosPageUrl.returnCode);
			}
			

			
			// Save target entity -------------------------------------------

            //Logger.production('VAL-1');

			var target = {};

			target.itemType = "4"; // Web Entity
			target.type = "1"; // Person
			target.activityType = "1"; // Social Network
			target.title = vFullName;
			target.imageUrl = vImageURL;
            target.url = window.location.href; //Current page
            
			
			
			if(document.evaluate(".//div[@class = 'counts_module']", document, null, 9, null).singleNodeValue)
			{
				Logger.production('It is personal VK account: ' + window.location.href.toString().match(/https:\/\/vk\.com\/(.+)/)[1]);
			}else{
				Logger.failure('Not VK person - not supported.');
			}


            //Logger.production('VAL-2');
            var preID = window.location.href.toString().match(/https:\/\/vk\.com\/(.+)/)[1];
			
            


            Logger.production('VAL777-1: Try to login. preID = ' + preID)
            

			var rightID; 

			try //Id could be in format id123456 
				//tHEN - let's clean out "id" in case it exists because in other places it will appear without it (only digits)
			{
				rightID = preID.match(/id(.+)/)[1];
				Logger.production('Account ID is id12345 style = ' + rightID);

			} //or it could be just a name like mike.smith or zubbrr123
			catch(e)
			{
				var isNotGroup = document.evaluate(".//div[@class='counts_module']/a[contains(@href, '/friends?id=')]", document, null, 9, null).singleNodeValue;
				//Change this logic! Doesn't work when there are no friends
				if(!isNotGroup)
					{
						Logger.failure('VK Group - not supported.');
					}
					else
					{
						rightID = document.evaluate(".//div[@class='counts_module']/a[contains(@href, '/friends?id=')]", document, null, 9, null).singleNodeValue.getAttribute("href").match(/(\/friends\?id=)(\d+)(&section=all)/)[2];
						Logger.production('Account ID is NOT id12345 style = ' + preID + " so ID was found -->" + rightID);
					}


				
			}

            Logger.production('VAL-3');





            //target.externalId = hashCode(window.location.href.toString().match(/https:\/\/vk\.com\/(.+)/)[1]);
            target.externalId = hashCode(rightID);

            //target.description = rightID; //VAL

			theTargetID = target.externalId;
			re.targetId = theTargetID;
			cntItems++;

			if (!collectedAuthors.hasOwnProperty(target.externalId)) {
				collectedAuthors[target.externalId] = true;

				totalAuthors++;
				addImage(target);
				cntItems++;
			}


            //Logger.production('VAL-4');
			// Save IsMonitored entity -------------------------------------------
			var TargetIsMonitoredEntity = {};

			TargetIsMonitoredEntity.itemType = "18";
			TargetIsMonitoredEntity.parent_externalId = theTargetID.toString();
			TargetIsMonitoredEntity.parentObjectType = "4";

			addEntity(TargetIsMonitoredEntity);

			Logger.production("Is Monitored - added for " + theTargetID);

			//--------------------------------------------------------------------

			_res.totalCollected = cntItems;
			_res.returnCode = "200";
			return _res;
		} catch (e) {
			_res.returnCode = "504 " + e.message;
			return _res;
		}
	}
	//....................................................

	function getInfo(thisNode, parentExternalId) {
		for (var key in aboutInfoStructure) {
			if (aboutInfoStructure.hasOwnProperty(key)) {
				if (aboutInfoStructure[key].label === thisNode.textContent) {
					var vRowValue = _extract.GetText({
							xpathName: ".//*[contains(@class,'label fl_l') and contains(text(),'" + aboutInfoStructure[key].label + "')]/following-sibling::div",
							mandatory: "0"
						},
						"RowValue"
					).Value;

					var entity = {
						itemType: aboutInfoStructure[key].entityItemType,
						type: aboutInfoStructure[key].entityType,
						body: vRowValue,
						title: aboutInfoStructure[key].label,
						url: "no url given",
						description: vRowValue,
                        activityType: "2"
					};

					if (aboutInfoStructure[key].entityItemType !== "4") {
						entity.parent_externalId = parentExternalId;
						entity.parentObjectType = "4";

						if (aboutInfoStructure[key].entityItemType === "15") {
							entity.writer_externalId = parentExternalId;
						}
					} else {

						entity.externalId = vRowValue + parentExternalId;
						if (aboutInfoStructure[key].relationType !== "") {
							var rel = {};
							rel.parent_externalId = parentExternalId;
							rel.parentObjectType = "4";
							rel.activityType = "2";
							rel.description = aboutInfoStructure[key].label;
							rel.title = aboutInfoStructure[key].label;
							rel.type = aboutInfoStructure[key].relationType;
							rel.itemType = "12";
							rel.sideB_externalId = entity.externalId;
							rel.sideB_ObjectType = "4";
							addEntity(rel);
						}
					}
					addEntity(entity);
				}
			} else {
				Logger.production("New about info label added by VK: " + thisNode.textContent);
			}
		}
	}

	function collectAboutInfo(pMarker, pContext) {
		try {

			cntItems = 0;
			var _res = {
				totalCollected: 0,
				returnCode: ""
			};

			_tmp = _extract.GetCollection({
					xpathName: "vInfoRowLabel",
					mandatory: "0"
				},
				pMarker
			);

			if (_tmp.returnCode === "200") {
				var iterator = _tmp.Value;
				var thisNode = iterator.iterateNext();

				while (thisNode) {
					cntItems++;
					getInfo(thisNode, theTargetID);
					thisNode = iterator.iterateNext();
				}
				_res.totalCollected = cntItems;
				_res.returnCode = "200";
			} else { //No info found
				_res.totalCollected = 0;
				_res.returnCode = "204";
			}

		} catch (e) {
			Logger.error("collectAboutInfo('collectAboutInfo', '5' - DID NOT WORK - " + e.message);
			_res.totalCollected = cntItems;
			_res.returnCode = "504 " + e.message;
		}
		return _res;
	}

	function collectKeyValues(pMarker, pContext) {
		try {
			cntItems = 0;
			var _res = {
				totalCollected: 0,
				returnCode: ""
			};
			var counters = _extract.GetCollection({
					xpathName: "vKeyValueCounters",
					mandatory: "0"
				},
				pMarker
			);

			if (counters.returnCode === "200") {
				var i = counters.Value;
				var thisNode = i.iterateNext();

				while (thisNode) {
					cntItems++;
					var vCount = _extract.GetText({
							context: thisNode,
							xpathName: "./*[contains(@class, 'count')]",
							mandatory: "0"
						},
						"vPostText"
					).Value;

					var vLabel = _extract.GetText({
							context: thisNode,
							xpathName: "./*[contains(@class, 'label')]",
							mandatory: "0"
						},
						"vPostText"
					).Value;

					var keyValue = {};
					keyValue.itemType = "24";
					keyValue.body = vCount;
					keyValue.title = vLabel;
					keyValue.description = vLabel;
					keyValue.parent_externalId = theTargetID;
					keyValue.parentObjectType = "4";

					thisNode = i.iterateNext();
					addEntity(keyValue);
				}
                _res.totalCollected = cntItems;
    			_res.returnCode = "200";
			} else { //No info found
				_res.totalCollected = 0;
				_res.returnCode = "204";
			}

		} catch (e) {
			Logger.error("collectKeyValues('collectKeyValues', '5' - DID NOT WORK - " + e.message);
			_res.totalCollected = cntItems;
			_res.returnCode = "504 " + e.message;
		}
		return _res;
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

	Logger.production(CAName + " End Time: " + new Date());
	finalize();

}