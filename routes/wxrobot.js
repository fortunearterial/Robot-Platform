var fs = require('fs');
var express = require('express');
var process = require('child_process');
var socket = require('../socket');
var store = require('../services/db');

var router = express.Router();

/* GET robot listing. */
router.get('/', function (req, res, next) {
    res.render("wxrobot/index", {title: '微信机器人'});
});

router.get('/plug-into', function (req, res, next) {
    socket.of('/wxrobot').on('connection', function () {

    });
    res.render("wxrobot/plug_into", {title: '微信机器人接入'});
});

router.get('/cancel/:wx', function (req, res, next) {
    var wx = req.params.wx;
    process.exec('docker rm -f wxbot-' + wx);
    res.send("success");
});

router.get('/plug-into/:wx', function (req, res, next) {
    var wx = req.params.wx;
    var nsp = socket.of('/wxrobot');

    var port = randomPort();
    var cmd = [
        'docker run',
        '-i -t',
        '--name wxbot-' + wx,
        '--env PORT=5000',
        `--env POST_API=http://10.5.103.65:3000/api/wxrobot/${wx}/${port}`,
        '-p ' + port + ':5000',
        '-v /tmp:/tmp',
        '-d sjdy521/mojo-weixin',
        ';',
        'docker attach --no-stdin wxbot-' + wx,
        ';',
        'docker rm -f wxbot-' + wx
    ].join(' ');
    //console.info(cmd);

    var run = process.exec(cmd.split(';')[0]);
    run.on('close', (code) => {
        console.info('docker run end...');

        res.send('success');

        var attach = process.exec(cmd.split(';')[1]);
        attach.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
            nsp.emit('data', data);

            if (data.indexOf(`二维码已下载到本地[ /tmp/mojo_weixin_qrcode_default.jpg ]`) != -1) {
                var file = `/tmp/mojo_weixin_qrcode_default.jpg`;
                var bitmap = fs.readFileSync(file);
                var base64 = new Buffer(bitmap).toString('base64');
                nsp.emit('qrcode.ready', base64);
            }

            if (data.indexOf('手机微信扫码成功，请在手机微信上点击 [登录] 按钮...') != -1) {
                nsp.emit('qrcode.success', '');
            }

            if (data.indexOf(`微信登录成功`) != -1) {
                nsp.emit('login.success', wx);
                nsp.emit('success', wx);
            }
        });

        attach.stderr.on('data', (data) => {
            //console.log(`stderr: ${data}`);
            nsp.emit('error', data);
        });

        attach.on('close', (code) => {
            //console.log(`child process exited with code ${code}`);
            nsp.emit('close', `child process exited with code ${code}`);
        });
    });
});

function randomPort() {
    var port = 1024 + Math.floor(Math.random() * (5000 - 1024)); //生成一个1024~5000的端口号
    // TODO:检查重复
    return port;
}

module.exports = router;