var express = require('express');
var bodyParser = require('body-parser');
var logger = require('./logger');
var app = express();
const config = require('./config');

app.use(bodyParser.json());
var request = require('request');



app.post('/getLiveQueries', function(reqq, ress, next) {
	const endPoint = config.WebAlerAPIuri + 'queries/live/list';
	
	var usr = reqq.body.username; 
	var pwd = reqq.body.password; 
	var QueryID = reqq.body.QueryID;
	var crawlerCycleId = reqq.body.crawlerCycleId;
	logger.info('<--------------------------------------------------------')
	logger.info("[" + QueryID + ":" + crawlerCycleId + "] - getLiveQueries (usr:" + usr + " pwd:" + pwd + ")");
	
    request(endPoint, { json: true }, (err, res, body) => {
		
		if(res.body.error) {
			logger.error('ERROR: ' + res.body.data);
		}
		
		if (err) { 
			logger.info(err);
			return logger.info(err); 
		}
		
		logger.info('Done');
		logger.info('-------------------------------------------------------->')
		logger.error('LIST OF LIVE QUERIES: ' + JSON.stringify(body));
		ress.send(JSON.stringify(body));
	}).auth(usr, pwd, false );
})

app.post('/getLiveQResults', function(reqq, ress, next) {
	
	var searchId = reqq.body.searchId;
	var usr = reqq.body.username;
	var pwd = reqq.body.password;
	var QueryName = reqq.body.QueryName;
	var crawlerCycleId = reqq.body.crawlerCycleId;
	var sequence = reqq.body.sequence;
	
	
	logger.info('<------------------ STARTING ITERATION --------------------------------------')
	logger.info('sequence = ' + sequence);

	var seqPart; 
	if (sequence !== 'THE_FIRST_CALL') { // This is not the first iteration
		seqPart = '&sequence=' + sequence;
	}else{
		seqPart = '';
	}
	
	
	logger.info(QueryName + ":" + crawlerCycleId + " - getLiveQResults (" + JSON.stringify(reqq.body) + ")");
	
	const endPoint = config.WebAlerAPIuri + 'queries/live/data';
	var uri = endPoint + '?format=json&query_id=' + searchId + '&order_field=internal_created&chunk=' + config.RequestDefaults.chunk +seqPart;;
	
	logger.info('URI = ' + uri);

    request(uri, { json: true }, (err, res, body) => {
		
		if (err) { return logger.info(err); }
		
		if(res.body.error) {
			logger.error('Completed with errors: ' + res.body.data);
		}else{
			
			
			var remainderPosts = body.remainder_posts;
			
			logger.info('remainderPosts = ' + remainderPosts);
			
			if(remainderPosts == 0)
			{
				logger.info('Completed successfully. No more results');
				var noResults = {"data":[{}],"remainder_posts":0};
				ress.send(noResults);
				
			}else{
				var cntReturned = body.data.length;
				logger.info('Completed successfully. Recieved [' + cntReturned + '] rows. Rest[' + remainderPosts + ']');
				ress.send(JSON.stringify(body));
			}
			
			
		}
		
		logger.info('------------------------ FINISHING ITERATION -------------------------------->');
		
		
		

	}).auth(usr, pwd, false );

})


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.listen(config.port, function() {
    logger.info('WebAlert API app - started')
})