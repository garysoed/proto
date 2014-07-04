/** @module network */

define(['jquery', 'common/events'], function($, Events) {

  /**
   * A component that is responsible for communicating with the server.
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
   * @enum {string}
   */
  Network.Events = {
    JOIN: 'Network.join',
    NEW_GAME_STATE: 'Network.new_game_state',
    PLAYER_ADDED: 'Network.player_added',
    PLAYER_REMOVED: 'Network.player_removed'
  };

  /**
   * Creates a new game.
   */
  Network.prototype.create = function() {
    $.post('create')
        .done(function(data) {
          this.gameId_ = data.gameId;
          this.join(data.gameId);
        }.bind(this));
  };

  /**
   * Joins the given game ID.
   * @param {string} gameId Game ID to join.
   */
  Network.prototype.join = function(gameId) {
    $.post('join', {gameId: gameId, userId: this.userId_}).done(function() {
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
      $.post('leave', {gameId: this.gameId_, userId: this.userId_});
    }
  };

  /**
   * Sends a message for the game.
   * @param {string} type Type of message to be sent to the server.
   * @param {!Object} data Data to be sent to the server.
   */
  Network.prototype.send = function(type, data) {
    $.post('msg', {gameId: this.gameId_, msg: {type: type, data: data}});
  };

  /**
   * Opens an SSE connection with the server.
   */
  Network.prototype.startStream_ = function() {
    this.source_ = new EventSource('stream?userId=' + this.userId_ + '&gameId=' + this.gameId_);

    this.source_.addEventListener(Events.Server.SYNC, this.syncAck_.bind(this));
    this.source_.addEventListener(Events.Server.SYNC_ACK, this.handleSyncAck_.bind(this));
    this.source_.addEventListener(Events.Server.PLAYER_ADDED, this.handlePlayerAdded_.bind(this));
    this.source_.addEventListener(
        Events.Server.PLAYER_REMOVED, this.handlePlayerRemoved_.bind(this));
    this.source_.addEventListener(Events.Server.MESSAGE, this.handleMessage_.bind(this));
  };

  /**
   * Sends request to sync up with the other users.
   */
  Network.prototype.sync_ = function() {
    $.post('sync', {gameId: this.gameId_});
  };

  /**
   * Sends the game state to other users of the game.
   */
  Network.prototype.syncAck_ = function() {
    $.post('syncack', {gameId: this.gameId_, gameState: this.gameStateProvider_()});
  };

  Network.prototype.handleEventId_ = function(event) {
    var updated = event.lastEventId > this.lastEventId_;
    if (updated) {
      this.lastEventId_ = event.lastEventId;
    }
    return updated;
  };

  Network.prototype.handleSyncAck_ = function(event) {
    if (this.handleEventId_(event)) {
      var data = JSON.parse(event.data);
      $(this).trigger(Network.Events.NEW_GAME_STATE, {gameState: data.gameState});
    }
  };

  Network.prototype.handlePlayerAdded_ = function(event) {
    if (this.handleEventId_(event)) {
      var data = JSON.parse(event.data);
      $(this).trigger(Network.Events.PLAYER_ADDED, {userId: data.userId});
    }
  };

  Network.prototype.handlePlayerRemoved_ = function(event) {
    if (this.handleEventId_(event)) {
      var data = JSON.parse(event.data);
      $(this).trigger(Network.Events.PLAYER_REMOVED, {userId: data.userId});
    }
  };

  Network.prototype.handleMessage_ = function(event) {
    if (this.handleEventId_(event)) {
      var data = JSON.parse(event.data);
      $(this).trigger(data.msg.type, data.msg.data);
    }
  };

  return Network;
});
