var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var session = require('express-session');
var fileStore = require('session-file-store')(session);
var passport = require('passport');
var authenticate = require('./authenticate')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require("./routes/dishRouter")
var promoRouter = require("./routes/promoRouter")
var leaderRouter = require("./routes/leaderRouter")
var uploadRouter = require("./routes/uploadRouter")
var favoriteRouter = require('./routes/favoriteRouter')
var commentRouter = require('./routes/commentRouter')
var config = require('./Config/keys')
const Dishes = require('./models/dishes');
const { use } = require('./routes/index');
const url = config.mongoUrl;

mongoose.connect(url, { useFindAndModify: false, useNewUrlParser: true, useUnifiedTopology: true })
	.then((db) => { console.log("Connected to conFusion"); })
	.catch((err) => { console.log(err); })

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



app.use(passport.initialize())

app.use('/feedback', indexRouter);
app.use('/users', usersRouter);


app.use("/dishes", dishRouter)
app.use("/promotions", promoRouter)
app.use("/leaders", leaderRouter)
app.use("/imageUpload", uploadRouter)
app.use("/favorites", favoriteRouter)
app.use('/comments', commentRouter)



if (process.env.NODE_ENV === 'production') {

	console.log('React static files');
	// Serve any static files
	app.use(express.static(path.join(__dirname, 'client/build')));
	// Handle React routing, return all requests to React app
	app.get('*', function (req, res) {
		res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
	});
}
else {
	app.use(express.static(path.join(__dirname, 'public')));
}


// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});


module.exports = app;
