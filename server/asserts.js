/** @module asserts */

/**
 * Checks if the given argument value is defined.
 * @param {*} value The value to be checked.
 * @param {string} [name='Arg'] The name of the argument checked.
 */
module.exports.requireArg = function(value, name) {
  name = name || 'Arg';
  if (value === undefined) {
    throw name + ' required';
  }
  return value;
};

/**
 * Checks if the given argument value is defined and is non null.
 * @param {*} value The value to be checked.
 * @param {string} [name='Arg'] The name of the argument checked.
 */
module.exports.requireArgNonNull = function(value, name) {
  name = name || 'Arg';
  this.requireArg(value, name);
  if (value === null) {
    throw name + ' expected to be non null';
  }
  return value;
};

/**
 * Checks if the given argument value is defined and is not empty string or object.
 * @param {*} value The value to be checked.
 * @param {string} [name='Arg'] The name of the argument checked.
 */
module.exports.requireArgExists = function(value, name) {
  name = name || 'Arg';
  this.requireArgNonNull(value, name);
  if ((value instanceof String) && value === '') {
    throw name + ' expected to not be empty string';
  }
  if ((value instanceof Object) && value === {}) {
    throw name + ' expected to not be empty object';
  }
  return value;
};
