'use strict';

var sockjs = require('sockjs');
var kraken = require('kraken-js'),
    app = {};
var hub = require('./lib/hub');
hub.sockjs_pool = [];


app.configure = function configure(nconf, next) {
    // Async method run on startup.
    nconf.set('port', Number(process.env.PORT || 5000));
    next(null);
};


app.requestStart = function requestStart(server) {
    // Run before most express middleware has been registered.
};


app.requestBeforeRoute = function requestBeforeRoute(server) {
    // Run before any routes have been added.
};


app.requestAfterRoute = function requestAfterRoute(server) {
    // Run after all routes have been added.
};


if (require.main === module) {
    var k = kraken.create(app);

    k.listen(function (err) {
        if (err) {
            console.error(err.stack);
        } else {
            var http = k.app.get('kraken:server');
            var sockjs_opts = {sockjs_url: 'http://cdn.sockjs.org/sockjs-0.3.min.js'};
            var sockjs_echo = sockjs.createServer(sockjs_opts);
            sockjs_echo.on('connection', function(conn) {
                hub.sockjs_pool.push(conn);
                conn.on('data', function(message) {
                    hub.sockjs_pool.forEach(function(con) {
                        con.write(message);
                    });
                });
            });
            sockjs_echo.installHandlers(http, {prefix:'/echo'});
        }
    });
}


module.exports = app;
