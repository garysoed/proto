// web.js
var express = require('express');
var logfmt = require('logfmt');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var app = express();
var server = require('./server');

// Register middlewares.
app.use(logfmt.requestLogger());
app.use(bodyParser.urlencoded());
app.use(methodOverride());
app.use('/', express.static(__dirname + '/public'));

// Register error handling.
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.send(400, err.stack);
});

app.engine('html', ejs.renderFile);

// Handle requests.
app.get('/', function(req, res) {
  res.render(__dirname + '/public/main.html');
});
app.post('/newGame', function(req, res) {
  res.send(server.newGame());
});
app.post('/sendUpdate', function(req, res) {
  server.sendUpdate(req.body);
  res.send(200);
});
app.get('/getUpdates', function(req, res) {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'retry': '10000'
  });

  var result = server.getUpdates(req.query, res);
  if (result) {
    sendEvent(res, 'init', result);
  }
});

// Listen to a port, so the process still runs.
var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log('Listening on ' + port);
});
