var express = require('express');
var Segment = require('segment');
var store = require('../services/db');

var router = express.Router();

/* GET robot listing. */
router.get('/', function (req, res, next) {
    res.render("robot/index", {title: '机器人管理'});
});

router.get('/faq', function (req, res, next) {
    var query = new store.Query('PlanFAQ');
    query.find().then(function (results) {
        var model = [];

        for (var i = 0, len = results.length; i < len; i++) {
            model.push(toJSON(results[i]));
        }

        res.render("robot/faq", {title: 'FAQ', model: model});
    }, function (error) {
        res.status(500).send(error);
    });
});

router.get('/faq/add', function (req, res, next) {
    res.render("robot/faq_edit", {title: '添加 FAQ', model: toJSON()});
});

router.get('/faq/edit/:id', function (req, res, next) {
    var query = new store.Query('PlanFAQ');
    query.get(req.params.id).then(function (data) {
        res.render("robot/faq_edit", {title: '修改 FAQ', model: toJSON(data)});
    }, function (error) {
        res.status(404).send(error);
    });

});

router.post('/faq/edit/segment', function(req, res, next){
    var segment = new Segment();
    segment.useDefault();
    var words = segment.doSegment(req.body.word,{
        stripPunctuation: true,
        simple: true
    });

    res.json(words);
});

router.post('/faq/edit/file', function(req, res, next){
    var data = { base64: req.body.base64 };
    var file = new store.File(req.body.filename, data);
    file.save().then(function (savedFile) {
        res.json({
            id: savedFile.id,
            url: savedFile.get('url')
        });
    }, function (error) {
    });
});

router.get('/faq/detail/:id', function (req, res, next) {
    var query = new store.Query('PlanFAQ');
    query.get(req.params.id).then(function (data) {
        res.render("robot/faq_detail", {title: '查看 FAQ', model: toJSON(data)});
    }, function (error) {
        res.status(404).send(error);
    });
});

function toJSON(faq) {
    var json = {};
    json.id = faq ? faq.id : '';
    json.question = faq ? faq.get('question') : '';
    json.keyword = faq ? faq.get('keyword') : '';
    json.answer = faq ? faq.get('answer') : '';
    json.questioner = faq ? faq.get('questioner') : '';
    json.answerer = faq ? faq.get('answerer') : '';
    json.recorder = faq ? faq.get('recorder') : '';
    json.createdAt = faq ? faq.createdAt : '';
    json.updatedAt = faq ? faq.updatedAt : '';
    return json;
}

module.exports = router;