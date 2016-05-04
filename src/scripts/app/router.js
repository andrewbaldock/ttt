define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    var ContainerView = require('app/views/container');
    var State = require('app/models/state');

    var AppRouter = Backbone.Router.extend({
        routes: {
            '':          'tictactoe',
            'tictactoe': 'tictactoe',
        },

        initialize: function(){
            if (!this.state) {
                this.state = new State();
            }
            if (!this.container) {
                this.container = new ContainerView({state: this.state});
            }
        },

        tictactoe: function() {
            this.container.render();
            this.state.set('view', 'tictactoe');
        },

    });

    return new AppRouter();
});
