/** @module server/server */
var asserts = require('./asserts');
var util = require('./util');

/**
 * The server class.
 * @class
 */
Server = function() {
  this.sessions_ = {}
};

/**
 * Events that the server sends out.
 * @enum {string}
 * @readonly
 */
Server.Events = {
  INIT: 'init',
  MESSAGE: 'message'
};

/**
 * Generates a new game.
 * @returns {{gameId: string}} Object containing the ID of the newly created game.
 */
Server.prototype.newGame = function() {
  var gameId = Date.now();
  this.sessions_[gameId] = {};
  return {gameId: gameId};
};

/**
 * Listen to updates from other clients.
 * @param {Object} params The parameters from the request object.
 * @param {string} params.userId The user ID of the user to be registered.
 * @param {string} params.gameId The gameId to join.
 * @param {module:express.Response} res The Response object from Express.
 */
Server.prototype.getUpdates = function(params, res) {
  var userId = asserts.requireArgExists(params.userId, 'userId');
  var gameId = asserts.requireArgExists(params.gameId, 'gameId');

  if (!this.sessions_[gameId]) {
    throw 'gameId ' + gameId + ' does not exist';
  }

  var newSession = !this.sessions_[gameId][userId];
  this.sessions_[gameId][userId] = res;

  if (newSession) {
    var existingUserIds = [];
    for (var existingUserId in this.sessions_[gameId]) {
      existingUserIds.push(existingUserId);
    }
    res.send(util.sseMessage(Server.Events.INIT, {userIds: existingUserIds}));
  }
};

/**
 * Sends an update to all the users.
 * @param {Object} params The parameters from the request object.
 * @param {*} params.msg The message to be sent to all users.
 * @param {string} params.gameId The game ID to send the message to.
 */
Server.prototype.sendUpdate = function(params) {
  var msg = asserts.requireArgExists(params.msg, 'msg');
  var gameId = asserts.requireArgExists(params.gameId, 'gameId');

  if (!this.sessions_[gameId]) {
    throw 'gameId ' + gameId + ' does not exist';
  }

  for (var userId in this.sessions_[gameId]) {
    this.sessions_[gameId][userId].send(util.sseMessage(Server.Events.MESSAGE, {msg: msg}));
  }
};

/**
 * Unregisters the user from the given game.
 * @param {Object} params The parameters from the request object.
 * @param {string} params.userId The user ID of the user to be unregistered.
 * @param {string} params.gameId The game ID for the user to be unregistered from.
 */
Server.prototype.unregister = function(params) {
  var userId = asserts.requireArgExists(params.userId, 'userId');
  var gameId = asserts.requireArgExists(params.gameId, 'gameId');

  if (this.sessions_[gameId]) {
    delete this.sessions_[gameId][userId];
  }
  console.log(this.sessions_);
};

module.exports = Server;
