define(function (require) {

  'use strict';

  var Backbone = require('backbone');

  var tpl = require('text!ttt/templates/tictactoe.ejs');
  var template = _.template(tpl);

  return Backbone.View.extend({

    events: {
      'click table.game td': 'onSquareClick',
      'click i.close': 'remove',
      'click i.restart': 'restart'
    },

    initialize: function(options) {
      // console.log ('initialize')
      this.parent = options.parent;
      this.state = options.state;
      this.size = options.size;
      this.gameNum = options.gameNum;
      this.playerCount = options.players
      this.locked = false;
      this.initCore();
    },

    initCore: function() {
      // console.log ('initCore')
      this.player = 1;
      this.grid = [];
      this.win = false;
      this.done = false;
      this.generateGrid();
    },

    restart: function() {
      // console.log ('restart')
      this.initCore();
      this.render();
    },

    render: function() {
      // console.log ('render')
      this.clearHighlight();
      this.$el.html(template(this.getRenderData()));
      this.showPlayer();
      this.checkEndGame();
      return this;
    },

    getRenderData: function() {
      // console.log ('getRenderData')
      return {
        grid: this.grid,
        gameNum: this.gameNum
      }
    },

    togglePlayer: function() {
      // console.log ('togglePlayer')
      if (this.player == 1) {
        this.player = 2;
      } else {
        this.player = 1;
      }
      this.showPlayer();
    },

    showPlayer: function() {
      // console.log ('showPlayer');
      var who;
      if (this.playerCount === 1) {
        // playing against computer
        if (this.player === 1) {
          who = 'Your turn';
        }
        if (this.player === 2) {
          who = "Computer's turn";
        }
      } else {
        if (this.player === 1) {
          who = "X's turn";
        }
        if (this.player === 2) {
          who = "O's turn";
        }
      }
      this.$('.whose-turn').html(who);
    },

    generateGrid: function(){
      // console.log ('generateGrid')
      var gridSize = this.size;
      this.grid = [];
      for (var i=0; i<gridSize; i++) {
        this.grid[i] = [];
        for (var j=0; j<gridSize; j++) {
          this.grid[i][j] = 100; // this is the 'blank square' value
        };
      };
    },

    onSquareClick: function(e) {
      // console.log ('onSquareClick')
      if (this.win || this.done || this.locked) {
        return;
      }
      this.locked = true;

      // get click target
      var cellRow = $(e.currentTarget).data('row');
      var cellCol = $(e.currentTarget).data('col');

      // change square
      if (this.grid[cellRow][cellCol] === 100) {
        this.grid[cellRow][cellCol] = this.player;

      }

      // win?
      var win = this.checkForWin();
      if (win) {
        this.win = win;
      } else {
        this.locked = false;
        this.togglePlayer();
      }

      // autoplay
      if (!this.win && this.playerCount === 1) {
        window.setTimeout(function(){
          this.computerTakeTurn();
        }.bind(this), 750)
      }

      // push state to dom
      this.render();
    },

    // PLAY VERSUS COMPUTER ------------------------------------------

    computerTakeTurn: function() {
      // console.log ('computerTakeTurn');
      this.findBlankSquare();
      this.locked = false;

      var win = this.checkForWin();
      if (win) {
        this.win = win;
        this.player = 2; // set it back to the computer to report the win
        this.render();
      }
    },

    gridIsFull: function() {
      // console.log ('gridIsFull');
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
      // console.log ('findBlankSquare');
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
      // console.log ('checkForWin');

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

    // GAME OVER ---------------------------------------------

    checkEndGame: function() {
      console.log ('checkEndGame win=')
      console.log (this.win)




      if (this.win) {
        this.$el.addClass('done');
        this.highlightWin();
        // alert('Brilliant win by Player ' + this.player);
      } else if (this.gridIsFull()) {
        this.$el.addClass('done');
        this.$('.whose-turn').html('TIE GAME');
        this.done = true;

        console.log ('full with no winner')
      }
      console.log ('player at end: ' + this.player)

    },

    highlightWin: function() {
      console.log ('highlightWin')

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
      this.showWinner();
    },

    showWinner: function() {
      var who;
      if (this.playerCount === 1) {
        // playing against computer
        if (this.player === 1) {
          who = 'YOU WIN!';
        }
        if (this.player === 2) {
          who = "THE MACHINE WINS!";
        }
      } else {
        if (this.player === 1) {
          who = "X WINS!";
        }
        if (this.player === 2) {
          who = "O WINS!";
        }
      }
      this.$('.whose-turn').html(who);
    },

    // UTILS ---------------------------------------------


    getGridSize: function() {
      // console.log ('getGridSize')
      return this.grid.length;
    },

    clearHighlight: function() {
      console.log ('clearHighlight')
      this.$el.removeClass('done');
      this.$('td').removeClass('win');
    },

    remove: function() {
      Backbone.View.prototype.remove.apply(this, arguments);
    }

  })

});

