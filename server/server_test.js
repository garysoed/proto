var requirejs = require('requirejs');
var config = require('./config');
requirejs.config(config);
requirejs(
    ['mock', 'util', 'server', 'session', 'sseevent', 'common/events'], 
    function(mock, util, Server, Session, SseEvent, Events) {
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
          Mock.teardown();
        }
      });

      QUnit.test('good', function(assert) {
        var mockAddUser = Mock.spy(this.server.sessions_[this.gameId], 'addUser');
        var mockQueueEvent = Mock.spy(this.server.sessions_[this.gameId], 'queueEvent');

        var userId = 'User ID';
        this.server.join(this.gameId, userId);

        mock.verify(mockAddUser)(userId);
        mock.verify(mockQueueEvent)(Events.Server.PLAYER_ADDED, {userId: userId});
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
        var mockRemoveUser = mock.mockFunction('removeUser');
        var mockQueueEvent = mock.mockFunction('queueEvent');
        this.server.sessions_[this.gameId].removeUser = mockRemoveUser;
        this.server.sessions_[this.gameId].queueEvent = mockQueueEvent;

        this.server.leave(this.gameId, this.userId);
        mock.verify(mockRemoveUser)(this.userId);
        mock.verify(mockQueueEvent)(Events.Server.PLAYER_REMOVED, {userId: this.userId});
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
          this.res = {send: mock.mockFunction('res.send')};

          this.server.join(this.gameId, this.userId);
        }
      });

      QUnit.test('no queued event', function(assert) {
        var session = this.server.sessions_[this.gameId];
        var mockClearEvents = mock.mockFunction('Session.clearEvents');
        session.clearEvents = mockClearEvents ;
        var mockGetEvents = mock.mockFunction('Session.getEvents');
        session.getEvents = mockGetEvents;
        
        var sseEvent = new SseEvent('id', 'type', {msg: 'data'});

        // First try getting the first queued event and discover that none were queued.
        mock.when(mockGetEvents).doReturn([]);
        this.server.stream(this.gameId, this.userId, this.res);
        mock.verify(this.res.send, 0)(mock.any());

        // An event was queued somewhere. This time an SSE message should be sent.
        mock.when(mockGetEvents).doReturn([sseEvent]);
        session.emit(Session.Events.QUEUED, this.userId, sseEvent);
        mock.verify(this.res.send)(SseEvent.toSseMessage([sseEvent]));
        mock.verify(mockClearEvents)(this.userId);
      });

      QUnit.test('has queued event', function(assert) {
        var sseEvent = new SseEvent('id', 'type', {msg: 'data'});
        var session = this.server.sessions_[this.gameId];
        var mockGetEvents = mock.mockFunction('Session.getEvents');
        var mockClearEvents = mock.mockFunction('Session.clearEvents');
        session.clearEvents = mockClearEvents ;
        session.getEvents = mockGetEvents;
        
        mock.when(mockGetEvents).doReturn([sseEvent]);
        this.server.stream(this.gameId, this.userId, this.res);
        mock.verify(this.res.send)(SseEvent.toSseMessage([sseEvent]));
        mock.verify(mockClearEvents)(this.userId);
      });

      QUnit.test('non existent game ID', function(assert) {
        assert.throws(
            function() { this.server.stream('non existent Game ID', this.userId, {}); },
            /Game ID/,
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
        session.queueEvent = mock.mockFunction('queueEvent');

        var msg = {msg: 'Message to be sent'};
        this.server.msg(this.gameId, msg);

        mock.verify(session.queueEvent)(Events.Server.MESSAGE, msg);
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
        session.queueEvent = mock.mockFunction('queueEvent');
        session.getUsers = function() {
          return [userId, otherUser1Id, otherUser2Id];
        };

        this.server.sync(this.gameId, userId);

        mock.verify(session.queueEvent)(Events.Server.SYNC, {}, [otherUser1Id, otherUser2Id]);
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
        session.queueEvent = mock.mockFunction('queueEvent');
        session.getUsers = function() {
          return [userId, otherUser1Id, otherUser2Id];
        };

        var gameState = {players: 1};
        this.server.syncAck(this.gameId, userId, gameState);

        mock.verify(session.queueEvent)(
            Events.Server.SYNC_ACK, {gameState: gameState}, [otherUser1Id, otherUser2Id]);
      });

      QUnit.test('non existent game ID', function(assert) {
        var gameId = 'non existing game Id';
        assert.throws(
            function() { this.server.syncAck(gameId, 'message'); },
            gameId,
            'Throws error when Game ID does not exist');
      });
});
