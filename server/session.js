/** @module server/session */

var SseEvent = require('./sseevent');

/**
 * Represents a session.
 * @class
 */
Session = function() {
  /**
   * @private
   */
  this.users_ = {};

  /**
   * @private
   */
  this.nextEventId_ = 0;
};

/**
 * Adds user to the session.
 * @param {string} userId The ID of the user to be added.
 */
Session.prototype.addUser = function(userId) {
  if (!this.users_[userId]) {
    this.users_[userId] = [];
  }
};

/**
 * Removes user from the session.
 * @param {string} userId The ID of the user to be removed.
 */
Session.prototype.removeUser = function(userId) {
  delete this.users_[userId];
}

/**
 * Queues an SSE event for the given user.
 * @param {string} string The ID of the user to add the SSE event to.
 * @param {string} type The type of SSE event to be added.
 * @param {!Object} data The data of SSE event to be added.
 */
Session.prototype.queueEvent = function(userId, type, data) {
  if (this.users_[userId] === undefined) {
    throw 'User ID [' + userId + '] not added';
  }
  this.users_[userId].push(new SseEvent(this.nextEventId_, type, data));
  this.nextEventId_++;
};

/**
 * Removes all SSE events queued up for the user and returns them.
 * @return {!SseEvent[]} SSE events queued up for this user.
 */
Session.prototype.flushEvents = function(userId) {
  if (this.users_[userId] === undefined) {
    throw 'User ID [' + userId + '] not added';
  }
  var sseEvents = this.users_[userId];
  this.users_[userId] = [];
  return sseEvents;
}

module.exports = Session;
