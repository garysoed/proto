var Session = require('./session');
var SseEvent = require('./sseevent');

var Events = require('../common/events');
var ClientError = require('../common/clienterror');

/**
 * The server class.
 * 
 * @class
 */
var Server = function() {
  this.sessions_ = {};
};

/**
 * Generates a new game.
 * 
 * @return {{gameId: string}} Object containing the ID of the newly created game.
 */
Server.prototype.create = function() {
  var gameId = Date.now();
  this.sessions_[gameId] = new Session();
  return {gameId: gameId};
};

/**
 * Joins the userId to the given gameId.
 * 
 * @param {string} gameId ID of the game to join.
 * @param {string} userId ID of the user to join the game.
 */
Server.prototype.join = function(gameId, userId) {
  if (!this.sessions_[gameId]) {
    throw new ClientError(ClientError.Code.UNRECOGNIZED_GAME_ID, gameId);
  }

  this.sessions_[gameId].addUser(userId);
  this.sessions_[gameId].queueEvent(Events.Server.PLAYER_ADDED, {userId: userId});
};

/**
 * Drops the user from the given game.
 * 
 * @param {string} gameId The game ID for the user to be dropped from.
 * @param {string} userId The user ID of the user to be dropped.
 */
Server.prototype.leave = function(gameId, userId) {
  if (this.sessions_[gameId]) {
    this.sessions_[gameId].removeUser(userId);
    this.sessions_[gameId].queueEvent(Events.Server.PLAYER_REMOVED, {userId: userId});
  }
};

/**
 * Opens an SSE stream.
 * 
 * @param {string} gameId The game ID to open the stream for.
 * @param {string} userId The user ID to open the stream for.
 * @param {modele:express.Response} res The Response object.
 */
Server.prototype.stream = function(gameId, userId, res) {
  if (!this.sessions_[gameId]) {
    throw new ClientError(ClientError.Code.UNRECOGNIZED_GAME_ID, gameId);
  }

  var session = this.sessions_[gameId];
  var events = session.getEvents(userId);
  if (events.length > 0) {
    console.log('Sending: ' + SseEvent.toSseMessage(events));
    res.send(SseEvent.toSseMessage(events));
    session.clearEvents(userId);
  } else {
    session.once(Session.Events.QUEUED, function(userId, sseEvent) {
      var events = session.getEvents(userId);
      if (events.length > 0) {
        console.log('Sending: ' + SseEvent.toSseMessage(events));
        res.send(SseEvent.toSseMessage(events));
        session.clearEvents(userId);
      } else {
        console.log('No events for ' + userId + ' ' + sseEvent);
      }
    });
  }
};

/**
 * Sends a message for all participants of the given game.
 * 
 * @param {string} gameId ID of the game to send the message to.
 * @param {!Object} msg The message to be broadcast.
 */
Server.prototype.msg = function(gameId, msg) {
  if (!this.sessions_[gameId]) {
    throw new ClientError(ClientError.Code.UNRECOGNIZED_GAME_ID, gameId);
  }

  this.sessions_[gameId].queueEvent(Events.Server.MESSAGE, msg);
};

/**
 * Sends a message to all participants of the given game to sync up.
 * 
 * @param {string} gameId ID of the game to be synced.
 * @param {string} userId ID of the user requesting the sync.
 */
Server.prototype.sync = function(gameId, userId) {
  if (!this.sessions_[gameId]) {
    throw new ClientError(ClientError.Code.UNRECOGNIZED_GAME_ID, gameId);
  }

  var userIds = this.sessions_[gameId].getUsers().filter(function(id) {
    return id !== userId;
  });
  this.sessions_[gameId].queueEvent(Events.Server.SYNC, {}, userIds);
};

/**
 * Sends the current game state to all participants of the given game.
 * 
 * @param {string} gameId ID of the game to send the game state to.
 * @param {string} userId ID of the user that sent the ack.
 * @param {!Object} gameState The game state to be broadcast.
 */
Server.prototype.syncAck = function(gameId, userId, gameState) {
  if (!this.sessions_[gameId]) {
    throw new ClientError(ClientError.Code.UNRECOGNIZED_GAME_ID, gameId);
  }

  var userIds = this.sessions_[gameId].getUsers().filter(function(id) {
    return id !== userId;
  });
  this.sessions_[gameId].queueEvent(Events.Server.SYNC_ACK, {gameState: gameState}, userIds);
};

module.exports = Server;
