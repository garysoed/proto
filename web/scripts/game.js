/** @module web */

define(['jquery', 'network'], function($, Network) {
  var network = null;
  var state = {};

  function assertSignedIn() {
    if (!network) {
      throw 'Need to sign in first';
    }
  }

  function handleMessage(e, msg) {
    // TODO: Pass to processor / game logic.
    state[msg.type] = msg.data.value;
    $(Game).trigger(
        msg.type + '.' + msg.data.change, 
        {actor: msg.data.actor, value: msg.data.value});
  }

  function handleNewGameState(e, gameState) {
    state = gameState || {};
    $(Game).trigger(Game.Events.NEW_GAME_STATE);
  }

  function handleJoin() {
    $(Game).trigger(Game.Events.JOIN, network.getGameId());
  }

  function handlePlayerAdded(e, userId) {
    $(Game).trigger(Game.Events.PLAYER_ADDED, userId);
  }

  function handlePlayerRemoved(e, userId) {
    $(Game).trigger(Game.Events.PLAYER_REMOVED, userId);
  }

  Game = {};

  /**
   * Events that the Game can trigger.
   *
   * @enum {string}
   */
  Game.Events = {
    JOIN: 'Game.Events.join',
    NEW_GAME_STATE: 'Game.Events.new_game_state',
    PLAYER_ADDED: 'Game.Events.player_added',
    PLAYER_REMOVED: 'Game.Events.player_removed'
  };

  /**
   * Sign into the game.
   *
   * @param {string} userId The User ID to sign in.
   */
  Game.signIn = function(userId) {
    if (network) {
      network.leave();
    }
    network = new Network(userId, Game.getState);
    $(network)
        .bind(Network.Events.MESSAGE, handleMessage)
        .bind(Network.Events.NEW_GAME_STATE, handleNewGameState)
        .bind(Network.Events.JOIN, handleJoin)
        .bind(Network.Events.PLAYER_ADDED, handlePlayerAdded)
        .bind(Network.Events.PLAYER_REMOVED, handlePlayerRemoved);
  };

  Game.create = function() {
    assertSignedIn();
    network.create();
  };

  Game.join = function(gameId) {
    assertSignedIn();
    network.join(gameId);
  };

  Game.change = function(field, change, value) {
    // TODO add validator
    assertSignedIn();
    network.send(field, {actor: network.getUserId(), change: change, value: value});
  };

  Game.getState = function() {
    return state;
  };

  return Game;
});