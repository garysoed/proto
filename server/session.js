/** @module server/session */

var requirejs = require('requirejs');

requirejs.define('session', ['sseevent', 'events'], function(SseEvent, events) {

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
  Session.prototype.__proto__ = events.EventEmitter.prototype;

  /**
   * @enum {string}
   */
  Session.Events = {
    QUEUED: 'Session.QUEUED' // Args: userId:string, sseEvent:SseEvent
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
  };

  /**
   * Queues an SSE event for all of the users.
   * @param {string} type The type of SSE event to be added.
   * @param {!Object} data The data of SSE event to be added.
   */
  Session.prototype.queueEvent = function(type, data) {
    var sseEvent = new SseEvent(this.nextEventId_, type, data);

    for (var userId in this.users_) {
      this.users_[userId].push(sseEvent);
      this.emit(Session.Events.QUEUED, userId, sseEvent);
    }
    this.nextEventId_++;
  };

  /**
   * Removes the first SSE events queued up for the user and returns them.
   * @return {SseEvent|null} First SSE event queued up. Null if none.
   */
  Session.prototype.popEvent = function(userId) {
    if (this.users_[userId] === undefined) {
      throw 'User ID [' + userId + '] not added';
    }
    return this.users_[userId].shift(1);
  };

  return Session;
});
