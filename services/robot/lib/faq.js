var faq = require('../base')();
var Segment = require('segment');
var store = require('../../db');

faq.handle = function (qq, msg, next) {
    if (msg.at.indexOf(qq) == -1) {
        next();
    } else {
        var segment = new Segment();
        segment.useDefault();
        var words = segment.doSegment(msg.content, {
            stripPunctuation: true
        });
        console.info(words);

        var qk = [];
        words.forEach(function (word) {
            qk.push(word.w);
        });
        //console.info(qk);

        var query = new store.Query('PlanFAQ');
        query.select('question', 'answer');
        //query.contains('question', content);
        query.containsAll('keyword', qk);
        query.find().then(function (results) {
            //console.info(results);

            var picCodeReg = new RegExp('<img src=\"([^\"]*)\" [^>]*>', 'img');
            var removeTagReg = /(<[^>]*>)/g;
            var replaceBrReg = /(<\/?br[^>]*>)/g;
            var replacePReg = /(<\/p[^>]*>)/g;
            //(<[^>]+) class=[^ |^>]*([^>]*>)
            var faqCount = results.length;
            if (faqCount > 0) {
                var result = ["已找到" + faqCount + "个相关FAQ"];

                for (var i = 0; i < faqCount; i++) {
                    var answer = results[i].get('answer');
                    //Code 匹配
                    answer = answer.replace(picCodeReg, '[pic url="$1"]');

                    answer = answer.replace(/&nbsp;/g, ' ');
                    answer = answer.replace(replacePReg, '\r\n');
                    answer = answer.replace(replaceBrReg, '\r\n');

                    answer = answer.replace(removeTagReg, '');

                    result.push('Q：' + results[i].get('question'));
                    result.push('A：' + answer.trim('\r\n'));
                }

                next(result.join('\r\n'));
            } else {
                next();
            }
        }, function (error) {
            console.error(error);
            next();
        });
    }
}

module.exports = faq;