var runner = require('qunit');

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
})


runner.run({
  code: __dirname + '/server/session.js',
  tests: __dirname + '/server/session_test.js',
});