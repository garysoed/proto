var mock = require('../testing/mock');
var util = require('./util');
var Server = require('./server');


/**
 * Test server.newGame
 */
QUnit.module('newGame', {
  setup: function() {
    this.oldDateNow = Date.now;
    this.server = new Server();
  },
  teardown: function() {
    Date.now = this.oldDateNow;
  }
});
QUnit.test('Basic', function(assert) {
  var time = 12345;
  Date.now = function() { return time; }
  assert.equal(this.server.newGame().gameId, time);
});


/**
 * Test server.getUpdates
 */
QUnit.module('getUpdates', {
  setup: function() {
    this.server = new Server();
    this.oldDateNow = Date.now;
  },
  teardown: function() {
    Date.now = this.oldDateNow;
  }
});

QUnit.test('New session', function(assert) {
  mock.forQUnit(assert);

  var now = 1234;
  var userId1 = 'User ID';
  var res = {send: mock.mockFunction('res.send')};

  Date.now = function() { return now; }

  var gameId = this.server.newGame().gameId;
  this.server.getUpdates({userId: userId1, gameId: gameId}, res);
  mock.verify(res.send)(util.sseMessage('init', {userIds: [userId1]}));

  // Another user comes along.
  var userId2 = 'User ID 2';
  this.server.getUpdates({userId: userId2, gameId: gameId}, res);
  mock.verify(res.send)(util.sseMessage(Server.Events.INIT, {userIds: [userId1, userId2]}));
});

QUnit.test('Old session', function(assert) {
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

QUnit.test('No userId', function(assert) {
  mock.forQUnit(assert);
  var res = {send: mock.mockFunction('res.send')};

  Date.now = function() { return 1234; }

  var gameId = this.server.newGame().gameId;
  assert.throws(
      function() { this.server.getUpdates({gameId: gameId}, res); },
      /userId/,
      'Throws when no userId is given');
  mock.verify(res.send, 0)(mock.any());
});

QUnit.test('No gameId', function(assert) {
  mock.forQUnit(assert);
  var res = {send: mock.mockFunction('res.send')};

  Date.now = function() { return 1234; };

  assert.throws(
      function() { this.server.getUpdates({userId: 'User Id'}, res); },
      /gameId/,
      'Throws when no gameId is given');
  mock.verify(res.send, 0)(mock.any());
});

QUnit.test('Invalid gameId', function(assert) {
  mock.forQUnit(assert);
  var res = {send: mock.mockFunction('res.send')};

  Date.now = function() { return 1234; };

  assert.throws(
      function() { this.server.getUpdates({gameId: '4543', userId: 'user ID'}, res); },
      /does not exist/,
      'Throws when gameId does not exist');
  mock.verify(res.send, 0)(mock.any());
});


/**
 * Test server.sendUpdate
 */
QUnit.module('sendUpdate', {
  setup: function() {
    this.oldDateNow = Date.now;
    Date.now = function() { return 74203; };

    this.userId = 'User ID';
    this.server = new Server();
    this.gameId = this.server.newGame().gameId;
  },
  teardown: function() {
    Date.now = this.oldDateNow;
  }
});

QUnit.test('Send updates', function(assert) {
  mock.forQUnit(assert);

  var msg = 'Message';
  var res = {send: mock.mockFunction()};

  this.server.getUpdates({gameId: this.gameId, userId: this.userId}, res);
  this.server.sendUpdate({msg: msg, gameId: this.gameId});

  mock.verify(res.send)(util.sseMessage(Server.Events.MESSAGE, {msg: msg}));
});

QUnit.test('No gameId', function(assert) {
  mock.forQUnit(assert);

  var res = {send: mock.mockFunction()};
  this.server.getUpdates({gameId: this.gameId, userId: this.userId}, res);

  mock.reset(res.send);
  assert.throws(
      function() { this.server.sendUpdate({msg: 'Message'}); },
      /gameId/,
      'Throws when gameId is not specified');
  mock.verify(res.send, 0)(mock.any());
});

QUnit.test('No Message', function(assert) {
  mock.forQUnit(assert);

  var res = {send: mock.mockFunction()};
  this.server.getUpdates({gameId: this.gameId, userId: this.userId}, res);

  mock.reset(res.send);
  assert.throws(
      function() { this.server.sendUpdate({gameId: this.gameId}); },
      /msg/,
      'Throws when msg is not specified');
  mock.verify(res.send, 0)(mock.any());
});

QUnit.test('Invalid gameId', function(assert) {
  mock.forQUnit(assert);

  var res = {send: mock.mockFunction()};
  this.server.getUpdates({gameId: this.gameId, userId: this.userId}, res);

  mock.reset(res.send);
  assert.throws(
      function() { this.server.sendUpdate({gameId: this.gameId + '2', msg: 'Message'}); },
      /does not exist/,
      'Throws when gameId does not exist');
  mock.verify(res.send, 0)(mock.any());
});


/**
 * Test server.unregister
 */
QUnit.module('unregister', {
  setup: function() {
    this.oldDateNow = Date.now;
    Date.now = function() { return 23948; };

    this.userId = 'User ID';
    this.server = new Server();
    this.gameId = this.server.newGame().gameId;
  },
  teardown: function() {
    Date.now = this.oldDateNow;
  }
});

QUnit.test('Success', function(assert) {
  mock.forQUnit(assert);

  var res = {send: mock.mockFunction()};
  this.server.getUpdates({gameId: this.gameId, userId: this.userId}, res);
  this.server.unregister({gameId: this.gameId, userId: this.userId});

  console.log(res);
});

QUnit.test('No userId', function(assert) {
  mock.forQUnit(assert);
  // TODO: implement
});

QUnit.test('No gameId', function(assert) {
  mock.forQUnit(assert);
  // TODO: implement
});
