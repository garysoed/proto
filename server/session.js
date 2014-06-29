/** @module server/session */

/**
 * Represents a session.
 * @class
 */
Session = function() {
  /**
   * @private
   */
  this.users_ = {};
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
 * @param {!SseEvent} sseEvent The SSE event to be added to the given user.
 */
Session.prototype.queueEvent = function(userId, sseEvent) {
  if (this.users_[userId] === undefined) {
    throw 'User ID [' + userId + '] not added';
  }
  this.users_[userId].push(sseEvent);
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
