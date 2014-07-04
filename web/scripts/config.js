require.config({
  paths: {
    'jquery': '../../bower_components/jquery/dist/jquery',
    'mock': '../../testing/mock',
    'mockajax': '../../testing/mockajax',
    'common/events': '../../common/events',
    'common/pretty': '../../common/pretty'
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