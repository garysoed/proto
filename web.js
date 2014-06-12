// web.js
var express = require("express");
var logfmt = require("logfmt");
var app = express();

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
  res.send('Hello World!');
});

var data = {};
var maxId = 0;
app.post('test', function(req, res) {
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
