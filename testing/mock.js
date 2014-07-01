/** @module testing/mock */
var asserts;

var deepEqual = function(obj1, obj2) {
  if (!(obj1 instanceof Object)) {
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
};

var escape = function(input) {
  return input.replace(/\n/g, '\\n').
      replace(/\t/g, '\\t');
};

/**
 * Argument matcher.
 * @param {!Function} equalFn Function that returns true iff the current object is equal to the 
 *     given object.
 * @param {!string} name Name of the matcher.
 * @class
 */
var Matcher = function(equalFn, name) {
  this.equals = equalFn;

  this.toString = function() { return name; };
};

/**
 * Initializes for the given QUnit asserts.
 * @param {module:qunit.asserts} qunitAsserts The asserts object from QUnit.
 */
module.exports.forQUnit = function(qunitAsserts) {
  asserts = qunitAsserts;
};

/**
 * @return {!Matcher} Matcher that matches everything.
 */
module.exports.any = function() {
  return new Matcher(
      function() { return true; },
      'any()');
};

/**
 * @param {string} name Name of the mocked function.
 * @return {!Function} The mock function.
 */ 
module.exports.mockFunction = function(name) {
  var f = function() {
    f.interactions.push(arguments);
  };
  f.interactions = [];
  f.functionName = name;
  return f;
};

/**
 * Resets the mock.
 * @param {!Object} mock The mock to be reset.
 */
module.exports.reset = function(mock) {
  mock.interactions = [];
};

/**
 * Verifies the mock.
 * @param {!Function} mock The mock to be verified.
 * @param {number=} The number of time the function is expected to be called.
 */
module.exports.verify = function(mock, opt_times) {
  var times = (opt_times === undefined) ? 1 : opt_times;
  return function() {
    var args = Array.prototype.slice.call(arguments);
    var matches = mock.interactions.filter(function(i) {
      return deepEqual(i, args);
    });
    asserts.equal(
      matches.length, 
      times, 
      escape(times + ' call(s) for ' + mock.functionName + '(' + args + ')'));
  };
};
