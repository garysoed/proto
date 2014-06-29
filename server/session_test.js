var mock = require('../testing/mock');
var Session = require('./session');

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
 * Tests session.queueMessage.
 */
QUnit.module('session.queueMessage', {
  setup: function() {
    this.userId = 'User ID';
    this.session = new Session();
    this.session.addUser(this.userId);
  }
});

QUnit.test('good', function(assert) {
  mock.forQUnit(assert);
  
  var msg = {msg: 'some message'};
  this.session.queueMessage(this.userId, msg);
  assert.deepEqual(this.session.users_[this.userId], [msg]);
});

QUnit.test('non existing user', function(assert) {
  mock.forQUnit(assert);
  
  assert.throws(
      function() { this.session.queueMessage('Non existing User ID', 'message'); },
      /User ID/,
      'Throws exception when user Id has not been added');
});


/**
 * Tests session.flushMessages.
 */
QUnit.module('session.flushMessages', {
  setup: function() {
    this.userId = 'User ID';
    this.message = {msg: 'Message'};
    this.session = new Session();
    this.session.addUser(this.userId);
    this.session.queueMessage(this.userId, this.message);
  }
});

QUnit.test('good', function(assert) {
  mock.forQUnit(assert);

  assert.deepEqual(this.session.flushMessages(userId), [msg]);
  assert.deepEqual(this.session.flushMessages(userId), []);
});

QUnit.test('non existing user', function(assert) {
  mock.forQUnit(assert);
  
  assert.throws(
      function() { this.session.flushMessages('Non existing User ID'); },
      /User ID/,
      )
});

