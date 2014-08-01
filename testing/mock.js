(function() {
  var Pretty = this.Pretty;

  if (typeof Pretty === 'undefined') {
    if (typeof require !== 'undefined') {
      Pretty = require('../common/pretty');
    } else {
      throw new Error('Cannot find module Pretty');
    }
  }

  if (typeof Function.prototype.bind !== 'function') {
    Function.prototype.bind = function(scope) {
      var func = this;
      return function() {
        return func.apply(scope, arguments);
      };
    };
  }

  function toArgArray(argumentsObj) {
    return Array.prototype.slice.call(argumentsObj);
  }

  /**
   * Deep equals the two objects.
   * 
   * @param  {*} obj1 The first object to compare.
   * @param  {*} obj2 The second object to compare.
   * @return {boolean} True iff the two objects are deeply equal.
   * 
   * @static
   * @private
   */
  function deepEqual(obj1, obj2) {
    if (obj1 === obj2) {
      return true;
    }
    
    if (!(obj1 instanceof Object) || !(obj2 instanceof Object)) {
      return obj1 === obj2;
    }

    if (obj1.equals instanceof Function) {
      return obj1.equals(obj2);
    }

    if (obj2.equals instanceof Function) {
      return obj2.equals(obj1);
    }

    for (var key in obj1) {
      if (!deepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }
    return true;
  }

  function escape(input) {
    return input.replace(/\n/g, '\\n').replace(/\t/g, '\\t');
  }

  /**
   * Argument matcher.
   * 
   * @param {!Function} equalFn Function that returns true iff the current object is equal to the 
   *     given object.
   * @param {!string} name Name of the matcher.
   * 
   * @class
   */
  var Matcher = function(equalFn, name) {
    this.equals = equalFn;

    this.toJSON = function() { return name; };
    this.toString = this.toJSON;
  };

  /**
   * Expectation object.
   * 
   * @class
   */
  var Expectation = function() {
    var f = function() {
      f.matchers = toArgArray(arguments);
      return f;
    };

    /**
     * Sets the expectation to call the given function when the set matchers are met.
     * 
     * @param {Function} callback Function to be called when the set matchers are met. Function 
     *     will be called with the original arguments.
     */
    f.do = function(callback) {
      f.callback = callback;
    };

    f.doReturn = function(value) {
      f.do(function() { return value; });
    };
    f.run = function(args) {
      return f.callback.apply(null, args);
    };
    f.matchers = null;
    f.callback = function() { };

    return f;
  };


  /**
   * Mock namespace.
   */
  var Mock = {};

  Mock.when = function(mock) {
    var expectation = Expectation();
    mock.expectations.push(expectation);
    return expectation;
  };

  /**
   * @return {!Matcher} Matcher that matches everything.
   *
   * @static
   */
  Mock.any = function() {
    return new Matcher(
        function() { return true; },
        '*');
  };

  Mock.saver = function(opt_matcher) {
    return new Matcher(
        function(other) {
          var matches = !opt_matcher || opt_matcher.equals(other);
          if (matches) {
            this.arg = other;
          }
          return matches;
        },
        'saver(' + (opt_matcher ? opt_matcher.toString() : '*') + ')');
  };

  Mock.instanceOf = function(type, name) {
    return new Matcher(
        function(other) { return other instanceof type; },
        '{' + (name ? name : Pretty.prettify(type)) + '}');
  };

  /**
   * @param  {string} name Name of the mocked function.
   * @return {!Function} The mock function.
   *
   * @static
   */ 
  Mock.mockFunction = function(name) {
    var id = Date.now();
    var f = function() {
      var args = toArgArray(arguments);
      f.interactions.push(args);
      
      // Check for any expectations.
      var matchingExpectations = f.expectations.filter(function(expectation) {
        return !expectation.matchers || deepEqual(expectation.matchers, args);
      });
      if (matchingExpectations.length > 0) {
        return matchingExpectations[matchingExpectations.length - 1].run(args);
      }
    };
    f.interactions = [];
    f.functionName = name;
    f.expectations = [];
    f.toString = function() { return '{0}_{1}'.format(name, id); };
    return f;
  };

  Mock.spy = function(scope, name) {
    var handler = scope[name].bind(scope);
    var mock = Mock.mockFunction(name);
    Mock.when(mock).do(handler);
    Mock.override(scope, name, mock);
    return mock;
  };

  /**
   * Resets the mock.
   * @param {!Object} mock The mock to be reset.
   */
  Mock.reset = function(mock) {
    mock.interactions = [];
  };

  /**
   * Verifies the mock.
   * @param {!Function} mock The mock to be verified.
   * @param {number=} The number of time the function is expected to be called.
   */
  Mock.verify = function(mock, opt_times) {
    var times = (opt_times === undefined) ? 1 : opt_times;
    return function() {
      var args = toArgArray(arguments);
      var matches = mock.interactions.filter(function(i) {
        return deepEqual(i, args);
      });

      var result = matches.length === times;
      var msg = result ? 
          '{0} call(s) for {1}({2})'.format(times, mock.functionName, Pretty.prettify(args)) :
          '{0} call(s) for {1}({2})\nOther interactions:\n{3}'.format(
              times, 
              mock.functionName, 
              Pretty.prettify(args), 
              Pretty.prettify(mock.interactions));
      QUnit.push(matches.length === times, matches.length, times, msg);
    };
  };

  /**
   * Verifies the mock for any kind of interaction. Use this if you don't care about the number of
   * arguments passed to the mock
   *
   * @param  {!Function} mock The mock to be verified.
   * @param  {number=} opt_times The number of times the mock is expected to be called.
   */
  Mock.verifyAnyInteraction = function(mock, opt_times) {
    var times = (opt_times === undefined) ? 1 : opt_times;
    QUnit.push(
        mock.interactions.length === times,
        mock.interactions.length,
        times, 
        '{0} call(s) for {1}(...*)'.format(times, mock.functionName));
  };

  var overrides = [];
  Mock.override = function(scope, name, override) {
    overrides.push({scope: scope, name: name, value: scope[name]});
    scope[name] = override;
    return override;
  };

  Mock.teardown = function() {
    overrides.forEach(function(override) {
      override.scope[override.name] = override.value;
    });
  };

  QUnit.testDone(Mock.teardown);

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = Mock;
    }
  } else {
    this.Mock = Mock;
  }
}).call(this);
