var requirejs = require('requirejs');

requirejs.define(
    'session', 
    ['sseevent', 'events', 'common/clienterror'], 
    function(SseEvent, events, ClientError) {

      /**
       * Represents a session.
       * 
       * @class
       */
      Session = function() {
        this.users_ = {};
        this.nextEventId_ = 0;
      };
      Session.prototype.__proto__ = events.EventEmitter.prototype;

      /**
       * Events dispatched by Session.
       * 
       * @enum {string}
       */
      Session.Events = {
        /**
         * An event has been queued. Event is called with <code>userId:string</code> and 
         * <code>sseEvent:{@link SseEvent}</code>
         */
        QUEUED: 'Session.QUEUED'
      };

      /**
       * Adds user to the session.
       * 
       * @param {string} userId The ID of the user to be added.
       */
      Session.prototype.addUser = function(userId) {
        if (!this.users_[userId]) {
          this.users_[userId] = [];
        }
      };

      /**
       * Removes user from the session.
       * 
       * @param {string} userId The ID of the user to be removed.
       */
      Session.prototype.removeUser = function(userId) {
        delete this.users_[userId];
      };

      /**
       * @return {string[]} User IDs registered with this session.
       */
      Session.prototype.getUsers = function() {
        var users = [];
        for (var user in this.users_) {
          users.push(user);
        }
        return users;
      };

      /**
       * Queues an SSE event for all of the users.
       * 
       * @param {string} type The type of SSE event to be added.
       * @param {!Object} data The data of SSE event to be added.
       * @param {string[]=} opt_userIds User IDs to send the events to. Defaults to all registered 
       *                                users.
       */
      Session.prototype.queueEvent = function(type, data, opt_userIds) {
        var sseEvent = new SseEvent(this.nextEventId_, type, data);
        var userIds = opt_userIds || Object.keys(this.users_);
        userIds.forEach(function(userId) {
          this.users_[userId].push(sseEvent);
          this.emit(Session.Events.QUEUED, userId, sseEvent);
        }, this);
        this.nextEventId_++;
      };


      /**
       * Gets the all SSE events queued up for the user.
       *
       * @param  {string} userId The User ID whose event should be returned.
       * @return {!SseEvent[]} All SSE events queued for the user.
       */
      Session.prototype.getEvents = function(userId) {
        if (this.users_[userId] === undefined) {
          throw new ClientError(ClientError.Code.UNRECOGNIZED_USER_ID, userId);
        }
        return this.users_[userId];
      };

      /**
       * Removes the all SSE events queued up for the user.
       * 
       * @param {string} userId The User ID whose events should be removed.
       */
      Session.prototype.clearEvents = function(userId) {
        if (this.users_[userId] === undefined) {
          throw new ClientError(ClientError.Code.UNRECOGNIZED_USER_ID, userId);
        }
        this.users_[userId] = [];
      };

      return Session;
    });
