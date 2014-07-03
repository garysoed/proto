require.config({
  baseUrl: 'bower_components',
  paths: {
    jquery: 'jquery/dist/jquery'
  },
  packages: [

  ]
});

var source;
function startListen(userId, gameId) {
  
}

function join(gameId, userId) {
  return $.post('join', {gameId: gameId, userId: userId});
}


require(['jquery'], function() {
  $(document).ready(function() {
    $('#submit').click(function() {
      var userId = $('#userId')[0].value;
      var gameId = $('#gameId')[0].value;
      if (source) {
        $.post('join', {msg: $('#message')[0].value, gameId: gameId});
      } else if (gameId) {
        join(gameId, userId)
            .done(function() {
              startListen(userId, gameId);
            });
      } else {
        $.post('create')
            .done(function(data) {
              $('#gameId')[0].value = data.gameId;
              gameId = data.gameId;

              // Now join the game.
              join(data.gameId, userId)
                  .done(function() {
                    startListen(userId, data.gameId);
                  });
            });
      }
    });
  });
});