// web.js
var express = require('express');
var logfmt = require('logfmt');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var app = express();

var Server = require('./server');
var Uris = require('../common/uris');
var ClientError = require('../common/clienterror');

var server = new Server();

// Register middlewares.
app.use(logfmt.requestLogger());
app.use(bodyParser.urlencoded());
app.use(methodOverride());

var statics = {
  'bower_components': '/../bower_components',
  'common': '/../common',
  'lib': '../web/lib',
};
for (var key in statics) {
  app.use('/' + key, express.static(__dirname + statics[key]));
}
app.use('/', express.static(__dirname + '/../web'));

app.engine('html', ejs.renderFile);

// Handle requests.
app.get('/', function(req, res) {
  res.render(__dirname + '/../web/main.html');
});
app.post('/' + Uris.Request.CREATE, function(req, res) {
  res.send(server.create());
});
app.post('/' + Uris.Request.JOIN, function(req, res, next) {
  var params = req.body;
  server.join(params.gameId, params.userId);
  res.send(200);
});
app.post('/' + Uris.Request.LEAVE, function(req, res) {
  var params = req.body;
  server.leave(params.gameId, params.userId);
  res.send(200);
});
app.get('/' + Uris.Request.STREAM, function(req, res) {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'retry': '10000'
  });
  var params = req.query;
  server.stream(params.gameId, params.userId, res);
});
app.post('/' + Uris.Request.MESSAGE, function(req, res) {
  var params = req.body;
  server.msg(params.gameId, params.msg);
  res.send(200);
});
app.post('/' + Uris.Request.SYNC, function(req, res) {
  var params = req.body;
  server.sync(params.gameId, params.userId);
  res.send(200);
});
app.post('/' + Uris.Request.SYNC_ACK, function(req, res) {
  var params = req.body;
  server.syncAck(params.gameId, params.userId, params.gameState);
  res.send(200);
});
app.get('*', function(req, res, next) {
  res.send(404);
});

// Register error handling.
app.use(function(err, req, res, next) {
  if (err instanceof ClientError) {
    console.dir(err.stack);
    res.send(400, {code: err.code, message: err.message, debug: err.stack});
  } else {
    res.send(500, {code: 500, message: err.message, debug: err.stack});
  }
});


// Listen to a port, so the process still runs.
var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log('Listening on ' + port);
});
