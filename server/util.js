/** @module server/util */

/**
 * Formats the input argument as a message to be sent as SSE message.
 * @param {string} event The event type to be sent.
 * @param {!Object} data JSON object containing the payload.
 */
module.exports.sseMessage = function(event, data) {
  return 'id: ' + Date.now() + '\nevent: ' + event + '\ndata: ' + JSON.stringify(data) + '\n\n';
};