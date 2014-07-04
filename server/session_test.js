var requirejs = require('requirejs');
var config = require('./config');
requirejs.config(config);
requirejs(['mock', 'session', 'sseevent'], function(mock, Session, SseEvent) {
  /**
   * Tests session.addUser.
   */
  QUnit.module('session.addUser', {
    setup: function() {
      this.session = new Session();
    }
  });

  QUnit.test('non existing user', function(assert) {
    var userId = 'New User';
    this.session.addUser(userId);
    assert.ok(this.session.users_[userId], 'New User should be added');
  });

  QUnit.test('existing user', function(assert) {
    var userId = 'User ID';
    this.session.addUser(userId);
    this.session.addUser(userId);
    assert.ok(this.session.users_[userId], 'Existing user should still exist');
  });


  /**
   * Tests session.removeUser.
   */
  QUnit.module('session.removeUser', {
    setup: function() {
      this.session = new Session();
    }
  });

  QUnit.test('existing user', function(assert) {
    var userId = 'User ID';
    this.session.addUser(userId);
    this.session.removeUser(userId);
    assert.equal(this.session.users_[userId], undefined, 'User should have been removed');
  });

  QUnit.test('non existing user', function(assert) {
    assert.ok(true, 'Does not crash when user ID does not exist');
  });


  /**
   * Tests session.queueEvent.
   */
  QUnit.module('session.queueEvent', {
    setup: function() {
      this.userId1 = 'User ID1';
      this.userId2 = 'User ID2';
      this.session = new Session();
      this.session.addUser(this.userId1);
      this.session.addUser(this.userId2);
    }
  });

  QUnit.test('good', function(assert) {
    var type = 'event Type';
    var data = {msg: 'message'};

    var eventListener = mock.mockFunction('eventListener');

    this.session.on(Session.Events.QUEUED, eventListener);

    var expectedSseEvent1 = new SseEvent(0, type, data);
    var expectedSseEvent2 = new SseEvent(1, type, data);
    
    this.session.queueEvent(type, data);
    mock.verify(eventListener)(this.userId1, expectedSseEvent1);
    mock.verify(eventListener)(this.userId2, expectedSseEvent1);

    this.session.queueEvent(type, data);
    mock.verify(eventListener)(this.userId1, expectedSseEvent2);
    mock.verify(eventListener)(this.userId2, expectedSseEvent2);

    assert.deepEqual(
        this.session.users_[this.userId1], 
        [expectedSseEvent1, expectedSseEvent2],
        'Queued SSE events are as expected for userId1');
    assert.deepEqual(
        this.session.users_[this.userId2],
        [expectedSseEvent1, expectedSseEvent2],
        'Queued SSE events are as expected for userId2');
  });


  /**
   * Tests session.popEvent.
   */
  QUnit.module('session.popEvent', {
    setup: function() {
      var eventType = 'type';
      var eventData = {msg: 'message'};
      this.userId = 'User ID';
      this.sseEvent = new SseEvent(0, eventType, eventData);
      this.session = new Session();
      this.session.addUser(this.userId);
      this.session.queueEvent(eventType, eventData);
    }
  });

  QUnit.test('good', function(assert) {
    var eventType = 'Event Type';
    var eventData = 'Event Data';

    var sseEvent2 = new SseEvent(1, eventType, eventData);
    this.session.queueEvent(eventType, eventData);

    assert.deepEqual(
        this.session.popEvent(this.userId), 
        this.sseEvent,
        'Returned SSE event from popEvent is as expected');
    assert.deepEqual(
        this.session.popEvent(this.userId), 
        sseEvent2,
        'Returned SSE event from second popEvent is as expected');
    assert.equal(
        this.session.popEvent(this.userId), 
        null,
        'Returned SSE event when there are no more events queued is null');
  });

  QUnit.test('non existing user', function(assert) {
    assert.throws(
        function() { this.session.popEvent('Non existing User ID'); },
        /User ID/,
        'Throws exception when user Id has not been added');
  });

});