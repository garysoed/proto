/** @module server/server */
var sessions = {};

/**
 * @param {}
 */
module.exports.register = function (req, res) {
  console.log(userId);
  if (!userId) {
    throw 'UserId required';
  }
  var gameId = gameId || Date.now();
  if (sessions[gameId] === undefined) {
    sessions[gameId] = [];
  }

  sessions[gameId].splice(0, 0, userId);
  return gameId;
};