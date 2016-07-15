var fs = require('fs');
var express = require('express');
var process = require('child_process');
var socket = require('../socket');
var store = require('../services/db');

var router = express.Router();

/* GET robot listing. */
router.get('/', function (req, res, next) {
    res.render("qqrobot/index", {title: 'QQ机器人'});
});

router.get('/plug-into', function (req, res, next) {
    socket.of('/qqrobot').on('connection', function () {

    });
    res.render("qqrobot/plug_into", {title: 'QQ机器人接入'});
});

router.get('/cancel/:qq', function (req, res, next) {
    var qq = req.params.qq;
    process.exec('docker rm -f qqbot-' + qq);
    res.send("success");
});

router.get('/plug-into/:qq', function (req, res, next) {
    var qq = req.params.qq;
    var nsp = socket.of('/qqrobot');

    var port = randomPort();
    var cmd = [
        'docker run',
        '-i -t',
        '--name qqbot-' + qq,
        '--env QQ=' + qq,
        '--env PORT=5000',
        `--env POST_API=http://10.5.103.65:3000/api/qqrobot/${qq}/${port}`,
        '-p ' + port + ':5000',
        '-v /tmp:/tmp',
        '-d sjdy521/mojo-webqq',
        ';',
        'docker attach --no-stdin qqbot-' + qq,
        ';',
        'docker rm -f qqbot-' + qq
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

            //1b3d2d145200215637a98bc08c12de7f1e21e2f7c93a7d7989d420ec00bacf18
            if (data.indexOf(`二维码已下载到本地[ /tmp/mojo_webqq_qrcode_${qq}.png ]`) != -1){
                var file = `/tmp/mojo_webqq_qrcode_${qq}.png`;
                var bitmap = fs.readFileSync(file);
                var base64 = new Buffer(bitmap).toString('base64');
                nsp.emit('qrcode.ready', base64);
            }

            if (data.indexOf('手机QQ扫码成功，请在手机上点击[允许登录smartQQ]按钮...') != -1){
                nsp.emit('qrcode.success', '');
            }

            if (data.indexOf('实际登录帐号和程序预设帐号不一致') != -1){
                nsp.emit('login.fail', `请使用${qq}进行二维码扫描`);
                nsp.emit('fail', qq);
            }

            if (data.indexOf(`帐号(${qq})登录成功`) != -1){
                nsp.emit('login.success', qq);
                nsp.emit('success', qq);
            }

            if (data.indexOf('客户端停止运行') != -1){
                process.exec(cmd.split(';')[2]);
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