/** @module common/pretty */
if (typeof define !== 'function') {
  var define = require('amdefine')(module); 
}

define(function() {
  if (!String.prototype.format) {
    var oneline = function(string) {
      return string.replace(/\n/g, '\\n')
          .replace(/\t/g, '\\t');
    };

    var pretty = function(value) {
      switch (typeof value) {
        case 'number':
          return value;
        case 'string':
          return '"' + oneline(value) + '"';
        case 'function':
          var functionName = value.name || 'function';
          return functionName + '()';
        default:
          if (value instanceof Array) {
            return value
                .map(function(entry) {
                  return pretty(entry);
                })
                .join(',');
          } else if (value.toPrettyString instanceof Function) {
            return value.toPrettyString();
          }
          return JSON.stringify(value);
      }
    };

    /**
     * Replace placeholders in the string with the given argument objects. Placeholders are numbers
     * surrounded by braces, such as {0}, {1}, {2}. The arguments will be pretty printed, unless you
     * specify a p in the placeholder. For example: {1p}.
     * 
     * @param  {...*} var_args Any objects to replace the placeholders.
     * @return {string} The pretty printed string.
     */
    String.prototype.format = function(var_args) {
      var args = arguments;
      return this.replace(/{(\d+)(p?)}/g, function(match, number, isPretty) { 
        return typeof args[number] != 'undefined' ? 
            (isPretty ? args[number] : pretty(args[number])) : match;
      });
    };

    return {pretty: pretty};
  }
});