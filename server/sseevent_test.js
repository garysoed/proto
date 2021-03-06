var Mock = require('../testing/mock');
var SseEvent = require('./sseevent');
var Events = require('../common/events');
var Pretty = require('../common/pretty');

/**
 * Tests SseEvent.toSseMessage
 */
QUnit.module('SseEvent.toSseMessage');

QUnit.test('good', function(assert) {
  var id1 = 'eventId1';
  var id2 = 'eventId2';
  var sseEvent1 = new SseEvent(id1, 'event1', {data: 'data1'});
  var sseEvent2 = new SseEvent(id2, 'event2', {data: 'data2'});

  var sseEvent1Obj = {id: id1, type: 'event1', data: {data: 'data1'}};
  var sseEvent2Obj = {id: id2, type: 'event2', data: {data: 'data2'}};
  var json = JSON.stringify([sseEvent1Obj, sseEvent2Obj]);
  assert.equal(
      SseEvent.toSseMessage([sseEvent1, sseEvent2]),
      'id: {0}\ndata: {1}\n\n'.format(Pretty.prettify(id2), json),
      'SSE message is as expected');
});

QUnit.test('empty array', function(assert) {
  assert.equal(SseEvent.toSseMessage([]), null, 'Returns null for empty arrays');
});
