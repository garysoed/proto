module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    'jshint': {
      options: {
        proto: true
      },
      all: ['server/**/*.js', 'web/**/*.js', '!**/bower_components/**', '!**/node_modules/**'],
    },
    'qunit': {
      all: ['web/scripts/**/*_test.html']
    },
    'node-qunit': {
      server: {
        code: 'server/server.js',
        tests: 'server/server_test.js',
        deps: [
          'server/asserts.js'
        ]
      },
      session: {
        code: 'server/session.js',
        tests: 'server/session_test.js'
      },
      sseevent: {
        code: 'server/sseevent.js',
        tests: 'server/sseevent_test.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-node-qunit');

  // Register default tasks.
  grunt.registerTask('default', ['jshint', 'node-qunit', 'qunit']);
};