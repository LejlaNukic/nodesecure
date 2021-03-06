var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var helmet = require('helmet');
var csrf = require('csurf');
var validator = require('express-validator');
var hpp = require('hpp');

var index = require('./routes/index');
var users = require('./routes/users');
var auth = require('./routes/authentication');
var cookietest = require('./cookietest');
var cookieAuthentication = require('./middleware/cookieAuthentication');
var authority = require('./middleware/authorize');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//security modules
app.use(helmet());
app.use(hpp());
/*
app.use(helmet.contentSecurityPolicy({
  directives:{
    defaultSrc:["'self'"],
    styleSrc:["'self'"]/*,
    scriptSrc:["'self'"]
  }
}));*/
app.use(csrf({cookie:true}));
app.use( function( req, res, next ) {
  res.locals._csrf = req.csrfToken() ;
  next() ;
} ) ;
app.use(validator());
app.use(function(req, res, next) {
  for (var item in req.body) {
    req.sanitize(item).escape();
  }
  console.log(req.body);
  next();
});




app.use(authority);
app.use('/', index);

app.use('/auth', auth);
/*
app.use(function (req, res, next) {
  // check if client sent cookie
  var cookie = req.cookies.cookieName;
  if (cookie === undefined)
  {
    // no: set a new cookie
    var randomNumber=Math.random().toString();
    randomNumber=randomNumber.substring(2,randomNumber.length);
    res.cookie('cookieName',"amar"+randomNumber, { maxAge: 900000, httpOnly: true });
    console.log('cookie created successfully');
  } 
  else
  {
    // yes, cookie was already present 
    console.log('cookie exists', cookie);
  } 
  next(); // <-- important!
});*/

app.use('/cookietest',cookietest);

app.use(cookieAuthentication);
app.use('/', users);
/*
app.use((req,res,next)=>{
  res.locals.user=req.user;
  next();
});*/

app.get('/nemoze',function(req,res){
  res.status(200).send("logovani ste");
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
