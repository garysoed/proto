module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    'jshint': {
      options: {
        proto: true,
        extract: 'auto'
      },
      all: [
        '**/*.js', 
        '**/*.html',
        '!**/*_test_run.html',
        '!doc/**',
        '!**/bower_components/**', 
        '!**/node_modules/**',
        '!server/public/**'
      ],
    },
    'qunit': {
      scripts: ['web/scripts/**/*_test.html']
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
    },
    'jsdoc': {
      all: {
        src: [
          'server/**/*.js', 
          'common/**/*.js', 
          'web/**/*.js', 
          'web/**/*.html',
          'testing/**/*.js',
          '!**/require.js',
          '!server/public/**'
        ], 
        options: {
          destination: 'doc',
          private: false,
          explain: true
        }
      }
    },
    'less': {
      development: {
        files: {
          'web/components/css/all.css': ['web/components/**/*.less']
        }
      }
    },
    'vulcanize': {
      default: {
        files: {
          'web/components/game-logic_test_run.html': 'web/components/game-logic_test.html'
        }
      }
    },
    'watch': {
      webtests: {
        files: [
          'web/components/**/*_test.html', 
          'web/components/**/*.html', 
          '!web/components/**/*_test_run.html'],
        tasks: ['vulcanize'],
        options: {
          atBegin: true
        }
      },
      less: {
        files: [
          'web/**/*.less'
        ],
        tasks: ['less'],
        options: {
          atBegin: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-node-qunit');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-vulcanize');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Register default tasks.
  grunt.registerTask('check', ['node-qunit', 'qunit:scripts', 'jshint']);
  grunt.registerTask('default', ['check']);
};