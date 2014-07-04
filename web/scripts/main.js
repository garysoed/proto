define(['network', 'jquery'], function(Network, $) {
  var network;

  function gameStateProvider() {
    return $('#message')[0].value;
  }

  $(document).ready(function() {
    $('#submit').click(function() {
      var userId = $('#userId')[0].value;
      var gameId = $('#gameId')[0].value;
      
      network = new Network(userId, gameStateProvider);
      $(network).bind(Network.Events.JOIN, function(e, data) {
        $('#gameId')[0].value = data.gameId;
      });
      if (gameId) {
        network.join(userId, gameId);
      } else {
        network.create();
      }
    });
  });
});
