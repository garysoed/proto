(function() {
  /**
   * Errors caused by the client.
   *
   * @param {ClientError.Code} code The error code for the client.
   * @param {string} message Message detailing the error.
   */
  var ClientError = function(code, message) {
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

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = ClientError;
    }
  } else {
    this.ClientError = ClientError;
  }
}).call(this);