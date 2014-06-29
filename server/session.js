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
 * Queues a message for the given user.
 * @param {string} string The ID of the user to add the message to.
 * @param {!Object} msg The message to be added to the given user.
 */
Session.prototype.queueMessage = function(userId, msg) {
  if (this.users_[userId] === undefined) {
    throw 'User ID [' + userId + '] not added';
  }
  this.users_[userId].push(msg);
};

/**
 * Removes all messages queued up for the user and returns them.
 * @return {!Object[]} Messages queued up for this user.
 */
Session.prototype.flushMessages = function(userId) {
  if (this.users_[userId] === undefined) {
    throw 'User ID [' + userId + '] not added';
  }
  var messages = this.users_[userId];
  this.users_[userId] = [];
  return messages;
}

module.exports = Session;
