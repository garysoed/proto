if (typeof define !== 'function') {
  var define = require('amdefine')(module); 
}

define(function() {
  var ClientError = {};

  /**
   * Errors caused by the client.
   *
   * @param {ClientError.Code} code The error code for the client.
   * @param {string} message Message detailing the error.
   */
  ClientError = function(code, message) {
    this.code = code;
    this.message = message;
    Error.captureStackTrace(this, arguments.callee);
  };

  ClientError.prototype.__proto__ = Error.prototype;

  /**
   * Error codes that the server can throw.
   * @enum {string}
   * @readonly
   */
  ClientError.Code = {
    UNRECOGNIZED_GAME_ID: 'UNRECOGNIZED_GAME_ID',
    UNRECOGNIZED_USER_ID: 'UNRECOGNIZED_USER_ID'
  };

  return ClientError;
});