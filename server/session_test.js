var mock = require('../testing/mock');
var Session = require('./session');
var SseEvent = require('./sseevent');

/**
 * Tests session.addUser.
 */
QUnit.module('session.addUser', {
  setup: function() {
    this.session = new Session();
  }
});

QUnit.test('non existing user', function(assert) {
  mock.forQUnit(assert);

  var userId = 'New User';
  this.session.addUser(userId);
  assert.ok(this.session.users_[userId], 'New User should be added');
});

QUnit.test('existing user', function(assert) {
  mock.forQUnit(assert);

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
  mock.forQUnit(assert);
  
  var userId = 'User ID';
  this.session.addUser(userId);
  this.session.removeUser(userId);
  assert.equal(this.session.users_[userId], undefined, 'User should have been removed');
});

QUnit.test('non existing user', function(assert) {
  mock.forQUnit(assert);
  expect(0); // Make sure that this can be ran without throwing exceptions.

  this.session.removeUser('non existing user ID');
});


/**
 * Tests session.queueEvent.
 */
QUnit.module('session.queueEvent', {
  setup: function() {
    this.userId = 'User ID';
    this.session = new Session();
    this.session.addUser(this.userId);
  }
});

QUnit.test('good', function(assert) {
  mock.forQUnit(assert);
  
  var type = 'event Type';
  var data = {msg: 'message'};
  this.session.queueEvent(this.userId, type, data);
  this.session.queueEvent(this.userId, type, data);
  assert.deepEqual(
      this.session.users_[this.userId], 
      [
        new SseEvent(0, type, data),
        new SseEvent(1, type, data)
      ]);
});

QUnit.test('non existing user', function(assert) {
  mock.forQUnit(assert);
  
  assert.throws(
      function() { this.session.queueEvent('Non existing User ID', 'message'); },
      /User ID/,
      'Throws exception when user Id has not been added');
});


/**
 * Tests session.flushEvents.
 */
QUnit.module('session.flushEvents', {
  setup: function() {
    var eventType = 'type';
    var eventData = {msg: 'message'};
    this.userId = 'User ID';
    this.sseEvent = new SseEvent(0, eventType, eventData);
    this.session = new Session();
    this.session.addUser(this.userId);
    this.session.queueEvent(this.userId, eventType, eventData);
  }
});

QUnit.test('good', function(assert) {
  mock.forQUnit(assert);

  assert.deepEqual(this.session.flushEvents(this.userId), [this.sseEvent]);
  assert.deepEqual(this.session.flushEvents(this.userId), []);
});

QUnit.test('non existing user', function(assert) {
  mock.forQUnit(assert);
  
  assert.throws(
      function() { this.session.flushEvents('Non existing User ID'); },
      /User ID/,
      'Throws exception when user Id has not been added');
});

