/**
 * Execution of Custom Action starts from here. The function is similar to main method in Java 
  * The user MUST call "ready" function of the given executor in order to indicate that all code is executed.
  * Following line will save output entity to database:
  * executor.addEntity({entityField1: 'Field Value 1', entityField2: 'Field Value 2'})
  * 
  * Following function will flush the collected data without stopping the CA execution:
  * executor.flushEntities();
  *
  * Following function is used for reporting errors:
  * executor.reportError(eventCode, eventLevel, errorMessage, failWebflow); 
  * @param {String} eventCode - this is the code for the custom event as it is in the DB table event_types, column CODE.
  * @param {String} eventLevel – the level of reported error (e.g. WARNING, INFO or ERROR); default : "ERROR".
  * @param {String} errorMessage – the actual message.
  * @param {boolean} failWebflow – indicates if the user wants to fail the current task executed by CU. 
  *
  * Use the following function to wrap user function and report an error automatically when such occurs:
  * executor.tryCatch(userFunction, options);
  * @param {Object} [options] - This is optional parameter with properties: data (additional data that the userFunction will use) and context (will be used as "this" in the userFunction).
  *
  * Special variables of runtimeEntity:
  *  - CurrentContextXPath - contains current context xpath. Current contect is for example if 
  * Webflow is inside for-each action. Current for-each element xpath will be written in this variable. 
  * if there is no context value is empty string.
  * 
  * @param {Object} runtimeEntity The runtime entity
  * @param {Object} inputEntity The input entity 
  * @param {Object} outputEntity The output entity 
  * @param {Object} executor Predefined object with commonly used functions and properties. 
 */
function main(runtimeEntity, inputEntity, outputEntity, executor) {
     
     
    setGlobalLogger(runtimeEntity, inputEntity, outputEntity, executor, debugLevel = 4);


	//Creating a date of today
	var m_today = new Date();
	var dd = m_today.getDate();
	var mm = m_today.getMonth()+1; //January is 0!
	var yyyy = m_today.getFullYear();
	m_today = yyyy+'/'+mm+'/'+dd;
	
	var SiteUrl = "http://hss3uro2hsxfogfq.onion";

	// Creating a "Web Entity/Profile"
	var objWebEnt = {
		externalId:window.btoa(SiteUrl), 
		itemType:'4',
		type:'1', 
		title:'Not Evil Search',
		activityType:'4', 
		body:'Do not be Evil: no ads, no logs, just search',
		authorProfileUrl:SiteUrl, 
		url:SiteUrl
		};
    
            Logger.debug(JSON.stringify(objWebEnt));
	executor.addEntity(objWebEnt);
	
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
