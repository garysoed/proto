if (typeof define !== 'function') {
  var define = require('amdefine')(module); 
}

define(function() {
  var Events = {};

  /**
   * Events that the server sends out.
   * @enum {string}
   * @readonly
   */
  Events.Server = {
    ERROR: 'Proto.error',
    MESSAGE: 'Proto.message',
    PLAYER_ADDED: 'Proto.player_added',
    PLAYER_REMOVED: 'Proto.player_removed',
    SYNC: 'Proto.sync',
    SYNC_ACK: 'Proto.sync_ack',
  };

  return Events;
});