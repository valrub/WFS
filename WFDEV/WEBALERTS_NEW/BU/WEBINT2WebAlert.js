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
	var QueryName = reqq.body.QueryName;
	var crawlerCycleId = reqq.body.crawlerCycleId;
	logger.info('<--------------------------------------------------------')
	logger.info("[" + QueryName + ":" + crawlerCycleId + "] - getLiveQueries (usr:" + usr + " pwd:" + pwd + ")");
	
    request(endPoint, { json: true }, (err, res, body) => {
		
		if(res.body.error) {
			logger.error(res.body.data);
		}
		
		if (err) { 
			logger.info(err);
			return logger.info(err); 
		}
		logger.info('Done');
		logger.info('-------------------------------------------------------->')
		ress.send(JSON.stringify(body));
	}).auth(usr, pwd, false );
})

app.post('/getLiveQResults', function(reqq, ress, next) {
	
	var searchId = reqq.body.searchId;
	var usr = reqq.body.username;
	var pwd = reqq.body.password;
	var QueryName = reqq.body.QueryName;
	var crawlerCycleId = reqq.body.crawlerCycleId;
	logger.info('<--------------------------------------------------------')
	logger.info(QueryName + ":" + crawlerCycleId + " - getLiveQResults (" + JSON.stringify(reqq.body) + ")");
	
	const endPoint = config.WebAlerAPIuri + 'queries/live/data';
	var uri = endPoint + '?format=json&query_id=' + searchId + '&order_field=internal_created&chunk=' + config.RequestDefaults.chunk;
	
	logger.info('URI = ' + uri);

    request(uri, { json: true }, (err, res, body) => {
		
		if (err) { return logger.info(err); }
		
		if(res.body.error) {
			logger.error('Completed with errors: ' + res.body.data);
		}else{
			var remainderPosts = body.remainder_posts;
			var cntReturned = body.data.length;

			logger.info('Completed successfully. Recieved [' + cntReturned + '] rows. Rest[' + remainderPosts + ']');
		}
		
		logger.info('-------------------------------------------------------->');
		
		
		ress.send(JSON.stringify(body));

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