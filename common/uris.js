(function() {
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

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = Uris;
    }
  } else {
    this.Uris = Uris;
  }
}).call(this);