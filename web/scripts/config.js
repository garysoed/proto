require.config({
  paths: {
    'jquery': '../../bower_components/jquery/dist/jquery',
    'jquery-ui': '../../bower_components/jquery-ui/ui',
    'polymer-platform': '../../bower_components/platform/platform',
    'polymer': '../../bower_components/polymer/polymer',
    'common': '../../common',
    'mock': '../../testing/mock'
  },
  shim : {
    'jquery': {
      exports: '$'
    },
    'polymer': {
      deps: ['polymer-platform']
    }
  }
});