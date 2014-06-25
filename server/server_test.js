var mock = require('../testing/mock');

QUnit.module('newGame', {
  setup: function() {
    this.oldDateNow = Date.now;
    this.server = require('./server')
  },
  teardown: function() {
    Date.now = this.oldDateNow;
    this.server.reset();
    delete this.server;
  }
});
QUnit.test('basic', function(assert) {
  var time = 12345;
  Date.now = function() { return time; }
  assert.equal(this.server.newGame().gameId, time);
});



QUnit.module('getUpdates', {
  setup: function(assert) {
    this.server = require('./server');
    this.oldDateNow = Date.now;
  },
  teardown: function() {
    Date.now = this.oldDateNow;
    this.server.reset();
    delete this.server;
  }
});

QUnit.test('new session', function(assert) {
  mock.forQUnit(assert);

  var now = 1234;
  var userId1 = 'User ID';
  var res = {send: mock.mockFunction('res.send')};

  Date.now = function() { return now; }

  var gameId = this.server.newGame().gameId;
  this.server.getUpdates({userId: userId1, gameId: gameId}, res);
  mock.verify(res.send)(
      'id: ' + now + '\nevent: init\ndata: ' + JSON.stringify({userIds: [userId1]}) + '\n\n');

  // Another user comes along.
  var userId2 = 'User ID 2';
  this.server.getUpdates({userId: userId2, gameId: gameId}, res);
  mock.verify(res.send)(
      'id: ' + now + 
      '\nevent: init\ndata: ' + 
      JSON.stringify({userIds: [userId1, userId2]}) + '\n\n');
});

QUnit.test('old session', function(asserts) {
  mock.forQUnit(assert);

  var res = {send: mock.mockFunction('res.send')};

  Date.now = function() { return 1234; }

  var gameId = this.server.newGame().gameId;
  this.server.getUpdates({userId: 'User ID', gameId: gameId}, res);

  // Call again. This time, there should be no request sent back.
  mock.reset(res.send);
  this.server.getUpdates({userId: 'User ID', gameId: gameId}, res);
  mock.verify(res.send, 0)(mock.any());
});

QUnit.test('no userId', function(asserts) {
  mock.forQUnit(assert);
  var res = {send: mock.mockFunction('res.send')};

  Date.now = function() { return 1234; }

  var gameId = this.server.newGame().gameId;
  asserts.throws(
      function() { this.server.getUpdates({gameId: gameId}, res); },
      /userId/,
      'Throws when no userId is given');
  mock.verify(res.send, 0)(mock.any());
});

QUnit.test('no gameId', function(asserts) {
  mock.forQUnit(assert);
  var res = {send: mock.mockFunction('res.send')};

  Date.now = function() { return 1234; };

  asserts.throws(
      function() { this.server.getUpdates({userId: 'User Id'}, res); },
      /gameId/,
      'Throws when no gameId is given');
  mock.verify(res.send, 0)(mock.any());
});

QUnit.test('invalid gameId', function(asserts) {
  mock.forQUnit(assert);
  var res = {send: mock.mockFunction('res.send')};

  Date.now = function() { return 1234; }

  asserts.throws(
      function() { this.server.getUpdates({gameId: '4543', userId: 'user ID'}, res); },
      /does not exist/,
      'Throws when gameId does not exist');
  mock.verify(res.send, 0)(mock.any());
});
