define(function (require) {

  'use strict';

  var Backbone = require('backbone');
  var TicTacToe = require('ttt/tictactoe');

  var tpl = require('text!ttt/templates/mainview.ejs');
  var template = _.template(tpl);

  return Backbone.View.extend({

    events: {
      'click button#new-game': 'launchNewGame'
    },

    initialize: function(options) {
      this.state = options.state;
      this.gameViewCounter = 0;
      this.subViews = [];
    },

    render: function() {
      this.$el.html(template(this));
      $('body').addClass('tictactoe-body');
      return this;
    },

    launchNewGame: function() {
      this.gameViewCounter += 1;
      var size = this.$('select#game-size').val() || 3;
      var playerCount = this.$('select#players').val() || 2;
      var ttt = new TicTacToe({
        size: size,
        players: +playerCount,
        gameNum: this.gameViewCounter
      });
      this.subViews.push(ttt);
      this.hideBeginText();
      this.$('.games-container').append(ttt.render().el);
      this.listenTo(ttt, 'close', this.onGameClose);
    },

    onGameClose: function() {
      window.setTimeout(function(){
        this.shouldShowBeginText();
      }.bind(this), 300);
    },

    shouldShowBeginText: function() {
      if(!$('.single-game').length){
        this.showBeginText();
      }
    },

    showBeginText: function() {
      this.$('.begin-text').fadeIn();
    },

    hideBeginText: function() {
      this.$('.begin-text').hide();
    },

    removeSubViews: function() {
      _.each(this.subviews, function(subview){
        subview.remove();
      })
    },

    remove: function() {
      $('body').removeClass('tictactoe-body');
      this.removeSubviews();
      Backbone.View.prototype.remove.apply(this, arguments);
    }

  })

});

