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
      this.subviews = [];
    },

    render: function() {
      this.$el.html(template(this));
      $('body').addClass('tictactoe-body');
      return this;
    },

    launchNewGame: function() {
      var size = this.$('input#game-size').val() || 3;
      var playerCount = this.$('select#players').val() || 2;
      var ttt = new TicTacToe({
        size: size,
        players: +playerCount
      });
      this.$('.games-container').append(ttt.render().el);
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

