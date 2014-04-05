var hoek = require('hoek');
var path = require('path');

// Declare internals

var internals = {};


// Defaults

internals.defaults = {
    whitelist: []
};

// Version
internals.version = hoek.loadPackage(path.join(__dirname, '..')).version;

exports.register = function(plugin, options, next) {
    plugin.expose('forwardHandler', function (handler) {
        internals.handler = handler;
    });

    function shouldForward(request) {
        if (internals.handler && request.response.output && request.response.output.statusCode == 404) {
            return !options.whitelist.reduce(function (previousValue, currentValue) {
                return previousValue || currentValue.test(request.path);
            }, false);
        }
    }

    plugin.ext('onPreResponse', function (request, extNext) {
        if (shouldForward(request)) {
            internals.handler(request, extNext);
        } else {
            extNext();
        }
    });
    next();
};