/** @module web */

define(['jquery', 'common/events', 'common/uris', 'common/pretty'], function($, Events, Uris) {

  /**
   * A component that is responsible for communicating with the server.
   * 
   * @param {string} userId User ID to register to the server.
   * @param {function():!Object} gameStateProvider Function that returns the current game state.
   * @class
   */ 
  function Network(userId, gameStateProvider) {
    this.userId_ = userId;
    this.gameId_ = null;
    this.gameStateProvider_ = gameStateProvider;
    this.source_ = null;
    this.lastEventId_ = -1;
  }

  /**
   * Events that this module dispatch.
   * 
   * @enum {string}
   */
  Network.Events = {
    JOIN: 'Network.join',
    MESSAGE: 'Network.message',
    NEW_GAME_STATE: 'Network.new_game_state',
    PLAYER_ADDED: 'Network.player_added',
    PLAYER_REMOVED: 'Network.player_removed'
  };

  /**
   * Creates a new game.
   */
  Network.prototype.create = function() {
    // TODO sign out if there's a current game going on.
    $.post(Uris.Request.CREATE)
        .done(function(data) {
          this.gameId_ = data.gameId;
          this.join(data.gameId);
        }.bind(this));
  };

  /**
   * Joins the given game ID.
   * 
   * @param {string} gameId Game ID to join.
   */
  Network.prototype.join = function(gameId) {
    // TODO sign out if there's a current game going on.
    $.post(Uris.Request.JOIN, {gameId: gameId, userId: this.userId_}).done(function() {
      this.gameId_ = gameId;
      this.startStream_();
      this.sync_();
      $(this).trigger(Network.Events.JOIN, {gameId: gameId});
    }.bind(this));
  };

  /**
   * Leaves the game. Does nothing if the player hasn't joined the game.
   */
  Network.prototype.leave = function() {
    if (this.gameId_) {
      $.post(Uris.Request.LEAVE, {gameId: this.gameId_, userId: this.userId_});
    }
  };

  /**
   * Sends a message for the game.
   * 
   * @param {string} type Type of message to be sent to the server.
   * @param {!Object} data Data to be sent to the server.
   */
  Network.prototype.send = function(type, data) {
    $.post(Uris.Request.MESSAGE, {gameId: this.gameId_, msg: {type: type, data: data}});
  };

  /**
   * Opens an SSE connection with the server.
   * @private
   */
  Network.prototype.startStream_ = function() {
    this.source_ = new EventSource(
        Uris.Request.STREAM + '?userId=' + this.userId_ + '&gameId=' + this.gameId_);
    this.source_.addEventListener('message', this.handleEvents_.bind(this));
  };

  /**
   * @return {string} The user ID registered to the game.
   */
  Network.prototype.getUserId = function() {
    return this.userId_;
  };

  /**
   * @return {string} The Game ID that the user has joined to.
   */
  Network.prototype.getGameId = function() {
    return this.gameId_;
  };

  /**
   * Sends request to sync up with the other users.
   * 
   * @private
   */
  Network.prototype.sync_ = function() {
    $.post(Uris.Request.SYNC, {gameId: this.gameId_, userId: this.userId_});
  };

  /**
   * Sends the game state to other users of the game.
   * 
   * @private
   */
  Network.prototype.syncAck_ = function() {
    $.post(
        Uris.Request.SYNC_ACK, 
        {gameId: this.gameId_, userId: this.userId_, gameState: this.gameStateProvider_()});
  };

  /**
   * Handles the ID in the given event ID. If the ID is later than the latest ID seen, update the 
   * latest ID.
   * 
   * @param  {string} eventId The event ID returned from EventSource.
   * @return {boolean} True iff the event is valid.
   * 
   * @private
   */
  Network.prototype.handleEventId_ = function(eventId) {
    var updated = Number(eventId) > this.lastEventId_;
    if (updated) {
      this.lastEventId_ = Number(eventId);
    } else {
      console.warn('Dropping event ID: {0}'.format(eventId));
    }
    return updated;
  };

  /**
   * Handles SYNC_ACK events from the server.
   * 
   * @param {MessageEvent} event The event returned from EventSource.
   */
  Network.prototype.handleSyncAck_ = function(event) {
    var data = event.data;
    $(this).trigger(Network.Events.NEW_GAME_STATE, data.gameState);
  };

  Network.prototype.handlePlayerAdded_ = function(event) {
    var data = event.data;
    $(this).trigger(Network.Events.PLAYER_ADDED, data.userId);
  };

  Network.prototype.handlePlayerRemoved_ = function(event) {
    var data = event.data;
    $(this).trigger(Network.Events.PLAYER_REMOVED, data.userId);
  };

  Network.prototype.handleMessage_ = function(event) {
    var data = event.data;
    $(this).trigger(data.type, data.data);
    $(this).trigger(Network.Events.MESSAGE, data);
  };

  Network.prototype.handleEvents_ = function(event) {
    var events = JSON.parse(event.data);
    events.forEach(function(event) {
      if (this.handleEventId_(event.id)) {
        switch (event.type) {
          case Events.Server.SYNC:
            this.syncAck_();
            break;
          case Events.Server.SYNC_ACK:
            this.handleSyncAck_(event);
            break;
          case Events.Server.PLAYER_ADDED:
            this.handlePlayerAdded_(event);
            break;
          case Events.Server.PLAYER_REMOVED:
            this.handlePlayerRemoved_(event);
            break;
          case Events.Server.MESSAGE:
            this.handleMessage_(event);
            break;
          default:
            console.warn('Unhandled event: ' + event);
            break;
        }
      }
    }, this);
  };

  return Network;
});
