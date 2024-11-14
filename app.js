var createError = require('http-errors');
var express = require('express');
var path = require('path');

var app = express();

var indexController = require('./index');
var userController = require('./routes/user');
var bandController = require('./routes/band');
var songController = require('./routes/song');
var eventController = require('./routes/event');
var assistanceController = require('./routes/assistance');
var instrumentsController = require('./routes/instruments');

app.use('/', indexController);
app.use('/users', userController);
app.use('/bands', bandController);
app.use('/songs', songController);
app.use('/events', eventController);
app.use('/assistances', assistanceController);
app.use('/instruments', instrumentsController);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});
  
// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;