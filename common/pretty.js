/** @module common/pretty */
if (typeof define !== 'function') {
  var define = require('amdefine')(module); 
}

define(function() {
  if (!String.prototype.format) {
    function oneline(string) {
      return string.replace(/\n/g, '\\n')
          .replace(/\t/g, '\\t');
    }

    function pretty(value) {
      switch (typeof value) {
        case 'number':
          return value;
        case 'string':
          return '"' + value + '"';
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
          return oneline(JSON.stringify(value));
      }
    }

    String.prototype.format = function() {
      var args = arguments;
      return this.replace(/{(\d+)(p?)}/g, function(match, number, isPretty) { 
        return typeof args[number] != 'undefined'
            ? (isPretty ? args[number] : pretty(args[number]))
            : match
        ;
      });
    };

    return {pretty: pretty};
  }
});