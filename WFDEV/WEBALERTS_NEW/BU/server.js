var express = require('express');

var app = express();

var request = require('request');

app.get('/', function(reqq, ress) {
    
    request('https://webalert.verint.com/api/v1/queries/live/data?format=json&sequence=439377350&query_id=16808&order_field=internal_created&chunk=1', { json: true }, (err, res, body) => {
    //ress.send('Hello API - 1');
    if (err) { return console.log(err); }
  
    //console.log(JSON.stringify(body));

    ress.send(JSON.stringify(body));
    }).auth('Moran.livkind@verint.com', 'Webalert1!', false );
})

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.listen(3012, function() {
    console.log('API app - started')
})