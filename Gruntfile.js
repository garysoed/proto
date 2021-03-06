module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    'jshint': {
      options: {
        proto: true,
        extract: 'auto',
        reporter: require('jshint-stylish')
      },
      all: [
        '**/*.js', 
        '**/*.html',
        '!tests/**/*_test.html',
        '!doc/**',
        '!**/bower_components/**', 
        '!**/node_modules/**',
        '!server/public/**',
        '!Gruntfile.js'
      ],
    },
    'qunit': {
      scripts: ['test_gen/web/scripts/*_test.html']
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
          'web/lib/css/all.css': ['web/**/*.less']
        }
      }
    },
    'traceur': {
      options: {
        // traceur options here
      },
      custom: {
        files: [{
          expand: true,
          cwd: 'web-src',
          src: ['*.js', '*.html'],
          dest: 'web-bin'
        }]
      },
    },
    'vulcanize': {
      default: {
        files: {
          'test_gen/web/components/card_test.html': 'web/components/card_test.html',
          'test_gen/web/components/game-logic_test.html': 'web/components/game-logic_test.html',
          'test_gen/web/scripts/network_test.html': 'web/scripts/network_test.html'
        }
      }
    },
    'watch': {
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
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-traceur');

  // Register default tasks.
  grunt.registerTask('check', ['node-qunit', 'qunit:scripts', 'jshint']);
  grunt.registerTask('default', ['check']);
};