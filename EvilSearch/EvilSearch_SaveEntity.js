function main(runtimeEntity, inputEntity, outputEntity, executor) {
     
     
    setGlobalLogger(runtimeEntity, inputEntity, outputEntity, executor, debugLevel = 4);


	//Creating a date of today
	var m_today = new Date();
	var dd = m_today.getDate();
	var mm = m_today.getMonth()+1; //January is 0!
	var yyyy = m_today.getFullYear();
	m_today = yyyy+'/'+mm+'/'+dd;
	
	// var SiteUrl = "http://hss3uro2hsxfogfq.onion";

	// // Creating a "Web Entity/Profile"
	// var objWebEnt = {
	// 	externalId:window.btoa(SiteUrl), 
	// 	itemType:'4',
	// 	type:'1', 
	// 	title:'Not Evil Search',
	// 	activityType:'4', 
	// 	body:'Do not be Evil: no ads, no logs, just search',
	// 	authorProfileUrl:SiteUrl, 
	// 	url:SiteUrl
	// 	};
    
    //         Logger.debug(JSON.stringify(objWebEnt));
	// executor.addEntity(objWebEnt);
	
	var TopicExternalId = runtimeEntity.imageUrl;
	var Title = runtimeEntity.title;
	//var Title = runtimeEntity.gender;
	var Body = runtimeEntity.body;
	
	// Creating a "Topic/Post" 
	var objTopic = {
		externalId:window.btoa(TopicExternalId),
		itemType:'2',
		parent_externalId:window.btoa(SiteUrl),
		parentObjectType:'4',
		activityType:'4',
		url:TopicExternalId,
		title:Title,
		body:Body,
		description:"",
		writeDate:m_today,
		writer_externalId:window.btoa(SiteUrl)
		};
            Logger.debug(JSON.stringify(objTopic));
	executor.addEntity(objTopic);
	
	executor.ready();
 }
