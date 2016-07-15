var express = require('express');
var nodemailer = require('nodemailer');
var store = require('../services/db');

var router = express.Router();

/* GET users listing. */
router.get('/login(/:sessionToken)?', function (req, res, next) {
    var sessionToken = req.params.sessionToken;
    if (!!sessionToken) {
        req.session.user = {token: sessionToken};
        res.redirect('/');
    } else {
        res.render('user/login', {title: '用户登录'});
    }
});

router.post('/login', function (req, res, next) {

});

router.get('/register', function (req, res, next) {
    res.render('user/register', {title: '用户注册'});
});

router.post('/register/verification-code', function (req, res, next) {
    var vccode = req.body.vccode;
    console.info(vccode);
    if (!req.session.vccode) {
        res.json('请先发送验证码！');
    } else if (vccode == req.session.vccode.code) {
        res.json(true);
    } else if (new Date().getTime() > req.session.vccode.timestamp + 10 * 60 * 1000) {
        delete req.session.vccode;
        res.json('验证码已过期，请重新发送！');
    } else {
        res.json(false);
    }
});

router.post('/register/send-mail', function (req, res, next) {
    var email = req.body.email;

    var vccode = randomVCCode(4);
    req.session.vccode = {code: vccode, timestamp: new Date().getTime()};
    console.info(req.session.vccode);

    var transporter = nodemailer.createTransport({
        "host": "smtp.exmail.qq.com",
        "port": 25,
        "secure": false,
        auth: {
            user: 'liuy03@mysoft.com.cn',
            pass: 'Lyliuyao0816'
        }
    });

    var mailOptions = {
        from: 'SaasCloud验证平台 <liuy03@mysoft.com.cn>', // sender address
        to: email, // list of receivers
        subject: 'SaasCloud验证码', // Subject line
        text: `【SaasCloud】 ${vccode} (动态验证码)，请在10分钟内填写` // plaintext body

    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            res.json({success: false, messgae: error.message, error: error});
        } else {
            res.json({success: true, messgae: info.response});
        }
    });
});

function randomVCCode(num) {
    var result = [];
    for (var i = 0; i < num; i++) {
        result.push(Math.floor(Math.random() * 10));
    }
    return result.join('');
}

module.exports = router;
