define(function (require) {

  'use strict';

  var Backbone = require('backbone');

  var tpl = require('text!nimbus/templates/tictactoe.ejs');
  var template = _.template(tpl);

  return Backbone.View.extend({

    events: {
      'click table.game td': 'onSquareClick',
      'click i.close': 'remove',
      'click i.restart': 'restart'
    },

    initialize: function(options) {
      this.parent = options.parent;
      // this.state = options.state;
      this.size = options.size
      this.playerCount = options.players
      this.initCore();
    },

    initCore: function() {
      this.player = 1;
      this.grid = [];
      this.win = false;
      this.generateGrid();
    },

    restart: function() {
      this.initCore();
      this.render();
    },

    render: function() {
      this.clearHighlight();
      this.$el.html(template(this.getRenderData()));
      this.checkEndGame();
      return this;
    },

    getRenderData: function() {
      return {
        grid: this.grid,
        gameNum: 99
      }
    },

    togglePlayer: function() {
      if (this.player == 1) {
        this.player = 2;
      } else {
        this.player = 1;
      }
    },

    generateGrid: function(){
      var gridSize = this.size;
      this.grid = [];
      for (var i=0; i<gridSize; i++) {
        this.grid[i] = [];
        for (var j=0; j<gridSize; j++) {
          this.grid[i][j] = 100;
        };
      };
    },

    getGridSize: function() {
      return this.grid.length;
    },

    onSquareClick: function(e) {
      if (this.win) {
        return;
      }
      var cellRow = $(e.currentTarget).data('row');
      var cellCol = $(e.currentTarget).data('col');

      if (this.grid[cellRow][cellCol] === 100) {
        this.grid[cellRow][cellCol] = this.player;
        this.togglePlayer();
      }
      var win = this.checkForWin();
      if (win) {
        this.win = win;
      }
      this.render();

      if (this.playerCount === 1) {
        _.delay(this.computerTakeTurn, 500)
      }
    },

    computerTakeTurn: function() {
      // insert delay
      // find blanks in the grid
      // put an O in a blank space
      // check for win
      console.log ('computers turn')
    },

    checkForWin: function() {
      // console.log(this.grid);
      var gridSize = this.getGridSize();

      // check for row win
      var win = false;
      for (var i=0; i<gridSize; i++) {
        var rowSum = 0;
        for (var j=0; j<gridSize; j++) {
          rowSum += this.grid[i][j];
        };
        if (rowSum === gridSize || rowSum === gridSize*2) {
          win = {
            type: 'row',
            which: i
          };
        }
      };
      if (win) {
        return win;
      }
      // check for column win
      for (var i=0; i<gridSize; i++) {
        var colSum = 0;
        for (var j=0; j<gridSize; j++) {
          colSum += this.grid[j][i];
        };
        if (colSum === gridSize || colSum === gridSize*2) {
          win = {
            type: 'col',
            which: i
          };
        }
      };
      if (win) {
        return win;
      }
      // check for diagonal (left-right) win
      var diagLeftSum = 0;
      for (var i=0; i<gridSize; i++) {
        diagLeftSum += this.grid[i][i];
      };
      if (diagLeftSum === gridSize || diagLeftSum === gridSize*2) {
        win = {
          type: 'diagLeft',
          which: 1
        };
      };
      // check for diagonal (right-left) win
      var diagRightSum = 0;
      var maxPos = gridSize-1;
      var j = 0;
      for (var i=maxPos; i>=0; i--) {
        j = maxPos - i;
        diagRightSum += this.grid[i][j];
      };
      if (diagRightSum === gridSize || diagRightSum === gridSize*2) {
        win = {
          type: 'diagRight',
          which: gridSize-1
        };
      }

      return win;
    },

    checkEndGame: function() {
      if (this.win) {
        this.$el.addClass('done');
        this.highlightWin();
        // alert('Brilliant win by Player ' + this.player);
      }
    },

    highlightWin: function() {
      var gridSize = this.getGridSize();
      if (this.win.type.indexOf('diag') < 0) {
        // row or column win
        this.$('td[data-' + this.win.type + '=' + this.win.which + ']').addClass('win')
      } else if(this.win.type === 'diagLeft'){
        // dialg-left win
        for (var i=0; i<gridSize; i++) {
          this.$('td[data-row="' + i + '"][data-col="' + i + '"]').addClass('win');
        }
      } else if(this.win.type === 'diagRight'){
        // diag-right win
        var maxPos = gridSize-1;
        var j;
        for (var i=maxPos; i>=0; i--) {
          j = maxPos - i;
          this.$('td[data-row="' + i + '"][data-col="' + j + '"]').addClass('win');
        }
      }
    },

    clearHighlight: function() {
      this.$el.removeClass('done');
      this.$('td').removeClass('win');
    },

    remove: function() {
      Backbone.View.prototype.remove.apply(this, arguments);
    }

  })

});

