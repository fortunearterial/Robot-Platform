function base() {
    var api = {};

    api.commands = {};

    api.handle = function (tenant, request, next) {
        next();
    }

    return api;
}

module.exports = base;