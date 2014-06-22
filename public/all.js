$(document).ready(function() {
  var gameId;

  $('#submit').click(function() {
    var userId = $('#userId')[0].value;
    $.post('register', {userId: userId, gameId: gameId}, function(data) {
      console.log(data);
    });
  })
});