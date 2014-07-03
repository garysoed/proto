/** @module server/sseevent */
var requirejs = require('requirejs');

requirejs.define('sseevent', function() {

  /**
   * Constructor of Events that the server can send to the client.
   */
  SseEvent = function(id, type, data) {
    this.id_ = id;
    this.type_ = type;
    this.data_ = data;
  };

  /**
   * @return {string} The event as an SSE message.
   */
  SseEvent.prototype.toSseMessage = function() {
    return 'id: ' + this.id_ + 
        '\nevent: ' + this.type_ + 
        '\ndata: ' + JSON.stringify(this.data_) + 
        '\n\n';
  };

  return SseEvent;
});
