var mock = require('../testing/mock');
var SseEvent = require('./sseevent');

/**
 * Tests event.toSseMessage
 */
QUnit.module('event.toSseMessage');

QUnit.test('good', function(assert) {
  mock.forQUnit(assert);
  
  var id = 'eventId';
  var type = 'eventType';
  var data = {sseEvent: data};
  var sseEvent = new SseEvent(id, type, data);
  assert.equal(sseEvent.toSseMessage(),
      'id: ' + id + '\nevent: ' + type + '\ndata: ' + JSON.stringify(data) + '\n\n');
});
