var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var Auth0Strategy = require('passport-auth0');

var config = require('./config');
var routes = require('./routes');

// This will configure Passport to use Auth0
var strategy = new Auth0Strategy(
  config.auth0,
  (accessToken, refreshToken, extraParams, profile, done) => {
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user
    return done(null, profile);
  });

passport.use(strategy);

// you can use this section to keep a smaller payload
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

var app = express();

app.use(logger('combined'));
app.use(cookieParser());
app.use(session(config.session));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler

app.use(function(err, req, res, next) {
  response = { 'error': err.message };

  // development error handler include details (e.g. stacktrace)
  if (app.get('env') === 'development') {
    response['details'] = err;
  }

  res.status(err.status || 500);
  res.set('Content-Type', 'application/json');
  res.send(JSON.stringify(response));
});


module.exports = app;
