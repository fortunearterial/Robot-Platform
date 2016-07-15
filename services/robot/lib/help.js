var help = require('../base')();

help.commands.help = function (request, next) {
    next([
        //'欢迎使用机器人帮助文档',
        '--help　　查看帮助'
    ].join('\r\n'));
}

module.exports = help;