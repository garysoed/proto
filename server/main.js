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

app.get('/', function(req, res) {
  res.render(__dirname + '/public/main.html');
});
app.post('/register', function(req, res) {
  var gameId = server.register(req.param('userId'), req.param('gameId'));
  res.send({gameId: gameId});
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log('Listening on ' + port);
});
