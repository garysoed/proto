define('network', ['jquery'], function($) {

  function Network(userId, gameStateProvider, opt_gameId) {
    this.userId_ = userId;

    this.gameId_ = opt_gameId || null;

    this.gameStateProvider_ = gameStateProvider;

    this.source_ = null;
  }

  Network.Events = {
    SYNC: 'Network.sync'
  };

  Network.prototype.create = function() {
    $.post('create')
        .done(function(data) {
          this.gameId_ = data.gameId;
          this.join();
        }.bind(this));
  };

  Network.prototype.join = function() {
    $.post('join', {gameId: this.gameId_, userId: this.userId_}).done(function() {
      this.startStream_();
      this.sync_();
    }.bind(this));
  };


  Network.prototype.startStream_ = function() {
    this.source_ = new EventSource('stream?userId=' + userId + '&gameId=' + gameId);

    // TODO: Share the event types with the server.
    this.source_.addEventListener('Proto.sync', this.syncAck_.bind(this));
  };

  Network.prototype.sync_ = function() {
    $.post('sync', {gameId: this.gameId_});
  };

  Network.prototype.syncAck_ = function() {
    $.post('syncack', {gameId: this.gameId_, gameState: this.gameStateProvider_()});
  };

  return Network;
});
