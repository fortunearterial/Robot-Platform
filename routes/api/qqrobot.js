var express = require('express');
var request = require('request')
var Robot = require('../../services/robot/index')

var router = express.Router();

/* GET robot listing. */
router.post('/:qq/:port', function (req, res, next) {
    console.info(JSON.stringify(req.body));
    var qq = req.body;
    // https://github.com/sjdy521/Mojo-Webqq/blob/master/API.md#11-自定义接收消息上报地址

    var content = qq.content.trim();
    request.get({
        url: `http://10.5.103.65:${req.params.port}/openqq/get_group_info`
    }, function (err, httpResponse, body) {
        //console.info(`http://10.5.103.65:${req.params.port}/openqq/get_group_info`, body);
        if (!err && httpResponse.statusCode == 200) {
            //console.info(body);
            var qqgroups = JSON.parse(body);
            var qqgroup;
            for (var i = 0, len = qqgroups.length; i < len; i++) {
                if (qqgroups[i].gnumber == qq.gnumber) {
                    qqgroup = qqgroups[i];
                    break;
                }
            }
            //console.info(JSON.stringify(qqgroup));

            var members = qqgroup.member;
            var atMembers = [];
            //console.info(members);
            for (var i = 0, len = members.length; i < len; i++) {
                var reg = new RegExp('@' + (members[i].card || members[i].nick) + '([ ]?)', 'img');
                if (reg.test(content)) {
                    atMembers.push(members[i].qq);
                    content = content.replace(reg, '').trim();
                }
            }

            var robot = new Robot(req.params.qq);
            robot.useDefault();
            robot.response({
                sender: qq.sender_qq,
                content: content,
                at: atMembers
            }, function (msg) {
                console.info(msg);
                if (msg.length > 0) {
                    var msgs = msg.join('\r\n');
                    var picCodeReg = new RegExp("\\[pic url=\"([^\"]*)\"\\]", 'ig');
                    var msgs = msg.join('\r\n').replace(picCodeReg, '$1');
                    res.json({"reply": msgs});
                } else {
                    res.json({"code": 0});
                }
            });
        } else {
            res.json({"code": 0});
        }
    });
});

router.get('/keepalive', function (req, res, next) {
    //{"content":"111","discuss":"牧狮草、封神传奇3、robot QQ","discuss_id":"3798689272","msg_class":"recv","msg_id":"2","msg_time":"1468063078","receiver":"robot QQ","receiver_id":"1018482312","receiver_qq":1018482312,"sender":"牧狮草","sender_id":"2579311295","sender_qq":176788304,"type":"discuss_message"}
    setInterval(function () {
        request.post({
            url: 'http://10.5.103.65:5000/openqq/send_discuss_message',
            form: {
                did: "3798689272",
                content: "keepalive"
            }
        })
    }, 180 * 1000);
});

module.exports = router;