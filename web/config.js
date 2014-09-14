requirejs.config({
  paths: {
    'jquery': '../bower_components/jquery/dist/jquery',
    'components': 'components'
  },
  shim: {
    'jquery': {
      exports: '$'
    }
  }
});