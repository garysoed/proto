// web.js
var express = require('express');
var logfmt = require('logfmt');
var fs = require('fs');
var app = express();
var process = require('process');

app.use(logfmt.requestLogger());

app.use('/', express.static(__dirname + '/public'));
app.get('/', function(req, res) {
  res.render(__dirname + '/public/main.html');
});

var data = {};
var maxId = 0;
app.get('/test', function(req, res) {
  var clientId = null;
  if (!req.get('clientId')) {
    clientId = maxId++;
  }
  res.set('clientId', clientId);
  res.set('data', req.get('data'));
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
