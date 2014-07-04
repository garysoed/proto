var requirejs = require('requirejs');
var config = require('./config');
requirejs.config(config);
requirejs(['mock', 'sseevent'], function(mock, SseEvent) {
  /**
   * Tests event.toSseMessage
   */
  QUnit.module('event.toSseMessage');

  QUnit.test('good', function(assert) {
    var id = 'eventId';
    var type = 'eventType';
    var data = {sseEvent: data};
    var sseEvent = new SseEvent(id, type, data);
    assert.equal(
        sseEvent.toSseMessage(),
        'id: ' + id + '\nevent: ' + type + '\ndata: ' + JSON.stringify(data) + '\n\n',
        'SSE message is as expected');
  });
});

