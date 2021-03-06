(function() {
  var oneline = function(string) {
    return string.replace(/\n/g, '\\n')
        .replace(/\t/g, '\\t');
  };

  var prettify = function(value) {
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
          if (value.length === 0) {
            return '[]';
          } else {
            return '[' 
                + value
                    .map(function(entry) {
                      return prettify(entry);
                    })
                    .join(',')
                + ']';
          }
        } else if (value instanceof Node) {
          return value.toString();
        } else if (value.toPrettyString instanceof Function) {
          return value.toPrettyString();
        }
        return JSON.stringify(value);
    }
  };

  if (!String.prototype.format) {
    /**
     * Replace placeholders in the string with the given argument objects. Placeholders are numbers
     * surrounded by braces, such as {0}, {1}, {2}.
     * 
     * @param  {...*} var_args Any objects to replace the placeholders.
     * @return {string} The formatted string.
     */
    String.prototype.format = function(var_args) {
      var args = arguments;
      return this.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined' ? args[number] : match;
      });
    };
  }

  var Pretty = {
    prettify: prettify
  };


  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = Pretty;
    }
  } else {
    this.Pretty = Pretty;
  }
}).call(this);

