var Mock = require('../testing/mock');

var Server = require('./server');
var Session = require('./session');
var SseEvent = require('./sseevent');
var Events = require('../common/events');

/**
 * Tests server.create.
 */
QUnit.module('server.create', {
  setup: function() {
    this.oldDateNow = Date.now;
    this.server = new Server();
  },
  teardown: function() {
    Date.now = this.oldDateNow;
  }
});

QUnit.test('good', function(assert) {
  var time = 12345;
  Date.now = function() { return time; };
  assert.equal(this.server.create().gameId, time, 'gameId is as expected');
});


/**
 * Tests server.join.
 */
QUnit.module('server.join', {
  setup: function() {
    this.oldDateNow = Date.now;
    Date.now = function() { return 12345; };

    this.server = new Server();
    this.gameId = this.server.create().gameId;
  },
  teardown: function() {
    Date.now = this.oldDateNow;
  }
});

QUnit.test('good', function(assert) {
  var mockAddUser = Mock.spy(this.server.sessions_[this.gameId], 'addUser');
  var mockQueueEvent = Mock.spy(this.server.sessions_[this.gameId], 'queueEvent');

  var userId = 'User ID';
  this.server.join(this.gameId, userId);

  Mock.verify(mockAddUser)(userId);
  Mock.verify(mockQueueEvent)(Events.Server.PLAYER_ADDED, {userId: userId});
});

QUnit.test('non existing game ID', function(assert) {
  var gameId = 'non existing game Id';
  assert.throws(
      function() { this.server.join(gameId, 'userId'); },
      gameId,
      'Throws error for non existing gameId');
});


/**
 * Tests server.leave
 */
QUnit.module('server.leave', {
  setup: function() {
    this.oldDateNow = Date.now;
    Date.now = function() { return 23948; };

    this.userId = 'User ID';
    this.server = new Server();
    this.gameId = this.server.create().gameId;
    this.server.join(this.gameId, this.userId);
  },
  teardown: function() {
    Date.now = this.oldDateNow;
  }
});

QUnit.test('good', function(assert) {
  var mockRemoveUser = Mock.mockFunction('removeUser');
  var mockQueueEvent = Mock.mockFunction('queueEvent');
  this.server.sessions_[this.gameId].removeUser = mockRemoveUser;
  this.server.sessions_[this.gameId].queueEvent = mockQueueEvent;

  this.server.leave(this.gameId, this.userId);
  Mock.verify(mockRemoveUser)(this.userId);
  Mock.verify(mockQueueEvent)(Events.Server.PLAYER_REMOVED, {userId: this.userId});
});

QUnit.test('non existing game', function(assert) {
  this.server.leave('Non existing Game Id', this.userId);
  assert.ok(true, 'Does not throw exception when Game ID does not exist');
});


/**
 * Tests server.stream.
 */
QUnit.module('server.stream', {
  setup: function() {
    this.userId = 'User ID';
    this.server = new Server();
    this.gameId = this.server.create().gameId;
    this.res = {send: Mock.mockFunction('res.send')};

    this.server.join(this.gameId, this.userId);
  }
});

QUnit.test('no queued event', function(assert) {
  var session = this.server.sessions_[this.gameId];
  var mockClearEvents = Mock.mockFunction('Session.clearEvents');
  session.clearEvents = mockClearEvents ;
  var mockGetEvents = Mock.mockFunction('Session.getEvents');
  session.getEvents = mockGetEvents;
  
  var sseEvent = new SseEvent('id', 'type', {msg: 'data'});

  // First try getting the first queued event and discover that none were queued.
  Mock.when(mockGetEvents).doReturn([]);
  this.server.stream(this.gameId, this.userId, this.res);
  Mock.verify(this.res.send, 0)(Mock.any());

  // An event was queued somewhere. This time an SSE message should be sent.
  Mock.when(mockGetEvents).doReturn([sseEvent]);
  session.emit(Session.Events.QUEUED, this.userId, sseEvent);
  Mock.verify(this.res.send)(SseEvent.toSseMessage([sseEvent]));
  Mock.verify(mockClearEvents)(this.userId);
});

QUnit.test('has queued event', function(assert) {
  var sseEvent = new SseEvent('id', 'type', {msg: 'data'});
  var session = this.server.sessions_[this.gameId];
  var mockGetEvents = Mock.mockFunction('Session.getEvents');
  var mockClearEvents = Mock.mockFunction('Session.clearEvents');
  session.clearEvents = mockClearEvents ;
  session.getEvents = mockGetEvents;
  
  Mock.when(mockGetEvents).doReturn([sseEvent]);
  this.server.stream(this.gameId, this.userId, this.res);
  Mock.verify(this.res.send)(SseEvent.toSseMessage([sseEvent]));
  Mock.verify(mockClearEvents)(this.userId);
});

QUnit.test('non existent game ID', function(assert) {
  var gameId = 'non existent Game ID';
  assert.throws(
      function() { this.server.stream(gameId, this.userId, {}); },
      gameId,
      'Throws error when Game ID does not exist');
});


/**
 * Tests server.msg.
 */
QUnit.module('server.msg', {
  setup: function() {
    this.server = new Server();
    this.gameId = this.server.create().gameId;
  }
});

QUnit.test('good', function(assert) {
  var session = this.server.sessions_[this.gameId];
  session.queueEvent = Mock.mockFunction('queueEvent');

  var msg = {msg: 'Message to be sent'};
  this.server.msg(this.gameId, msg);

  Mock.verify(session.queueEvent)(Events.Server.MESSAGE, msg);
});

QUnit.test('non existent game ID', function(assert) {
  var gameId = 'non existing game Id';
  assert.throws(
      function() { this.server.msg(gameId, 'message'); },
      gameId,
      'Throws error when Game ID does not exist');
});


/**
 * Tests server.sync.
 */
QUnit.module('server.sync', {
  setup: function() {
    this.server = new Server();
    this.gameId = this.server.create().gameId;
  }
});

QUnit.test('good', function(assert) {
  var userId = 'user Id';
  var otherUser1Id = 'other user 1 Id';
  var otherUser2Id = 'other user 2 Id';
  var session = this.server.sessions_[this.gameId];
  session.queueEvent = Mock.mockFunction('queueEvent');
  session.getUsers = function() {
    return [userId, otherUser1Id, otherUser2Id];
  };

  this.server.sync(this.gameId, userId);

  Mock.verify(session.queueEvent)(Events.Server.SYNC, {}, [otherUser1Id, otherUser2Id]);
});

QUnit.test('non existent game ID', function(assert) {
  var gameId = 'non existing game Id';
  assert.throws(
      function() { this.server.sync(gameId); },
      gameId,
      'Throws error when Game ID does not exist');
});


/**
 * Tests server.syncAck.
 */
QUnit.module('server.syncAck', {
  setup: function() {
    this.server = new Server();
    this.gameId = this.server.create().gameId;
  }
});

QUnit.test('good', function(assert) {
  var userId = 'user Id';
  var otherUser1Id = 'other user 1 Id';
  var otherUser2Id = 'other user 2 Id';
  var session = this.server.sessions_[this.gameId];
  session.queueEvent = Mock.mockFunction('queueEvent');
  session.getUsers = function() {
    return [userId, otherUser1Id, otherUser2Id];
  };

  var gameState = {players: 1};
  this.server.syncAck(this.gameId, userId, gameState);

  Mock.verify(session.queueEvent)(
      Events.Server.SYNC_ACK, {gameState: gameState}, [otherUser1Id, otherUser2Id]);
});

QUnit.test('non existent game ID', function(assert) {
  var gameId = 'non existing game Id';
  assert.throws(
      function() { this.server.syncAck(gameId, 'message'); },
      gameId,
      'Throws error when Game ID does not exist');
});
