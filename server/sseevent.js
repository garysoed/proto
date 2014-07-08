var requirejs = require('requirejs');

requirejs.define('sseevent', ['common/events', 'common/pretty'], function(Events) {
  
  /**
   * Constructor for SSE Event.
   * 
   * @param {string} id ID of the SSE Event.
   * @param {string} type Type of the SSE Event.
   * @param {!Object} data Data of the SSE Event.
   *
   * @class
   */
  SseEvent = function(id, type, data) {
    this.id_ = id;
    this.type_ = type;
    this.data_ = data;
  };
  
  /**
   * Converts the array of {@link SseEvent}s to string to be sent over the wire. The ID set will
   * use the last ID of the events given. The type of event will be set to 
   * {@link Events.Server.MESSAGE}. Every event will be converted to JSON of type 
   * <code>{{id:string, type:string, data:!Object}}</code>.
   *
   * @param  {!SseEvent[]} events SseEvents to be converted to string.
   * @return {string} String form of the SseEvents to be sent over the wire.
   *
   * @static
   */
  SseEvent.toSseMessage = function(events) {
    if (events.length === 0) {
      return null;
    } else {
      var id = events[events.length - 1].id_;
      var eventObjs = events.map(function(event) {
        return {id: event.id_, type: event.type_, data: event.data_};
      });
      return 'id: {0}\ndata: {1p}\n\n'.format(id, JSON.stringify(eventObjs));
    }
  };

  return SseEvent;
});
