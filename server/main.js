// web.js
var express = require('express');
var logfmt = require('logfmt');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var app = express();
var requirejs = require('requirejs');
var config = require('./config');
requirejs.config(config);

console.log(__dirname);

requirejs(['server'], function(Server) {
  var server = new Server();

  // Register middlewares.
  app.use(logfmt.requestLogger());
  app.use(bodyParser.urlencoded());
  app.use(methodOverride());
  app.use('/scripts', express.static(__dirname + '/../web/scripts'));
  app.use('/bower_components', express.static(__dirname + '/../bower_components'));
  app.use('/common', express.static(__dirname + '/../common'));

  // Register error handling.
  app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.send(400, err.stack);
  });

  app.engine('html', ejs.renderFile);

  // Handle requests.
  app.get('/', function(req, res) {
    res.render(__dirname + '/../web/main.html');
  });
  app.post('/create', function(req, res) {
    res.send(server.create());
  });
  app.post('/join', function(req, res) {
    var params = req.body;
    server.join(params.gameId, params.userId);
    res.send(200);
  });
  app.post('/leave', function(req, res) {
    var params = req.body;
    server.leave(params.gameId, params.userId);
    res.send(200);
  });
  app.get('/stream', function(req, res) {
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'retry': '10000'
    });
    var params = req.query;
    server.stream(params.gameId, params.userId, res);
  });
  app.post('/msg', function(req, res) {
    var params = req.body;
    server.msg(params.gameId, params.msg);
    res.send(200);
  });
  app.post('/sync', function(req, res) {
    var params = req.body;
    server.sync(params.gameId, params.gameState);
    res.send(200);
  });
  app.post('/syncack', function(req, res) {
    var params = req.body;
    server.syncAck(params.gameId, params.gameState);
    res.send(200);
  });


  // Listen to a port, so the process still runs.
  var port = Number(process.env.PORT || 5000);
  app.listen(port, function() {
    console.log('Listening on ' + port);
  });

});
