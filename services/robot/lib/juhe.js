// https://www.juhe.cn/docs/index/cid/15
var turing = require('../base')();

turing.handle = function (qq, msg, next) {
    if (msg.at.indexOf(qq) == -1) {
        next();
    } else {
        request.post({
                url: 'http://www.tuling123.com/openapi/api',
                form: {
                    "key": "d727ec2ee738b7541b1034656aded884",
                    "info": qq.content,
                    "userid": qq.sender_qq
                }
            }, function (err, httpResponse, body) {
                console.log('图灵API', body);
                if (!err && httpResponse.statusCode == 200) {
                    var r = JSON.parse(body);
                    switch (r.code) {
                        case 100000://文本类
                            res.json({"reply": r.text});
                            break;
                        case 200000://链接类
                            res.json({"reply": r.text + '\r\n' + r.url});
                            break;
                        case 302000://新闻类
                            /*
                             article 新闻标题
                             source 新闻来源
                             icon 新闻图片
                             detailurl 新闻详情链接
                             */
                            res.json({"reply": r.text + '\r\n列表：' + r.list});
                            break;
                        case 308000://菜谱类
                        /*
                         name 菜名
                         info 菜谱信息
                         detailurl 详情链接
                         icon 信息图标
                         */
                        case 313000://儿歌类
                        case 314000://诗词类
                        case 40001://参数key错误
                        case 40002://请求内容info为空
                        case 40004://当天请求次数已使用完
                        case 40007://数据格式异常
                        default:
                            res.json({"reply": "暂不支持你的对话。"});
                            break;
                    }
                }
            }
        );
    }
}

module.exports = turing;