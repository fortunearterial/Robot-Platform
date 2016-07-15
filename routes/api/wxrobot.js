var express = require('express');
var request = require('request')
var Robot = require('../../services/robot/index')

var router = express.Router();

/* GET robot listing. */
router.post('/:wx/:port', function (req, res, next) {
    console.info(JSON.stringify(req.body));
    var wx = req.body;
    // https://github.com/sjdy521/Mojo-Weixin/blob/master/API.md

    if (wx.post_type == 'receive_message') {
        if (wx.format == 'text') {
            request.get({
                url: `http://10.5.103.65:${req.params.port}/openwx/get_user_info`
            }, function (err, httpResponse, body) {
                if (!err && httpResponse.statusCode == 200) {
                    var _me = JSON.parse(body).id;

                    var content = wx.content.trim();
                    request.get({
                        url: `http://10.5.103.65:${req.params.port}/openwx/get_group_info`
                    }, function (err, httpResponse, body) {
                        //console.info(`http://10.5.103.65:${req.params.port}/openwx/get_group_info`, body);
                        if (!err && httpResponse.statusCode == 200) {
                            //console.info(body);
                            var wxgroups = JSON.parse(body);
                            var wxgroup;
                            for (var i = 0, len = wxgroups.length; i < len; i++) {
                                if (wxgroups[i].id == wx.group_id) {
                                    wxgroup = wxgroups[i];
                                    break;
                                }
                            }
                            //console.info(JSON.stringify(wxgroup));

                            var members = wxgroup.member;
                            var atMembers = [];
                            //console.info(members);
                            for (var i = 0, len = members.length; i < len; i++) {
                                var reg = new RegExp('@' + (members[i].displayname || members[i].name) + '([ ]?)', 'img');
                                if (reg.test(content)) {
                                    atMembers.push(members[i].id);
                                    content = content.replace(reg, '').trim();
                                }
                            }

                            var robot = new Robot(_me);
                            robot.useDefault();
                            robot.response({
                                sender: wx.sender_id,
                                content: content,
                                at: atMembers
                            }, function (msg) {
                                //console.info(msg);
                                if (msg.length > 0) {
                                    var medias = [];
                                    var picCodeReg = new RegExp("\\[pic url=\"([^\"]*)\"\\]", 'ig');
                                    var msgs = msg.join('\r\n').replace(picCodeReg, function (macth, $1, pos, str) {
                                        medias.push($1);
                                        return '[图片]';
                                    });
                                    medias.forEach(function (media) {
                                        sendMediaToGroup(req.params.port, wx.group_id, media);
                                    });

                                    res.json({"reply": msgs});
                                } else {
                                    res.json({"code": 0});
                                }
                            });
                        } else {
                            res.json({"code": 0});
                        }
                    });
                } else {
                    res.json({"code": 0});
                }
            });
        } else if (wx.format == 'media') {
            res.json({"code": 0});
        } else {
            res.json({"code": 0});
        }
    } else if (wx.post_type == 'send_message') {
        res.json({"code": 0});
    } else {
        res.json({"code": 0});
    }

});

function sendMediaToGroup(port, group_id, media) {
    request.post({
        url: `http://10.5.103.65:${port}/openwx/send_group_message`,
        form: {
            id: group_id,
            media_path: media
        }
    }, function (err, httpResponse, body) {
        if (!err && httpResponse.statusCode == 200) {

        }
    });
}

router.get('/keepalive', function (req, res, next) {
    //{"content":"111","discuss":"牧狮草、封神传奇3、robot wx","discuss_id":"3798689272","msg_class":"recv","msg_id":"2","msg_time":"1468063078","receiver":"robot wx","receiver_id":"1018482312","receiver_wx":1018482312,"sender":"牧狮草","sender_id":"2579311295","sender_wx":176788304,"type":"discuss_message"}
    setInterval(function () {
        request.post({
            url: 'http://10.5.103.65:5000/openwx/send_discuss_message',
            form: {
                did: "3798689272",
                content: "keepalive"
            }
        })
    }, 180 * 1000);
});

module.exports = router;