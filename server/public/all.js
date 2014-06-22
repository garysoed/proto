var source;
function startListen(userId, gameId) {
  source = new EventSource('getUpdates?userId=' + userId + '&gameId=' + gameId);
  source.addEventListener('init', function(e) {
    $('#log').append(e.data);
  });

  source.addEventListener('message', function(e) {
    $('#log').append(e.data);
  });
}

$(document).ready(function() {
  $('#submit').click(function() {
    var userId = $('#userId')[0].value;
    var gameId = $('#gameId')[0].value;
    if (source) {
      $.post('sendUpdate', {msg: $('#message')[0].value, gameId: gameId});
    } else if (gameId) {
      startListen(userId, gameId);
    } else {
      $.post('newGame').
          done(function(data) {
            $('#gameId')[0].value = data.gameId;
            startListen(userId, data.gameId);
          });
    }
  })
});