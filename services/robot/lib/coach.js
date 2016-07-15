var coach = require('../base')();
var store = require('../../db');

coach.commands.coach = function (msg, next) {
    var PlanFAQ = store.Object.extend('PlanFAQ');

    var indexQ = msg.content.indexOf('问题');
    var indexK = msg.content.indexOf('关键字');
    var indexA = msg.content.indexOf('答案');

    var planFAQ = new PlanFAQ();
    planFAQ.set('question', msg.content.substr(indexQ + 3, indexK - indexQ - 3));
    planFAQ.set('keyword', msg.content.substr(indexK + 4, indexA - indexK - 4).split(/,;，；/g));
    planFAQ.set('answer', msg.content.substr(indexA + 3));
    planFAQ.set('questioner', '');
    planFAQ.set('answerer', '');
    planFAQ.set('recorder', msg.sender);

    planFAQ.save().then(function (serverItem) {
        next('我记住了');
    }, function (error) {
        console.error(error);
        next('太难理解了，我记不住');
    });
}

coach.commands.help = function (request, next) {
    next([
        '--coach 　教机器人一个FAQ，格式如下',
        '　　　　　@机器人 --coach',
        '　　　　　问题：xxxxxx',
        '　　　　　关键字：xxx1,xxx2',
        '　　　　　答案：xxxxxxxxxxxx'
    ].join('\r\n'));
}

module.exports = coach;