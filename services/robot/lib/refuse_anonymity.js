//{"content":"１２３ｔｅｓｔ","gnumber":459147492,"group":"计划SaaS团队","group_id":"3411685226","msg_class":"recv","msg_id":"25146","msg_time":"1468245116","receiver":"robot QQ","receiver_id":"1018482312","receiver_qq":1018482312,"sender":"昵称未知","sender_id":"3357871820","sender_qq":80000000,"type":"group_message"}
var refuse_anonymity = require('../base')();

refuse_anonymity.handle = function (tenant, request, next) {
    if (request.sender == '80000000')
        next('匿名等于耍流氓');
    else
        next();
}

module.exports = refuse_anonymity;