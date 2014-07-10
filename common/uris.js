if (typeof define !== 'function') {
  var define = require('amdefine')(module); 
}

define(function() {
  var Uris = {};

  /**
   * URIs that the server recognize.
   * @enum {string}
   * @readonly
   */
  Uris.Request = {
    CREATE: 'create',
    JOIN: 'join',
    LEAVE: 'leave',
    STREAM: 'stream',
    MESSAGE: 'msg',
    SYNC: 'sync',
    SYNC_ACK: 'syncack',
  };

  return Uris;
});