/** @module server/server */
var asserts = require('./asserts');
var util = require('./util');
var Session = require('./session');

/**
 * The server class.
 * @class
 */
Server = function() {

  /**
   * @private
   */
  this.sessions_ = {}
};

/**
 * Events that the server sends out.
 * @enum {string}
 * @readonly
 */
Server.Events = {
  MESSAGE: 'Proto.message',
  PLAYER_ADDED: 'Proto.player_added',
  PLAYER_REMOVED: 'Proto.player_removed',
  SYNC: 'Proto.sync',
  SYNC_ACK: 'Proto.sync_ack'
};

/**
 * Generates a new game.
 * @returns {{gameId: string}} Object containing the ID of the newly created game.
 */
Server.prototype.create = function() {
  var gameId = Date.now();
  this.sessions_[gameId] = new Session();
  return {gameId: gameId};
};

/**
 * Joins the userId to the given gameId.
 * @param {string} gameId ID of the game to join.
 * @param {string} userId ID of the user to join the game.
 */
Server.prototype.join = function(gameId, userId) {
  if (!this.sessions_[gameId]) {
    throw 'Game ID [' + gameId + '] does not exist';
  }

  this.sessions_[gameId].addUser(userId);
  this.sessions_[gameId].queueEvent(Server.Events.PLAYER_ADDED, {userId: userId});
};

/**
 * Drops the user from the given game.
 * @param {string} gameId The game ID for the user to be dropped from.
 * @param {string} userId The user ID of the user to be dropped.
 */
Server.prototype.leave = function(gameId, userId) {
  if (this.sessions_[gameId]) {
    this.sessions_[gameId].removeUser(userId);
    this.sessions_[gameId].queueEvent(Server.Events.PLAYER_REMOVED, {userId: userId});
  }
};

/**
 * Opens an SSE stream.
 * @param {string} gameId The game ID to open the stream for.
 * @param {string} userId The user ID to open the stream for.
 * @param {express:Response} res The Response object.
 */
Server.prototype.stream = function(gameId, userId, res) {
  if (!this.sessions_[gameId]) {
    throw 'Game ID [' + gameId + '] does not exist';
  }

  var session = this.sessions_[gameId];
  var sseEvent = session.popEvent(userId);
  if (sseEvent) {
    res.send(sseEvent.toSseMessage());
  } else {
    session.once(Session.Events.QUEUED, function(userId, sseEvent) {
      res.send(session.popEvent(userId).toSseMessage());
    });
  }
};

/**
 * Sends a message for all participants of the given game.
 * @param {string} gameId ID of the game to send the message to.
 * @param {!Object} msg The message to be broadcast.
 */
Server.prototype.msg = function(gameId, msg) {
  if (!this.sessions_[gameId]) {
    throw 'Game ID [' + gameId + '] does not exist';
  }

  this.sessions_[gameId].queueEvent(Server.Events.MESSAGE, {msg: msg});
};

/**
 * Sends a message to all participants of the given game to sync up.
 * @param {string} gameId ID of the game to be synced.
 */
Server.prototype.sync = function(gameId) {
  if (!this.sessions_[gameId]) {
    throw 'Game ID [' + gameId + '] does not exist';
  }

  this.sessions_[gameId].queueEvent(Server.Events.SYNC, {});
};

/**
 * Sends the current game state to all participants of the given game.
 * @param {string} gameId ID of the game to send the game state to.
 * @param {!Object} gameState The game state to be broadcast.
 */
Server.prototype.syncAck = function(gameId, gameState) {
  if (!this.sessions_[gameId]) {
    throw 'Game ID [' + gameId + '] does not exist';
  }

  this.sessions_[gameId].queueEvent(Server.Events.SYNC_ACK, {gameState: gameState});
}

module.exports = Server;
