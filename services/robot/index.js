var robot = function (tenant) {
    var services = [];
    var serviceNames = [];

    this.use = function (service) {
        serviceNames.push(service);
        services.push(require('./lib/' + service));
    }

    this.response = function (request, next) {
        console.info(request);

        var count = services.length;
        var responses = [];
        var proxy = function (response) {
            if (response !== undefined) {
                responses.push(response);
            }

            //console.info('插件剩余：', count)
            if (--count <= 0) {
                next(responses);
            }
        }

        if (request.content.startsWith('--')) {
            //command
            var command = request.content.split(' ')[0].substr(2);
            services.forEach(function (service) {
                if (!!service.commands[command]) {
                    service.commands[command](request, proxy);
                } else {
                    proxy.apply(this, []);
                }
            });
        } else {
            services.forEach(function (service, i) {
                var start = new Date().getTime();
                var callback = function () {
                    var end = new Date().getTime();
                    if (!!timeLimit) {
                        clearTimeout(timeLimit);
                        proxy.apply(this, arguments);
                    }

                    //TODO: 记录时间
                    var serviceName = serviceNames[i];
                    console.info(serviceName, end - start);
                };
                var timeLimit = setTimeout(function () {
                    timeLimit = null;
                    proxy.apply(this, []);
                }, 3000);

                service.handle(tenant, request, callback);
            });
        }
    }

    this.useDefault = function () {
        this.use('help');
        this.use('coach');
        this.use('faq');
        //this.use('api.ai');
        //this.use('turing');
    }
}

module.exports = robot;