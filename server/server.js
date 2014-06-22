/** @module server */
var asserts = require('./asserts');

var sessions = {};

function sendEvent(res, event, data) {
  res.send('id: ' + Date.now() + '\nevent: ' + event + '\ndata: ' + JSON.stringify(data) + '\n\n');
};

/**
 * Generates a new game.
 * @returns {{gameId: string}} Object containing the ID of the newly created game.
 */
module.exports.newGame = function() {
  var gameId = Date.now();
  sessions[gameId] = {};
  return {gameId: gameId};
};

/**
 * Listen to updates from other clients.
 * @param {Object} params The parameters from the request object.
 * @param {string} params.userId The user ID of the user to be registered.
 * @param {string} params.gameId The gameId to join.
 * @param {module:express.Response} res The Response object from Express.
 * @returns {{userIds: [string]}|null} Object containing existing user Ids if this is a new session 
 *     for the user. Or null if this is not a new session for the user.
 */
module.exports.getUpdates = function(params, res) {
  var userId = asserts.requireArgExists(params.userId, 'userId');
  var gameId = asserts.requireArgExists(params.gameId, 'gameId');

  if (!sessions[gameId]) {
    throw 'gameId ' + gameId + ' does not exist';
  }

  var newSession = !sessions[gameId][userId];
  sessions[gameId][userId] = res;
  if (newSession) {
    var existingUserIds = [];
    for (var existingUserId in sessions[gameId]) {
      existingUserIds.push(existingUserId);
    }
    sendEvent(res, 'init', {userIds: existingUserIds});
  }
};

module.exports.sendUpdate = function(params) {
  var msg = asserts.requireArgExists(params.msg, 'msg');
  var gameId = asserts.requireArgExists(params.gameId, 'gameId');

  if (!sessions[gameId]) {
    throw 'gameId ' + gameId + ' does not exist';
  }

  for (var userId in sessions[gameId]) {
    sendEvent(sessions[gameId][userId], 'message', {msg: msg});
  }
};

/**
 * @param {Object} params The parameters from the request object.
 * @param {string} params.userId The user ID of the user to be unregistered.
 * @param {string} params.gameId The game ID for the user to be unregistered from.
 */
module.exports.unregister = function(params) {
  var userId = asserts.requireArgExists(params.userId, 'userId');
  var gameId = asserts.requireArgExists(params.gameId, 'gameId');

  if (sessions[gameId]) {
    delete sessions[gameId][userId];
  }
};