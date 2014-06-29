var runner = require('qunit');

var callback = function(err) {
  if (err) {
    console.warn(err);
  }
};

runner.setup({
  log: {
    assertions: true,
    errors: true,
    summary: true,
    testing: true
  }
});


runner.run({
  code: __dirname + '/server/server.js',
  tests: __dirname + '/server/server_test.js',
  deps: [
    __dirname + '/server/asserts.js'
  ]
}, callback);


runner.run({
  code: __dirname + '/server/session.js',
  tests: __dirname + '/server/session_test.js'
}, callback);


runner.run({
  code: __dirname + '/server/sseevent.js',
  tests: __dirname + '/server/sseevent_test.js'
}, callback);