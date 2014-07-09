module.exports = {
  baseUrl: __dirname,
  nodeRequire: require,
  paths: {
    'common/events': '../common/events',
    'common/pretty': '../common/pretty',
    'common/uris': '../common/uris',
    'common/clienterror': '../common/clienterror',
    'mock': '../testing/mock'
  }
};