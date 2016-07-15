var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var robot = require('./routes/robot');
var oauths = require('./routes/auth/oauth2.0');
var qqrobot = require('./routes/qqrobot');
var wxrobot = require('./routes/wxrobot');
var qqrobot_api = require('./routes/api/qqrobot');
var wxrobot_api = require('./routes/api/wxrobot');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({extended: false, limit: '5mb'}));
app.use(cookieParser('projectsaas'));
app.use(session({
    secret: 'projectsaas',
    name: 'saas.net',
    cookie: {maxAge: 20 * 60 * 1000},
    resave: false,
    saveUninitialized: true
}));
app.use(require('node-sass-middleware')({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true,
    sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/', oauths);
app.use('/', users);
app.use('/robot', robot);
app.use('/qqrobot', qqrobot);
app.use('/wxrobot', wxrobot);
app.use('/api/qqrobot', qqrobot_api);
app.use('/api/wxrobot', wxrobot_api);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
