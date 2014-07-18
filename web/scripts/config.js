require.config({
  paths: {
    'jquery': '../../bower_components/jquery/dist/jquery',
    'jquery-ui': '../../bower_components/jquery-ui/ui',
    'polymer/platform': '../../bower_components/platform/platform',
    'common': '../../common',
    'mock': '../../testing/mock',
    'mockajax': '../../testing/mockajax',
  },
  shim : {
    'jquery': {
      exports: '$'
    },
    'mock': {
      exports: 'Mock'
    },
    'mockajax': {
      exports: 'Mock'
    }
  }
});