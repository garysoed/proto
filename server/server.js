/** @module server/server */
var asserts = require('./asserts');
var util = require('./util');

/**
 * The server class.
 * @class
 */
Server = function() {
  this.sessions = {}
};

/**
 * Generates a new game.
 * @returns {{gameId: string}} Object containing the ID of the newly created game.
 */
Server.prototype.newGame = function() {
  var gameId = Date.now();
  this.sessions[gameId] = {};
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

  if (!this.sessions[gameId]) {
    throw 'gameId ' + gameId + ' does not exist';
  }

  var newSession = !this.sessions[gameId][userId];
  this.sessions[gameId][userId] = res;
  if (newSession) {
    var existingUserIds = [];
    for (var existingUserId in this.sessions[gameId]) {
      existingUserIds.push(existingUserId);
    }
    res.send(util.sseMessage('init', {userIds: existingUserIds}));
  }
};

/**
 * Sends an update to all the users.
 * @param {Object} params The parameters from the request object.
 * @param {*} params.msg The message to be sent to all users.
 * @param {string} params.gameId The game ID to send the message to.
 * @param {module:express.Response} res The Response object from Express.
 */
Server.prototype.sendUpdate = function(params, res) {
  var msg = asserts.requireArgExists(params.msg, 'msg');
  var gameId = asserts.requireArgExists(params.gameId, 'gameId');

  if (!this.sessions[gameId]) {
    throw 'gameId ' + gameId + ' does not exist';
  }

  for (var userId in this.sessions[gameId]) {
    this.sessions[gameId][userId].send(util.sseMessage('message', {msg: msg}));
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

  if (this.sessions[gameId]) {
    delete this.sessions[gameId][userId];
  }
};

module.exports = Server;
