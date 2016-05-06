define(function (require) {

  'use strict';

  var Backbone = require('backbone');

  var tpl = require('text!ttt/templates/tictactoe.ejs');
  var template = _.template(tpl);

  return Backbone.View.extend({

    // EVENTS -----------------------------------------------

    events: {
      'click table.game td': 'onSquareClick',
      'click i.close': 'remove',
      'click i.restart': 'restart'
    },

    // INITIALIZE -------------------------------------------

    initialize: function(options) {
      this.size = options.size;
      this.gameNum = options.gameNum;
      this.playerCount = options.players
      this.initCore();
    },

    initCore: function() {
      this.player = 1;
      this.grid = [];
      this.locked = false;
      this.win = false;
      this.done = false;
      this.generateGrid();
    },

    generateGrid: function(){
      var gridSize = this.size;
      this.grid = [];
      for (var i=0; i<gridSize; i++) {
        this.grid[i] = [];
        for (var j=0; j<gridSize; j++) {
          this.grid[i][j] = 100; // 100 is the 'blank square' value
        };
      };
    },

    // RENDER ------------------------------------------------

    render: function() {
      this.clearHighlight();
      this.$el.html(template(this.getRenderData()));
      this.$el.addClass('single-game');
      this.showPlayer();
      this.checkEndGame();
      this.checkComputerTakingTurn();
      return this;
    },

    getRenderData: function() {
      return {
        grid: this.grid,
        gameNum: this.gameNum
      }
    },

    checkComputerTakingTurn: function() {
      if (this.playerCount === 1 && this.player === 2 && !this.win) {
        this.showSpinner();
      }
    },

    // CLICK SQUARE -------------------------------------------

    onSquareClick: function(e) {
      // get click target
      var cellRow = $(e.currentTarget).data('row');
      var cellCol = $(e.currentTarget).data('col');

      if (this.win || this.done || (this.locked && this.playerCount == 1) || this.grid[cellRow][cellCol] !== 100) {
        return;
      }
      this.locked = true; // prevent more than one click on game during turn

      // change square
      // if (this.grid[cellRow][cellCol] === 100) {
      this.grid[cellRow][cellCol] = this.player;
      // }

      // win?
      var win = this.checkForWin();
      if (win) {
        this.win = win; // triggers win state upon rerender
      } else {
        this.togglePlayer();
      }

      // autoplay
      if (!this.win && this.playerCount === 1) {
        this.$el.addClass('locked');
        window.setTimeout(function(){
          this.computerTakeTurn();
        }.bind(this), 1500)
      }

      // push state to dom
      this.render();
    },

    hideSpinner: function() {
      this.$('.spinner').css('visibility','hidden');
    },

    showSpinner: function() {
      this.$('.spinner').css('visibility','visible');
    },

    togglePlayer: function() {
      if (this.player == 1) {
        this.player = 2;
      } else {
        this.player = 1;
      }
      this.showPlayer();
    },

    showPlayer: function() {
      var who = '';
      if (this.playerCount === 1) {
        // playing against computer
        if (this.player === 1) {
          who = 'Your turn';
        } else {
          who = "Computer's turn";
        }
      } else {
        // playing against human
        if (this.player === 1) {
          who = "X's turn";
        } else {
          who = "O's turn";
        }
      }
      this.$('.whose-turn').html(who);
    },

    // PLAY VERSUS COMPUTER ------------------------------------------

    computerTakeTurn: function() {
      this.findBlankSquare();
      this.locked = false;
      this.$el.removeClass('locked');

      var win = this.checkForWin();
      if (win) {
        this.win = win;  // triggers win state upon rerender
        this.player = 2; // set it back to the computer to report the win
        this.render();
      }
    },

    gridIsFull: function() {
      var gridSize = this.getGridSize();
      for (var i=0; i<gridSize; i++) {
        for (var j=0; j<gridSize; j++) {
          if (this.grid[i][j] === 100) { // 100 is the 'blank square' value
            return false;
          };
        };
      };
      return true;
    },

    findBlankSquare: function() {
      if (this.gridIsFull()) { return false; }

      var _this = this;
      var _doIt = function() {
        var rnd1 = (Math.floor(Math.random() * _this.size));
        var rnd2 = (Math.floor(Math.random() * _this.size));
        if (_this.grid[rnd1][rnd2] == 100) {
          _this.grid[rnd1][rnd2] = 2; // set 'O' for computer
          _this.togglePlayer();
          _this.render();
          return true;
        } else if(_this.gridIsFull()){
          return false;
        } else {
          _doIt(); // recurse to find a blank
        }
      };
      return _doIt();
    },

    // CHECK FOR WIN ---------------------------------------------

    checkForWin: function() {
      var win = this._checkWin_row();
      if(win) {return win;}

      win = this._checkWin_col();
      if(win) {return win;}

      win = this._checkWin_diagLeft();
      if(win) {return win;}

      win = this._checkWin_diagRight();
      if(win) {return win;}

      return false;
    },

    _checkWin_row: function() {
      var win = false;
      var gridSize = this.getGridSize();
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
      return win;
    },

    _checkWin_col: function() {
      var win = false;
      var gridSize = this.getGridSize();
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
      return win;
    },

    _checkWin_diagLeft: function() {
      var win = false;
      var gridSize = this.getGridSize();
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
      return win;
    },

    _checkWin_diagRight: function() {
      var win = false;
      var gridSize = this.getGridSize();
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

    // GAME OVER ---------------------------------------------

    checkEndGame: function() {
      if (this.win) {
        this.$el.addClass('done');
        this.highlightWin();

      } else if (this.gridIsFull()) {
        this.$el.addClass('done');
        this.$('.whose-turn').html('TIE GAME');
        this.done = true; // tie game
      }
    },

    highlightWin: function() {
      var gridSize = this.getGridSize();
      if (this.win.type.indexOf('diag') < 0) {
        // row or column win
        this.$('td[data-' + this.win.type + '=' + this.win.which + ']').addClass('win')
      } else if(this.win.type === 'diagLeft'){
        // diag-left win
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
      this.showWinner();
    },

    showWinner: function() {
      var who = '';
      if (this.playerCount === 1) {
        // playing against computer
        if (this.player === 1) {
          who = 'YOU WIN!';
        } else {
          who = "THE MACHINE WINS!";
          this.$el.addClass('shame');
        }
      } else {
        // playing against human
        if (this.player === 1) {
          who = "X WINS!";
        } else {
          who = "O WINS!";
        }
      }
      this.$('.whose-turn').html(who);
    },

    // UTILS ---------------------------------------------

    restart: function() {
      this.initCore();
      this.render();
    },

    getGridSize: function() {
      return this.grid.length;
    },

    clearHighlight: function() {
      this.$el.removeClass('done');
      this.$('td').removeClass('win');
    },

    remove: function() {
      this.trigger('close');
      Backbone.View.prototype.remove.apply(this, arguments);
    }

  })

});

